"""M1 — ingestion. Clones a throwaway local repository over file://, so no
network is needed."""

from pathlib import Path

import pytest
from git import Actor, Repo

from app.core.exceptions import AnalysisError
from app.modules.ingestion import ingest


def _write(root: Path, rel: str, data: str | bytes) -> None:
    path = root / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, bytes):
        path.write_bytes(data)
    else:
        path.write_text(data)


@pytest.fixture
def tree(tmp_path: Path) -> Path:
    root = tmp_path / "tree"
    _write(root, "app/main.py", "import app.util\n")
    _write(root, "app/util.py", "def f(): pass\n")
    _write(root, "web/index.ts", "export {}\n")
    _write(root, "README.md", "# hi\n")
    _write(root, "node_modules/lib/index.js", "x\n")
    _write(root, "build/out.py", "x\n")
    _write(root, "pkg.egg-info/PKG-INFO", "x\n")
    _write(root, "myenv/pyvenv.cfg", "home = /usr\n")
    _write(root, "myenv/lib/site.py", "x\n")
    _write(root, "logo.png", b"\x89PNG\0\0data")
    _write(root, "big.py", "x" * (ingest.MAX_FILE_BYTES + 1))
    (root / "link.py").symlink_to(root / "app/main.py")
    return root


def test_inventory_keeps_source_and_drops_noise(tree: Path) -> None:
    files = ingest.inventory(tree)

    assert [(f.path, f.language) for f in files] == [
        ("README.md", None),
        ("app/main.py", "python"),
        ("app/util.py", "python"),
        ("web/index.ts", "typescript"),
    ]


@pytest.fixture
def remote(tree: Path) -> str:
    """`tree` committed on a branch called master, as a file:// URL."""
    repo = Repo.init(tree, initial_branch="master")
    repo.git.add(A=True)
    me = Actor("Test", "test@example.com")
    repo.index.commit("init", author=me, committer=me)
    return tree.as_uri()


def test_clone_falls_back_to_the_default_branch(remote: str, tmp_path: Path) -> None:
    dest = tmp_path / "clone"

    result = ingest.clone_and_inventory(remote, dest, branch="main")

    assert len(result.commit) == 40
    assert "app/main.py" in {f.path for f in result.files}


def test_clone_replaces_a_previous_checkout(remote: str, tmp_path: Path) -> None:
    dest = tmp_path / "clone"
    _write(dest, "stale.py", "left over from the last run\n")

    ingest.clone(remote, dest)

    assert not (dest / "stale.py").exists()


def test_clone_of_a_missing_repository_is_an_analysis_error(tmp_path: Path) -> None:
    missing = (tmp_path / "nope").as_uri()

    with pytest.raises(AnalysisError, match="Could not clone"):
        ingest.clone(missing, tmp_path / "clone")
    assert not (tmp_path / "clone").exists()
