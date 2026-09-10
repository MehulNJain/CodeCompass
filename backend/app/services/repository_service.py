"""Orchestration for repository submission.

Routes call into here; this module composes the data-access layer and the job
queue. It is the only place that knows both exist.
"""

from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.core.constants import RepositoryStatus
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.db.relational.models import AnalysisJob, Repository
from app.db.relational.repositories import repository_repo

logger = get_logger(__name__)


def derive_name(source_url: str) -> str:
    """`https://github.com/pallets/flask` -> `pallets/flask`."""
    if "://" in source_url:
        path = urlparse(source_url).path
    else:
        path = source_url.split(":")[-1]
    parts = [part for part in path.strip("/").removesuffix(".git").split("/") if part]
    return "/".join(parts[-2:]) if parts else source_url


def submit_repository(
    session: Session, *, source_url: str, default_branch: str
) -> tuple[Repository, AnalysisJob]:
    """Register a repository and queue an analysis run.

    Re-submitting a URL that is already known re-queues it rather than creating
    a duplicate — that is the incremental re-analysis path (F12 / module M7).
    """
    repository = repository_repo.get_by_source_url(session, source_url)

    if repository is None:
        repository = repository_repo.create(
            session,
            name=derive_name(source_url),
            source_url=source_url,
            default_branch=default_branch,
        )
    else:
        repository_repo.set_status(session, repository, RepositoryStatus.QUEUED)

    job = repository_repo.create_job(session, repository_id=repository.id)
    session.commit()

    # Imported here, not at module scope: importing the task pulls in Celery's
    # app, and the API should still start if the broker is unreachable.
    from app.workers.tasks.analyze_repository import analyze_repository

    async_result = analyze_repository.delay(repository_id=repository.id, job_id=job.id)
    job.task_id = async_result.id
    session.commit()

    logger.info(
        "queued analysis repository_id=%s job_id=%s task_id=%s",
        repository.id,
        job.id,
        async_result.id,
    )
    return repository, job


def get_repository(session: Session, repository_id: int) -> Repository:
    repository = repository_repo.get_by_id(session, repository_id)
    if repository is None:
        raise NotFoundError(f"No repository with id {repository_id}.")
    return repository
