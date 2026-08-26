"""Shared enumerations.

These names are part of the API contract — the frontend mirrors them in
`frontend/src/types/`. Changing a value here is a breaking change.
"""

from enum import StrEnum


class RepositoryStatus(StrEnum):
    """Documentation §13, `repositories.status`."""

    QUEUED = "queued"
    ANALYZING = "analyzing"
    READY = "ready"
    FAILED = "failed"


class JobState(StrEnum):
    """Documentation §13, `analysis_jobs.state`."""

    PENDING = "pending"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class EdgeType(StrEnum):
    """Documentation §13, `graph_edges.edge_type`."""

    IMPORT = "import"
    CALL = "call"


class Persona(StrEnum):
    """Tour personas (documentation §8, F6). Weighting profiles live in
    `app/modules/tour/personas/`."""

    NEW_CONTRIBUTOR = "new_contributor"
    BUG_FIXER = "bug_fixer"
    FEATURE_BUILDER = "feature_builder"
    REVIEWER = "reviewer"
