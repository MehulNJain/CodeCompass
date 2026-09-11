"""Accounts and signed-in sessions.

Not in documentation §13 — added with authentication (module M8).
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.relational.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Stored lowercased (see app/schemas/auth.py), so this constraint is
    # case-insensitive in practice.
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Null for an account that signs in only through GitHub, once that exists.
    # A null hash never passes a password check.
    password_hash: Mapped[str | None] = mapped_column(String(255))

    repositories: Mapped[list["Repository"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserSession(Base, TimestampMixin):
    """One row per signed-in browser. Signing out deletes the row, which is
    what makes sign-out real rather than just forgetting a cookie.

    Named UserSession so it is never confused with SQLAlchemy's Session.
    """

    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    # SHA-256 of the cookie value — the raw token is never stored.
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    # timestamptz, compared against the database's now() — see user_repo.
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="sessions")
