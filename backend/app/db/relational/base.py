"""Declarative base for the PostgreSQL models.

The naming convention matters: without it Alembic autogenerates constraint
names that differ between environments, and a migration that works on one
machine fails on another.
"""

from datetime import datetime

from sqlalchemy import MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class TimestampMixin:
    """Server-side timestamps — the database clock, not the worker's."""

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
