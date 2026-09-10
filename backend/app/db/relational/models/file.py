"""Documentation §13 — `files` and `graph_edges`."""

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import EdgeType
from app.db.relational.base import Base


class File(Base):
    __tablename__ = "files"
    __table_args__ = (
        UniqueConstraint("repository_id", "path", name="uq_files_repository_id_path"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    repository_id: Mapped[int] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), index=True
    )

    path: Mapped[str] = mapped_column(String(1024), nullable=False)
    language: Mapped[str | None] = mapped_column(String(64))

    # Written by M4 (ranking) from the centrality scores M3 produced.
    importance_score: Mapped[float] = mapped_column(default=0.0)
    last_changed_commit: Mapped[str | None] = mapped_column(String(40))

    repository: Mapped["Repository"] = relationship(back_populates="files")  # noqa: F821


class GraphEdge(Base):
    """The graph is persisted in Neo4j for traversal; this table keeps the same
    edges in PostgreSQL so a tour can be rebuilt without a second store being
    up, and so §13 of the documentation stays true.
    """

    __tablename__ = "graph_edges"
    __table_args__ = (
        Index("ix_graph_edges_repository_id_source", "repository_id", "source_file_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    repository_id: Mapped[int] = mapped_column(
        ForeignKey("repositories.id", ondelete="CASCADE"), index=True
    )
    source_file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE")
    )
    target_file_id: Mapped[int] = mapped_column(
        ForeignKey("files.id", ondelete="CASCADE")
    )
    edge_type: Mapped[EdgeType] = mapped_column(
        SAEnum(EdgeType, name="edge_type"), nullable=False
    )
