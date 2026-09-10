"""API contract for repositories. Mirrored in `frontend/src/types/`."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import RepositoryStatus


class RepositoryCreate(BaseModel):
    source_url: str = Field(
        ..., max_length=1024, examples=["https://github.com/pallets/flask"]
    )
    default_branch: str = Field(default="main", max_length=255)

    @field_validator("source_url")
    @classmethod
    def must_look_like_a_git_url(cls, value: str) -> str:
        value = value.strip()
        if not value.startswith(("http://", "https://", "git@")):
            raise ValueError("Expected an http(s) or ssh Git URL.")
        return value.removesuffix(".git")


class RepositoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    source_url: str
    default_branch: str
    status: RepositoryStatus
    last_analyzed_commit: str | None
    last_analyzed_at: datetime | None
    created_at: datetime
