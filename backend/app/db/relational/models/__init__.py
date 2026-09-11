"""Model registry.

Alembic autogenerate only sees models that have been imported. Anything added
here must also be exported below, or its table will be silently missing from
the next migration.
"""

from app.db.relational.models.analysis_job import AnalysisJob
from app.db.relational.models.file import File, GraphEdge
from app.db.relational.models.repository import Repository
from app.db.relational.models.tour import Tour, TourStep
from app.db.relational.models.user import User, UserSession

__all__ = [
    "AnalysisJob",
    "File",
    "GraphEdge",
    "Repository",
    "Tour",
    "TourStep",
    "User",
    "UserSession",
]
