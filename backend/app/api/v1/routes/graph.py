"""Dependency graph view (F7). Waits on modules M3 and the Neo4j layer."""

from fastapi import APIRouter

from app.api.v1.dependencies.auth import CurrentUserDep
from app.api.v1.dependencies.db import SessionDep
from app.core.exceptions import NotImplementedYetError
from app.services import repository_service

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/repository/{repository_id}")
def get_graph(repository_id: int, user: CurrentUserDep, session: SessionDep) -> None:
    # Ownership first, so someone else's repository is a 404 even before M3.
    repository_service.get_repository(session, repository_id, owner_id=user.id)
    raise NotImplementedYetError("Graph building is module M3.")
