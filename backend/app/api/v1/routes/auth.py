"""Email and password authentication (module M8).

Sign-up and sign-in both answer with the user and set the session cookie, so
the frontend never handles a token.
"""

from fastapi import APIRouter, Response, status

from app.api.v1.dependencies.auth import SESSION_COOKIE, CurrentUserDep, SessionTokenDep
from app.api.v1.dependencies.db import SessionDep
from app.core.config import settings
from app.schemas.auth import SignInRequest, SignUpRequest, UserRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def sign_up(
    payload: SignUpRequest, response: Response, session: SessionDep
) -> UserRead:
    user, token = auth_service.sign_up(
        session, name=payload.name, email=payload.email, password=payload.password
    )
    _set_session_cookie(response, token)
    return UserRead.model_validate(user)


@router.post("/login", response_model=UserRead)
def sign_in(
    payload: SignInRequest, response: Response, session: SessionDep
) -> UserRead:
    user, token = auth_service.sign_in(
        session, email=payload.email, password=payload.password
    )
    _set_session_cookie(response, token)
    return UserRead.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def sign_out(session: SessionDep, token: SessionTokenDep = None) -> Response:
    """Deletes the session row, not just the cookie — a copied cookie stops
    working too."""
    auth_service.sign_out(session, token)
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(
        SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
    )
    return response


@router.get("/me", response_model=UserRead)
def me(user: CurrentUserDep) -> UserRead:
    """What the frontend asks on load to find out whether it is signed in."""
    return UserRead.model_validate(user)


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.session_ttl_days * 24 * 60 * 60,
        path="/",
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
    )
