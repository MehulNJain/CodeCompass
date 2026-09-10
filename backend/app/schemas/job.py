"""API contract for analysis jobs."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import JobState


class JobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    repository_id: int
    state: JobState
    stage: str | None
    progress: int
    started_at: datetime | None
    finished_at: datetime | None
    error_message: str | None
    created_at: datetime
