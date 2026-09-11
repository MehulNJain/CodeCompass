"""Grounded question answering (F8). Waits on module M6.

Every answer this endpoint eventually returns must carry file and line
citations — an uncited answer breaks the design invariant.
"""

from fastapi import APIRouter

from app.api.v1.dependencies.auth import CurrentUserDep
from app.api.v1.dependencies.db import SessionDep
from app.core.exceptions import NotImplementedYetError
from app.services import repository_service

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("/repository/{repository_id}")
def ask(repository_id: int, user: CurrentUserDep, session: SessionDep) -> None:
    # Ownership first — retrieval must never search another user's code.
    repository_service.get_repository(session, repository_id, owner_id=user.id)
    raise NotImplementedYetError("Retrieval and answering are module M6.")
