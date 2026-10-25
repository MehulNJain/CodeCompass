"""Dependency graph view (F7): every file with its importance score, and the
import edges between them. Read from PostgreSQL, written there by the worker."""

from collections import Counter

from fastapi import APIRouter

from app.api.v1.dependencies.auth import CurrentUserDep
from app.api.v1.dependencies.db import SessionDep
from app.db.relational.repositories import file_repo
from app.schemas.graph import GraphEdgeRead, GraphFile, GraphRead
from app.services import repository_service

router = APIRouter(prefix="/graph", tags=["graph"])


# ponytail: the whole graph in one response — fine for a few thousand files;
# add a `limit` on files (and edges among them) when big monorepos show up.
@router.get("/repository/{repository_id}", response_model=GraphRead)
def get_graph(
    repository_id: int, user: CurrentUserDep, session: SessionDep
) -> GraphRead:
    """Before the first successful analysis this is an empty graph, not an
    error — the page shows "not analysed yet"."""
    repository = repository_service.get_repository(
        session, repository_id, owner_id=user.id
    )
    files = file_repo.list_files(session, repository_id)
    edges = file_repo.list_edges(session, repository_id)
    imports = Counter(source for source, _ in edges)
    imported_by = Counter(target for _, target in edges)
    return GraphRead(
        repository_id=repository_id,
        commit=repository.last_analyzed_commit,
        files=[
            GraphFile(
                id=f.id,
                path=f.path,
                language=f.language,
                importance_score=f.importance_score,
                imports=imports[f.id],
                imported_by=imported_by[f.id],
            )
            for f in files
        ],
        edges=[GraphEdgeRead(source=s, target=t) for s, t in edges],
    )
