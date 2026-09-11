"""Data access for users and their sessions."""

from datetime import datetime

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.relational.models import User, UserSession


def get_by_email(session: Session, email: str) -> User | None:
    return session.scalar(select(User).where(User.email == email))


def create(
    session: Session, *, name: str, email: str, password_hash: str | None
) -> User:
    """Raises IntegrityError on a duplicate email — the unique constraint is
    the check. Looking the email up first would still race."""
    user = User(name=name, email=email, password_hash=password_hash)
    session.add(user)
    session.flush()
    return user


# --- sessions ----------------------------------------------------------------


def create_session(
    session: Session, *, user_id: int, token_hash: str, expires_at: datetime
) -> UserSession:
    user_session = UserSession(
        user_id=user_id, token_hash=token_hash, expires_at=expires_at
    )
    session.add(user_session)
    session.flush()
    return user_session


def get_user_by_session_token_hash(session: Session, token_hash: str) -> User | None:
    """Expiry is checked against the database clock, not this process's."""
    return session.scalar(
        select(User)
        .join(UserSession, UserSession.user_id == User.id)
        .where(UserSession.token_hash == token_hash)
        .where(UserSession.expires_at > func.now())
    )


def delete_session_by_token_hash(session: Session, token_hash: str) -> None:
    session.execute(delete(UserSession).where(UserSession.token_hash == token_hash))


def delete_expired_sessions(session: Session, *, user_id: int) -> None:
    """Called on sign-in, so a user's dead sessions do not pile up forever."""
    session.execute(
        delete(UserSession)
        .where(UserSession.user_id == user_id)
        .where(UserSession.expires_at <= func.now())
    )
