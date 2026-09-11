"""Password hashing and session tokens.

Plain functions with no FastAPI and no database, so they can be unit-tested
with nothing running.
"""

import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

# argon2-cffi's defaults are RFC 9106's recommended profile (argon2id). Do not
# lower them to speed tests up — tests should hash the way production does.
_hasher = PasswordHasher()

# Checked against when there is no real hash — an unknown email, or an account
# with no password. That makes "no such account" cost the same time as "wrong
# password", so response time alone does not reveal which emails are
# registered.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(32))


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        _safe_verify(_DUMMY_HASH, password)
        return False
    return _safe_verify(password_hash, password)


def password_needs_rehash(password_hash: str) -> bool:
    """True once the hashing parameters have been raised since this hash was
    made. Sign-in re-hashes then, while it still has the plaintext."""
    return _hasher.check_needs_rehash(password_hash)


def _safe_verify(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def new_session_token() -> str:
    """256 bits from the operating system's CSPRNG. This goes in the cookie."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """This goes in the database, so a copy of the sessions table cannot be
    replayed as a login.

    SHA-256, not argon2, is right for this one: the token is already 256
    random bits, so there is nothing to brute-force, and it runs on every
    request.
    """
    return hashlib.sha256(token.encode()).hexdigest()
