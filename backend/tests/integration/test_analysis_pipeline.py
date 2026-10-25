"""The analysis task end to end against PostgreSQL. The repository is a local
git repo cloned over file://, so no network is needed."""

from collections.abc import Callable, Iterator
from contextlib import contextmanager
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from git import Actor, Repo
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.constants import JobState, RepositoryStatus
from app.db.relational.models import AnalysisJob, File, GraphEdge, Repository
from app.workers.tasks import analyze_repository as task

SOURCES = {
    "pkg/__init__.py": "",
    "pkg/core.py": "import os\n\ndef run(): pass\n",
    "pkg/cli.py": "from pkg import core\n",
    "README.md": "# demo\n",
}


@pytest.fixture
def source_repo(tmp_path: Path) -> tuple[str, str]:
    root = tmp_path / "source"
    repo = Repo.init(root)
    for rel, text in SOURCES.items():
        (root / rel).parent.mkdir(parents=True, exist_ok=True)
        (root / rel).write_text(text)
    repo.index.add(list(SOURCES))
    me = Actor("Test", "test@example.com")
    commit = repo.index.commit("initial", author=me, committer=me)
    return f"file://{root}", commit.hexsha


@pytest.fixture
def client(sign_up: Callable[..., TestClient]) -> TestClient:
    return sign_up()


