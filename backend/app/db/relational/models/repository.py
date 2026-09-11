"""Documentation §13 — `repositories`."""

from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import RepositoryStatus
from app.db.relational.base import Base, TimestampMixin


class Repository(Base, TimestampMixin):
    __tablename__ = "repositories"
    # One row per URL *per owner*. This used to be unique on the URL alone, so
    # a second user submitting the same URL got the first user's row back —
    # harmless for public code, a leak for private code. The cost: two users
    # analysing one public repository analyse it twice. Sharing that work
    # safely needs to know the repository is public, which needs GitHub.
    __table_args__ = (
        UniqueConstraint(
            "owner_id", "source_url", name="uq_repositories_owner_id_source_url"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # No separate index: the unique constraint above leads with owner_id.
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
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

    owner: Mapped["User"] = relationship(back_populates="repositories")  # noqa: F821
    files: Mapped[list["File"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
    tours: Mapped[list["Tour"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["AnalysisJob"]] = relationship(  # noqa: F821
        back_populates="repository", cascade="all, delete-orphan"
    )
