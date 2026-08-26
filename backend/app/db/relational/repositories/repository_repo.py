"""Data access for repositories and their analysis jobs.

Queries live here, never in a route. A route that writes SQL is a route that
cannot be reused by the Celery worker.
"""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import JobState, RepositoryStatus
from app.db.relational.models import AnalysisJob, Repository


def get_by_id(session: Session, repository_id: int) -> Repository | None:
    return session.get(Repository, repository_id)


def get_by_source_url(session: Session, source_url: str) -> Repository | None:
    return session.scalar(
        select(Repository).where(Repository.source_url == source_url)
    )


def list_repositories(
    session: Session, *, limit: int = 20, offset: int = 0
) -> tuple[list[Repository], int]:
    total = session.scalar(select(func.count()).select_from(Repository)) or 0
    rows = session.scalars(
        select(Repository)
        .order_by(Repository.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(rows), total


def create(
    session: Session, *, name: str, source_url: str, default_branch: str
) -> Repository:
    repository = Repository(
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


def get_job(session: Session, job_id: int) -> AnalysisJob | None:
    return session.get(AnalysisJob, job_id)


def latest_job_for_repository(
    session: Session, repository_id: int
) -> AnalysisJob | None:
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
