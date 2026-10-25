"""API contract for the dependency graph. Mirrored in `frontend/src/types/`."""

from pydantic import BaseModel


class GraphFile(BaseModel):
    id: int
    path: str
    language: str | None
    importance_score: float
    imports: int  # files in this repository it imports
    imported_by: int  # files in this repository that import it


class GraphEdgeRead(BaseModel):
    """`source` imports `target`; both are GraphFile ids."""

    source: int
    target: int


class GraphRead(BaseModel):
    repository_id: int
    commit: str | None  # None until the first analysis succeeds
    files: list[GraphFile]  # most important first
    edges: list[GraphEdgeRead]
