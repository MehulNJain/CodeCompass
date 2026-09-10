"""Guided tours (F5, F6, F15).

Route shapes are fixed here so the frontend can be built against them; the
handlers wait on modules M5 and M6. They answer 501, not 404 — the endpoint is
real, the feature is not built.
"""

from fastapi import APIRouter

from app.core.exceptions import NotImplementedYetError

router = APIRouter(prefix="/tours", tags=["tours"])


@router.get("/repository/{repository_id}")
def list_tours(repository_id: int) -> None:
    raise NotImplementedYetError("Tour generation is module M5.")


@router.get("/{tour_id}")
def get_tour(tour_id: int) -> None:
    raise NotImplementedYetError("Tour generation is module M5.")


@router.get("/{tour_id}/export")
def export_tour(tour_id: int, fmt: str = "markdown") -> None:
    raise NotImplementedYetError("Tour export is F15, in app/modules/export/.")
