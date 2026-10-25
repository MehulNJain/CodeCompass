"""Data access for a repository's files and import edges (documentation §13).

Unscoped by owner, like `repository_repo.get_by_id`: the worker writes here,
and routes resolve the repository with `get_owned` before reading.
"""

from sqlalchemy import delete, insert, select
from sqlalchemy.orm import Session

from app.core.constants import EdgeType
from app.db.relational.models import File, GraphEdge


def list_files(session: Session, repository_id: int) -> list[File]:
    """Most important first; ties by path so the order is stable."""
    return list(
        session.scalars(
            select(File)
            .where(File.repository_id == repository_id)
            .order_by(File.importance_score.desc(), File.path)
        )
    )


def list_edges(session: Session, repository_id: int) -> list[tuple[int, int]]:
    """(source file id, target file id) for every import edge."""
    rows = session.execute(
        select(GraphEdge.source_file_id, GraphEdge.target_file_id).where(
            GraphEdge.repository_id == repository_id
        )
    )
    return [(source, target) for source, target in rows]


def replace_analysis(
    session: Session,
    repository_id: int,
    *,
    files: list[tuple[str, str | None, float]],
    edges: list[tuple[str, str]],
) -> None:
    """Swap the previous analysis for a new one: (path, language, score) per
    file, (importer path, imported path) per edge. Runs inside the caller's
    transaction, so a run that fails halfway leaves the previous one intact."""
    session.execute(delete(GraphEdge).where(GraphEdge.repository_id == repository_id))
    session.execute(delete(File).where(File.repository_id == repository_id))
    if not files:
        return

    ids = dict(
        session.execute(
            insert(File).returning(File.path, File.id),
            [
                {"repository_id": repository_id, "path": path,
                 "language": language, "importance_score": score}
                for path, language, score in files
            ],
        ).all()
    )
    if edges:
        session.execute(
            insert(GraphEdge),
            [
                {"repository_id": repository_id, "source_file_id": ids[source],
                 "target_file_id": ids[target], "edge_type": EdgeType.IMPORT}
                for source, target in edges
            ],
        )
