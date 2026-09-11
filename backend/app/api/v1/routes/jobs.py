"""Analysis job status (F11 — progress reporting)."""

from fastapi import APIRouter

from app.api.v1.dependencies.auth import CurrentUserDep
from app.api.v1.dependencies.db import SessionDep
from app.schemas.job import JobRead
from app.services import repository_service

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, user: CurrentUserDep, session: SessionDep) -> JobRead:
    job = repository_service.get_job(session, job_id, owner_id=user.id)
    return JobRead.model_validate(job)
