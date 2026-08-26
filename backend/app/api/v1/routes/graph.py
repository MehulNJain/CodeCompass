"""Dependency graph view (F7). Waits on modules M3 and the Neo4j layer."""

from fastapi import APIRouter

from app.core.exceptions import NotImplementedYetError

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/repository/{repository_id}")
def get_graph(repository_id: int) -> None:
    raise NotImplementedYetError("Graph building is module M3.")
