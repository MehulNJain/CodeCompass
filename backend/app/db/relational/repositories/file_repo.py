"""Data access for a repository's files and import edges (documentation §13).

Unscoped by owner, like `repository_repo.get_by_id`: the worker writes here,
and routes resolve the repository with `get_owned` before reading.
"""

from sqlalchemy import delete, insert
from sqlalchemy.orm import Session

from app.core.constants import EdgeType
from app.db.relational.models import File, GraphEdge


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
