"""Sign-up, sign-in, sign-out, and turning a session cookie back into a user.

Sessions are server-side: the cookie holds a random token, the database holds
its hash and an expiry. That is what lets sign-out actually end a session —
a self-contained token (a JWT) stays valid until it expires no matter what the
server does.
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.logging import get_logger
from app.core.security import (
    hash_password,
    hash_session_token,
    new_session_token,
    password_needs_rehash,
    verify_password,
)
from app.db.relational.models import User
from app.db.relational.repositories import user_repo

logger = get_logger(__name__)

# One message for both "no such account" and "wrong password", so the sign-in
# form cannot be used to find out who has an account.
INVALID_CREDENTIALS = "Incorrect email or password."


def sign_up(
    session: Session, *, name: str, email: str, password: str
) -> tuple[User, str]:
    """Returns the new user and the raw session token for the cookie.

    A duplicate email is reported as such. That does reveal the email is
    registered — every sign-up form that says so has this property, and the
    alternative (a confirmation email) needs mail delivery this project does
    not have.
    """
    try:
        user = user_repo.create(
            session, name=name, email=email, password_hash=hash_password(password)
        )
    except IntegrityError:
        session.rollback()
        raise ConflictError("An account with that email already exists.") from None

    token = _start_session(session, user)
    session.commit()
    logger.info("signed up user_id=%s", user.id)
    return user, token


def sign_in(session: Session, *, email: str, password: str) -> tuple[User, str]:
    user = user_repo.get_by_email(session, email)
    # Verify before checking `user`, so an unknown email still pays for a hash.
    password_ok = verify_password(password, user.password_hash if user else None)
    if user is None or not password_ok:
        raise UnauthorizedError(INVALID_CREDENTIALS)

    if user.password_hash and password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)

    user_repo.delete_expired_sessions(session, user_id=user.id)
    token = _start_session(session, user)
    session.commit()
    logger.info("signed in user_id=%s", user.id)
    return user, token


def sign_out(session: Session, token: str | None) -> None:
    """Idempotent — signing out with no session, or a dead one, is fine."""
    if not token:
        return
    user_repo.delete_session_by_token_hash(session, hash_session_token(token))
    session.commit()


def user_for_session_token(session: Session, token: str) -> User | None:
    """None for an unknown, revoked, or expired token."""
    return user_repo.get_user_by_session_token_hash(session, hash_session_token(token))


def _start_session(session: Session, user: User) -> str:
    token = new_session_token()
    user_repo.create_session(
        session,
        user_id=user.id,
        token_hash=hash_session_token(token),
        expires_at=datetime.now(UTC) + timedelta(days=settings.session_ttl_days),
    )
    return token
