"""The analysis task: clone, parse, build the import graph, rank, save.

Stages M1–M4 run for real. Embedding, tours, and explanations (M5–M6) are not
built yet, so a job succeeds after ranking; the UI shows those stages as not
reached. Each stage is recorded on the job as it starts, so a failure shows
where it happened.
"""

import shutil
from dataclasses import dataclass
from pathlib import Path

import networkx as nx

from app.core.config import settings
from app.core.constants import JobState, RepositoryStatus
from app.core.exceptions import AnalysisError
from app.core.logging import get_logger
from app.db.relational.repositories import file_repo, repository_repo
from app.db.relational.session import session_scope
from app.modules.graph.build import build_graph
from app.modules.ingestion.ingest import Inventory, clone_and_inventory
from app.modules.parsing.parse import parse_files
from app.modules.ranking.rank import rank
from app.workers.celery_app import celery_app

logger = get_logger(__name__)

# Documentation §11, steps 2–8. The API reports the current one to the UI.
PIPELINE_STAGES = (
    "ingest",
    "parse",
    "build_graph",
    "rank",
    "embed",
    "generate_tour",
    "explain",
)

UNEXPECTED_FAILURE = "Analysis failed unexpectedly. The worker log has the details."


@dataclass
class _Result:
    inventory: Inventory
    graph: nx.DiGraph
    scores: dict[str, float]


@celery_app.task(name="codecompass.analyze_repository", bind=True)
def analyze_repository(self, repository_id: int, job_id: int) -> dict:
    logger.info("analysis start repository_id=%s job_id=%s", repository_id, job_id)

    with session_scope() as session:
        job = repository_repo.get_job(session, job_id)
        repository = repository_repo.get_by_id(session, repository_id)
        if job is None or repository is None:
            logger.error("job %s or repository %s vanished", job_id, repository_id)
            return {"ok": False, "reason": "missing job or repository"}

        repository_repo.mark_job_running(session, job, stage=PIPELINE_STAGES[0])
        repository_repo.set_status(session, repository, RepositoryStatus.ANALYZING)
        source_url, branch = repository.source_url, repository.default_branch

    try:
        result = _run_pipeline(repository_id, job_id, source_url, branch)
    except AnalysisError as exc:
        _fail(repository_id, job_id, exc.message)
        logger.warning("analysis failed repository_id=%s: %s", repository_id, exc)
        return {"ok": False, "reason": exc.message}
    except Exception:
        with session_scope() as session:
            deleted = repository_repo.get_by_id(session, repository_id) is None
        if deleted:
            # Deleting removes the clone under us, so a crash here is expected.
            return _deleted_midway(repository_id)
        # Anything else is a bug; without this the job would sit at RUNNING.
        _fail(repository_id, job_id, UNEXPECTED_FAILURE)
        logger.exception("analysis crashed repository_id=%s", repository_id)
        return {"ok": False, "reason": UNEXPECTED_FAILURE}

    # One transaction: the new files, edges, and status appear together.
    with session_scope() as session:
        repository = repository_repo.get_by_id(session, repository_id)
        if repository is None:
            return _deleted_midway(repository_id)
        file_repo.replace_analysis(
            session,
            repository_id,
            files=[
                (f.path, f.language, result.scores.get(f.path, 0.0))
                for f in result.inventory.files
            ],
            edges=list(result.graph.edges),
        )
        repository_repo.mark_analyzed(
            session, repository, commit=result.inventory.commit
        )
        job = repository_repo.get_job(session, job_id)
        if job is not None:
            repository_repo.mark_job_finished(session, job, state=JobState.SUCCEEDED)

    logger.info(
        "analysis done repository_id=%s files=%d edges=%d",
        repository_id,
        len(result.inventory.files),
        result.graph.number_of_edges(),
    )
    return {"ok": True}


def _run_pipeline(
    repository_id: int, job_id: int, source_url: str, branch: str
) -> _Result:
    """M1–M4. Modules never touch the database; this only records the stage."""
    inventory = clone_and_inventory(source_url, _clone_path(repository_id), branch)
    _set_stage(job_id, "parse")
    parsed = parse_files(inventory)
    _set_stage(job_id, "build_graph")
    graph = build_graph(parsed)
    _set_stage(job_id, "rank")
    return _Result(inventory, graph, rank(graph))


def _deleted_midway(repository_id: int) -> dict:
    """The repository was deleted while we worked and the cancel did not reach
    us: save nothing and remove the clone."""
    shutil.rmtree(_clone_path(repository_id), ignore_errors=True)
    logger.info("repository %s deleted mid-analysis", repository_id)
    return {"ok": False, "reason": "repository deleted"}


def _clone_path(repository_id: int) -> Path:
    return settings.repo_storage_path / str(repository_id)


def _set_stage(job_id: int, stage: str) -> None:
    with session_scope() as session:
        job = repository_repo.get_job(session, job_id)
        if job is not None:
            repository_repo.mark_job_running(session, job, stage=stage)


def _fail(repository_id: int, job_id: int, message: str) -> None:
    with session_scope() as session:
        job = repository_repo.get_job(session, job_id)
        repository = repository_repo.get_by_id(session, repository_id)
        if job is not None:
            repository_repo.mark_job_finished(
                session, job, state=JobState.FAILED, error_message=message
            )
        if repository is not None:
            repository_repo.set_status(session, repository, RepositoryStatus.FAILED)
