"""Documentation §13 — `analysis_jobs`."""

from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import JobState
from app.db.relational.base import Base, TimestampMixin


class AnalysisJob(Base, TimestampMixin):
    __tablename__ = "analysis_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    repository_id: Mapped[int] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), index=True
    )

    # Celery's own task id, so a job row can be traced to a worker log line.
    task_id: Mapped[str | None] = mapped_column(String(64), index=True)

    state: Mapped[JobState] = mapped_column(
        SAEnum(JobState, name="job_state"), default=JobState.PENDING, nullable=False
    )
    # Which pipeline stage it is on (§11) — shown in the UI while it runs.
    stage: Mapped[str | None] = mapped_column(String(64))
    progress: Mapped[int] = mapped_column(default=0, nullable=False)

    started_at: Mapped[datetime | None] = mapped_column()
    finished_at: Mapped[datetime | None] = mapped_column()
    error_message: Mapped[str | None] = mapped_column(Text)

    repository: Mapped["Repository"] = relationship(back_populates="jobs")  # noqa: F821
