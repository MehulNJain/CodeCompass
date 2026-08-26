"""Analysis job status (F11 — progress reporting)."""

from fastapi import APIRouter

from app.api.v1.dependencies.db import SessionDep
from app.core.exceptions import NotFoundError
from app.db.relational.repositories import repository_repo
from app.schemas.job import JobRead

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, session: SessionDep) -> JobRead:
    job = repository_repo.get_job(session, job_id)
    if job is None:
        raise NotFoundError(f"No job with id {job_id}.")
    return JobRead.model_validate(job)
