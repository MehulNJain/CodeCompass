"""Data access for repositories and their analysis jobs.

Queries live here, never in a route. A route that writes SQL is a route that
cannot be reused by the Celery worker.

Two kinds of lookup, deliberately named apart:

- `get_owned`, `get_owned_job`, `list_repositories` take a required `owner_id`.
  Everything that answers an HTTP request uses these.
- `get_by_id`, `get_job` do not. They exist for the worker, which acts on a
  repository it was handed by an already-authorised request. Never call them
  from a route.
"""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import JobState, RepositoryStatus
from app.db.relational.models import AnalysisJob, Repository


def get_owned(
    session: Session, repository_id: int, *, owner_id: int
) -> Repository | None:
    return session.scalar(
        select(Repository)
        .where(Repository.id == repository_id)
        .where(Repository.owner_id == owner_id)
    )


def get_by_id(session: Session, repository_id: int) -> Repository | None:
    """Worker only — not scoped to an owner. See the module docstring."""
    return session.get(Repository, repository_id)


def get_by_source_url(
    session: Session, source_url: str, *, owner_id: int
) -> Repository | None:
    return session.scalar(
        select(Repository)
        .where(Repository.source_url == source_url)
        .where(Repository.owner_id == owner_id)
    )


def list_repositories(
    session: Session, *, owner_id: int, limit: int = 20, offset: int = 0
) -> tuple[list[Repository], int]:
    owned = Repository.owner_id == owner_id
    total = (
        session.scalar(select(func.count()).select_from(Repository).where(owned)) or 0
    )
    rows = session.scalars(
        select(Repository)
        .where(owned)
        .order_by(Repository.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(rows), total


def create(
    session: Session,
    *,
    owner_id: int,
    name: str,
    source_url: str,
    default_branch: str,
) -> Repository:
    repository = Repository(
        owner_id=owner_id,
        name=name,
        source_url=source_url,
        default_branch=default_branch,
        status=RepositoryStatus.QUEUED,
    )
    session.add(repository)
    session.flush()  # populate repository.id without ending the transaction
    return repository


def set_status(
    session: Session, repository: Repository, status: RepositoryStatus
) -> Repository:
    repository.status = status
    session.flush()
    return repository


# --- analysis jobs -----------------------------------------------------------


def create_job(session: Session, *, repository_id: int) -> AnalysisJob:
    job = AnalysisJob(repository_id=repository_id, state=JobState.PENDING)
    session.add(job)
    session.flush()
    return job


def get_owned_job(
    session: Session, job_id: int, *, owner_id: int
) -> AnalysisJob | None:
    return session.scalar(
        select(AnalysisJob)
        .join(Repository, Repository.id == AnalysisJob.repository_id)
        .where(AnalysisJob.id == job_id)
        .where(Repository.owner_id == owner_id)
    )


def get_job(session: Session, job_id: int) -> AnalysisJob | None:
    """Worker only — not scoped to an owner. See the module docstring."""
    return session.get(AnalysisJob, job_id)


def latest_job_for_repository(
    session: Session, repository_id: int
) -> AnalysisJob | None:
    """Unscoped by itself — resolve the repository with `get_owned` first."""
    return session.scalar(
        select(AnalysisJob)
        .where(AnalysisJob.repository_id == repository_id)
        .order_by(AnalysisJob.created_at.desc())
        .limit(1)
    )


def mark_job_running(session: Session, job: AnalysisJob, *, stage: str) -> AnalysisJob:
    job.state = JobState.RUNNING
    job.stage = stage
    if job.started_at is None:
        job.started_at = datetime.now(UTC)
    session.flush()
    return job


def mark_job_finished(
    session: Session,
    job: AnalysisJob,
    *,
    state: JobState,
    error_message: str | None = None,
) -> AnalysisJob:
    job.state = state
    job.finished_at = datetime.now(UTC)
    job.progress = 100 if state == JobState.SUCCEEDED else job.progress
    job.error_message = error_message
    session.flush()
    return job
