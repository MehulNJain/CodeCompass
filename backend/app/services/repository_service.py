"""Orchestration for repository submission.

Routes call into here; this module composes the data-access layer and the job
queue. It is the only place that knows both exist.

Every function takes the caller's `owner_id`. Someone else's repository is
reported as not found, never as forbidden — a 403 would confirm it exists.
"""

import shutil
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.core.config import settings
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
    session: Session, *, owner_id: int, source_url: str, default_branch: str
) -> tuple[Repository, AnalysisJob]:
    """Register a repository and queue an analysis run.

    Re-submitting a URL this user already added re-queues it rather than
    creating a duplicate — that is the incremental re-analysis path (F12 /
    module M7). Another user submitting the same URL gets their own row.
    """
    repository = repository_repo.get_by_source_url(
        session, source_url, owner_id=owner_id
    )

    if repository is None:
        repository = repository_repo.create(
            session,
            owner_id=owner_id,
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


def get_repository(
    session: Session, repository_id: int, *, owner_id: int
) -> Repository:
    repository = repository_repo.get_owned(session, repository_id, owner_id=owner_id)
    if repository is None:
        raise NotFoundError(f"No repository with id {repository_id}.")
    return repository


def delete_repository(session: Session, repository_id: int, *, owner_id: int) -> None:
    """Delete the repository, its analysis, and its clone, and cancel any
    analysis still queued or running. The worker also checks the repository
    still exists before it saves, so a task that slips past the cancel writes
    nothing."""
    get_repository(session, repository_id, owner_id=owner_id)
    task_ids = repository_repo.unfinished_task_ids(session, repository_id)
    repository_repo.delete(session, repository_id)
    session.commit()

    if task_ids:
        from app.workers.celery_app import celery_app

        try:
            # terminate: a running task is killed, not just skipped if queued.
            celery_app.control.revoke(task_ids, terminate=True)
        except Exception:
            # Broker down: the worker's existence check still covers it.
            logger.warning("could not revoke %s", task_ids, exc_info=True)

    shutil.rmtree(settings.repo_storage_path / str(repository_id), ignore_errors=True)
    logger.info("deleted repository_id=%s cancelled=%s", repository_id, task_ids)


def get_job(session: Session, job_id: int, *, owner_id: int) -> AnalysisJob:
    job = repository_repo.get_owned_job(session, job_id, owner_id=owner_id)
    if job is None:
        raise NotFoundError(f"No job with id {job_id}.")
    return job
