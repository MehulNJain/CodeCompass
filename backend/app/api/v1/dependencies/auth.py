"""Who is making this request.

The session is a random token in an httpOnly cookie. JavaScript cannot read an
httpOnly cookie, so a cross-site scripting bug cannot steal a session — which it
could if the token sat in localStorage.

CSRF: the cookie is SameSite=Lax, so a browser does not attach it to a POST
that another site triggers. That protection depends on every state-changing
endpoint being POST/PUT/PATCH/DELETE — never change state in a GET handler.
"""

from typing import Annotated

from fastapi import Cookie, Depends

from app.api.v1.dependencies.db import SessionDep
from app.core.exceptions import UnauthorizedError
from app.db.relational.models import User
from app.services import auth_service

SESSION_COOKIE = "codecompass_session"

SessionTokenDep = Annotated[str | None, Cookie(alias=SESSION_COOKIE)]


def get_current_user(session: SessionDep, token: SessionTokenDep = None) -> User:
    if not token:
        raise UnauthorizedError("Sign in to continue.")
    user = auth_service.user_for_session_token(session, token)
    if user is None:
        raise UnauthorizedError("Your session has ended. Sign in again.")
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
