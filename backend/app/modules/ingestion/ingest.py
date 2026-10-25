"""M1 — Ingestion: clone a repository and produce a clean file inventory.

Works on the filesystem only. It never touches a database: `services/`
persists the inventory through `app/db/`.
"""

import os
import shutil
from dataclasses import dataclass
from pathlib import Path

from git import GitCommandError, Repo

from app.core.exceptions import AnalysisError

# Directories that hold dependencies, build output, caches, or tooling state —
# never the code a newcomer should read.
SKIP_DIRS = frozenset(
    {
        ".git", ".hg", ".svn",
        "node_modules", "bower_components", "vendor",
        "venv", ".venv", "site-packages",
        "__pycache__", ".mypy_cache", ".pytest_cache", ".ruff_cache", ".tox", ".nox",
        "dist", "build", "out", "target", ".next", ".nuxt", ".svelte-kit",
        "coverage", "htmlcov", ".idea", ".vscode",
    }
)  # fmt: skip

LANGUAGES = {
    ".py": "python",
    ".js": "javascript", ".jsx": "javascript",
    ".mjs": "javascript", ".cjs": "javascript",
    ".ts": "typescript", ".tsx": "typescript",
}  # fmt: skip

MAX_FILE_BYTES = 1_000_000
CLONE_TIMEOUT_SECONDS = 300


@dataclass(frozen=True)
class SourceFile:
    path: str  # POSIX, relative to the repository root
    language: str | None  # None for text files no parser handles yet
    size: int


@dataclass(frozen=True)
class Inventory:
    root: Path
    commit: str
    files: list[SourceFile]


def clone(source_url: str, dest: Path, branch: str | None = None) -> str:
    """Shallow-clone `source_url` into `dest`, replacing anything already there.

    Falls back to the remote's default branch when `branch` does not exist —
    the API defaults it to "main", and plenty of repositories use "master".
    Returns the checked-out commit SHA.
    """
    if dest.exists():
        shutil.rmtree(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)

    # Never wait on a username/password prompt: a private or missing repository
    # must fail at once, not hang the worker.
    env = {"GIT_TERMINAL_PROMPT": "0"}
    options = {"depth": 1, "single_branch": True, "env": env,
               "kill_after_timeout": CLONE_TIMEOUT_SECONDS}  # fmt: skip
    try:
        try:
            repo = Repo.clone_from(source_url, dest, branch=branch, **options)
        except GitCommandError as exc:
            if not branch or "not found in upstream" not in str(exc.stderr):
                raise
            shutil.rmtree(dest, ignore_errors=True)
            repo = Repo.clone_from(source_url, dest, **options)
    except GitCommandError as exc:
        shutil.rmtree(dest, ignore_errors=True)
        raise AnalysisError(
            f"Could not clone {source_url}. Check that the URL is right and the "
            "repository is public."
        ) from exc
    return repo.head.commit.hexsha


def inventory(root: Path) -> list[SourceFile]:
    """Every readable text file under `root`, minus dependencies, build output,
    binaries, and files over MAX_FILE_BYTES. Sorted by path."""
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Pruning in place stops os.walk descending into skipped directories.
        dirnames[:] = [
            d
            for d in dirnames
            if d not in SKIP_DIRS
            and not d.endswith(".egg-info")
            # A virtualenv under any name ("env", ".py311", …) carries this file.
            and not (Path(dirpath) / d / "pyvenv.cfg").exists()
        ]
        for name in filenames:
            path = Path(dirpath) / name
            # Symlinks can point outside the clone (e.g. at /etc/passwd).
            if path.is_symlink() or not path.is_file():
                continue
            size = path.stat().st_size
            if size > MAX_FILE_BYTES or _is_binary(path):
                continue
            files.append(
                SourceFile(
                    path=path.relative_to(root).as_posix(),
                    language=LANGUAGES.get(path.suffix.lower()),
                    size=size,
                )
            )
    return sorted(files, key=lambda f: f.path)


def clone_and_inventory(source_url: str, dest: Path, branch: str | None) -> Inventory:
    commit = clone(source_url, dest, branch)
    return Inventory(root=dest, commit=commit, files=inventory(dest))


def _is_binary(path: Path) -> bool:
    """Git's own heuristic: a NUL byte in the first 8 KB means binary."""
    with path.open("rb") as handle:
        return b"\0" in handle.read(8192)