@pytest.fixture
def submit(
    client: TestClient,
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> Callable[[str], tuple[int, int]]:
    """Queue a repository through the API, point it at `url`, and make the
    task use the test database. Returns (repository_id, job_id)."""

    @contextmanager
    def test_scope() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    monkeypatch.setattr(task, "session_scope", test_scope)
    monkeypatch.setattr(settings, "repo_storage_path", tmp_path / "clones")

    def _submit(url: str) -> tuple[int, int]:
        # The API only accepts http(s) and git@ URLs, so swap in the local one.
        job = client.post(
            "/api/v1/repositories", json={"source_url": "https://example.com/a/b"}
        ).json()
        with session_factory.begin() as session:
            session.get(Repository, job["repository_id"]).source_url = url
        return job["repository_id"], job["id"]

    return _submit


def _run(repository_id: int, job_id: int) -> dict:
    return task.analyze_repository(repository_id=repository_id, job_id=job_id)


def test_a_successful_run_saves_files_edges_and_scores(
    submit: Callable[[str], tuple[int, int]],
    source_repo: tuple[str, str],
    session_factory: sessionmaker[Session],
) -> None:
    url, commit = source_repo
    repository_id, job_id = submit(url)

    assert _run(repository_id, job_id) == {"ok": True}
    assert _run(repository_id, job_id) == {"ok": True}  # re-analysis replaces

    with session_factory() as session:
        repository = session.get(Repository, repository_id)
        job = session.get(AnalysisJob, job_id)
        files = {f.path: f for f in session.scalars(select(File))}
        path_of = {f.id: f.path for f in files.values()}
        edges = {
            (path_of[e.source_file_id], path_of[e.target_file_id])
            for e in session.scalars(select(GraphEdge))
        }

    assert repository.status == RepositoryStatus.READY
    assert repository.last_analyzed_commit == commit
    assert (job.state, job.stage) == (JobState.SUCCEEDED, "rank")
    assert job.error_message is None
    assert sorted(files) == sorted(SOURCES)
    score = {path: f.importance_score for path, f in files.items()}
    assert score["README.md"] == 0.0
    assert score["pkg/cli.py"] == 1.0  # boosted entry point
    assert score["pkg/core.py"] > score["pkg/__init__.py"]
    assert edges == {("pkg/cli.py", "pkg/core.py")}


def test_a_clone_failure_fails_the_job_with_a_plain_message(
    submit: Callable[[str], tuple[int, int]],
    session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    repository_id, job_id = submit(f"file://{tmp_path}/missing")

    assert _run(repository_id, job_id)["ok"] is False

    with session_factory() as session:
        job = session.get(AnalysisJob, job_id)
        assert session.get(Repository, repository_id).status == RepositoryStatus.FAILED
    assert job.state == JobState.FAILED
    assert job.error_message.startswith("Could not clone")


def test_a_crash_mid_pipeline_fails_the_job_instead_of_leaving_it_running(
    submit: Callable[[str], tuple[int, int]],
    source_repo: tuple[str, str],
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def boom(_: object) -> None:
        raise RuntimeError("bug")

    monkeypatch.setattr(task, "parse_files", boom)
    repository_id, job_id = submit(source_repo[0])

    assert _run(repository_id, job_id)["ok"] is False

    with session_factory() as session:
        job = session.get(AnalysisJob, job_id)
    assert (job.state, job.stage) == (JobState.FAILED, "parse")
    assert job.error_message == task.UNEXPECTED_FAILURE


def test_the_graph_endpoint_returns_ranked_files_and_edges(
    submit: Callable[[str], tuple[int, int]],
    source_repo: tuple[str, str],
    client: TestClient,
) -> None:
    url, commit = source_repo
    repository_id, job_id = submit(url)
    graph_url = f"/api/v1/graph/repository/{repository_id}"

    before = client.get(graph_url).json()
    _run(repository_id, job_id)
    graph = client.get(graph_url).json()

    assert (before["commit"], before["files"], before["edges"]) == (None, [], [])
    assert graph["commit"] == commit
    files = {f["path"]: f for f in graph["files"]}
    assert graph["files"][0]["path"] == "pkg/cli.py"  # most important first
    assert graph["files"][-1]["importance_score"] == 0.0
    assert files["pkg/core.py"]["imported_by"] == 1
    assert files["pkg/cli.py"]["imports"] == 1
    assert graph["edges"] == [
        {"source": files["pkg/cli.py"]["id"], "target": files["pkg/core.py"]["id"]}
    ]


# --- deleting ------------------------------------------------------------------


def test_deleting_removes_the_analysis_and_the_clone(
    submit: Callable[[str], tuple[int, int]],
    source_repo: tuple[str, str],
    client: TestClient,
    session_factory: sessionmaker[Session],
) -> None:
    repository_id, job_id = submit(source_repo[0])
    _run(repository_id, job_id)
    clone = settings.repo_storage_path / str(repository_id)
    assert clone.is_dir()

    assert client.delete(f"/api/v1/repositories/{repository_id}").status_code == 204

    assert client.get(f"/api/v1/repositories/{repository_id}").status_code == 404
    assert client.get("/api/v1/repositories").json()["total"] == 0
    assert not clone.exists()
    with session_factory() as session:
        for model in (AnalysisJob, File, GraphEdge):
            assert session.scalar(select(model).limit(1)) is None


def test_you_cannot_delete_another_users_repository(
    submit: Callable[[str], tuple[int, int]],
    sign_up: Callable[..., TestClient],
    client: TestClient,
) -> None:
    repository_id, _ = submit("https://example.com/a/b")
    grace = sign_up("grace@example.com")

    assert grace.delete(f"/api/v1/repositories/{repository_id}").status_code == 404
    assert client.get(f"/api/v1/repositories/{repository_id}").status_code == 200


def test_deleting_cancels_an_unfinished_analysis(
    submit: Callable[[str], tuple[int, int]],
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    revoked: list[list[str]] = []
    monkeypatch.setattr(
        task.celery_app.control, "revoke", lambda ids, **_: revoked.append(ids)
    )
    repository_id, _ = submit("https://example.com/a/b")  # queued, never run

    client.delete(f"/api/v1/repositories/{repository_id}")

    assert revoked == [["test-task"]]


def test_a_repository_deleted_mid_analysis_gets_nothing_saved(
    submit: Callable[[str], tuple[int, int]],
    source_repo: tuple[str, str],
    client: TestClient,
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    repository_id, job_id = submit(source_repo[0])
    real_parse = task.parse_files

    def delete_then_parse(inventory: object) -> object:
        # The cancel "missed": the task keeps going after the delete.
        monkeypatch.setattr(task.celery_app.control, "revoke", lambda *a, **k: None)
        client.delete(f"/api/v1/repositories/{repository_id}")
        return real_parse(inventory)

    monkeypatch.setattr(task, "parse_files", delete_then_parse)

    assert _run(repository_id, job_id) == {"ok": False, "reason": "repository deleted"}
    assert not (settings.repo_storage_path / str(repository_id)).exists()
    with session_factory() as session:
        assert session.scalar(select(File).limit(1)) is None
