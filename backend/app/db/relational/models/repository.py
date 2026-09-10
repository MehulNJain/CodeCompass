"""Documentation §13 — `repositories`."""

from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import RepositoryStatus
from app.db.relational.base import Base, TimestampMixin


class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"
    # The same URL analysed twice should update one row, not create a second.
    __table_args__ = (
        UniqueConstraint("source_url", name="uq_repositories_source_url"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    default_branch: Mapped[str] = mapped_column(String(255), default="main")

    # Set once an analysis finishes. M7 diffs against this to decide what to
    # re-read on the next run.
    last_analyzed_commit: Mapped[str | None] = mapped_column(String(40))
    last_analyzed_at: Mapped[datetime | None] = mapped_column()

    status: Mapped[RepositoryStatus] = mapped_column(
        SAEnum(RepositoryStatus, name="repository_status"),
        default=RepositoryStatus.QUEUED,
        nullable=False,
    )

    files: Mapped[list["File"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
    tours: Mapped[list["Tour"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["AnalysisJob"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
