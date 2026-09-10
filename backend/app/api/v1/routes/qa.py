"""Grounded question answering (F8). Waits on module M6.

Every answer this endpoint eventually returns must carry file and line
citations — an uncited answer breaks the design invariant.
"""

from fastapi import APIRouter

from app.core.exceptions import NotImplementedYetError

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("/repository/{repository_id}")
def ask(repository_id: int) -> None:
    raise NotImplementedYetError("Retrieval and answering are module M6.")
