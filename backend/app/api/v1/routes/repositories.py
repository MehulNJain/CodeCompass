"""Repository submission and listing (F1, F12). Signed-in only; every
repository belongs to the user who added it."""

from fastapi import APIRouter, status

from app.api.v1.dependencies.auth import CurrentUserDep
from app.api.v1.dependencies.db import PaginationDep, SessionDep
from app.core.exceptions import NotFoundError
from app.db.relational.repositories import repository_repo
from app.schemas.common import Page
from app.schemas.job import JobRead
from app.schemas.repository import RepositoryCreate, RepositoryRead
from app.services import repository_service

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.post("", response_model=JobRead, status_code=status.HTTP_202_ACCEPTED)
def submit_repository(
    payload: RepositoryCreate, user: CurrentUserDep, session: SessionDep
) -> JobRead:
    """202, not 201: the work is queued, not done. Poll the returned job."""
    _, job = repository_service.submit_repository(
        session,
        owner_id=user.id,
        source_url=payload.source_url,
        default_branch=payload.default_branch,
    )
    return JobRead.model_validate(job)


@router.get("", response_model=Page[RepositoryRead])
def list_repositories(
    user: CurrentUserDep, session: SessionDep, pagination: PaginationDep
) -> Page[RepositoryRead]:
    rows, total = repository_repo.list_repositories(
        session, owner_id=user.id, limit=pagination.limit, offset=pagination.offset
    )
    return Page(
        items=[RepositoryRead.model_validate(row) for row in rows],
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
    )


@router.get("/{repository_id}", response_model=RepositoryRead)
def get_repository(
    repository_id: int, user: CurrentUserDep, session: SessionDep
) -> RepositoryRead:
    repository = repository_service.get_repository(
        session, repository_id, owner_id=user.id
    )
    return RepositoryRead.model_validate(repository)


@router.get("/{repository_id}/job", response_model=JobRead)
def latest_job(
    repository_id: int, user: CurrentUserDep, session: SessionDep
) -> JobRead:
    """What the frontend polls while an analysis runs."""
    # 404s unless the repository is this user's.
    repository_service.get_repository(session, repository_id, owner_id=user.id)
    job = repository_repo.latest_job_for_repository(session, repository_id)
    if job is None:
        raise NotFoundError("No analysis has been queued for this repository.")
    return JobRead.model_validate(job)
