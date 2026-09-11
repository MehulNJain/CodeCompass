"""Authentication against a real database."""

import hashlib
from collections.abc import Callable

from fastapi.testclient import TestClient
from sqlalchemy import Engine, text

from tests.integration.conftest import PASSWORD

SIGNUP = "/api/v1/auth/signup"
LOGIN = "/api/v1/auth/login"
LOGOUT = "/api/v1/auth/logout"
ME = "/api/v1/auth/me"
COOKIE = "codecompass_session"

Browser = Callable[[], TestClient]


def test_sign_up_signs_you_in_with_a_locked_down_cookie(browser: Browser) -> None:
    client = browser()
    response = client.post(
        SIGNUP,
        json={"name": "Ada Lovelace", "email": "ada@example.com", "password": PASSWORD},
    )

    assert response.status_code == 201
    assert set(response.json()) == {"id", "email", "name", "created_at"}

    cookie = response.headers["set-cookie"].lower()
    assert f"{COOKIE}=" in cookie
    assert "httponly" in cookie
    assert "samesite=lax" in cookie

    assert client.get(ME).json()["email"] == "ada@example.com"


def test_email_case_does_not_matter(
    sign_up: Callable[..., TestClient], browser: Browser
) -> None:
    sign_up(email="Ada@Example.com")

    login = browser().post(
        LOGIN, json={"email": "ada@EXAMPLE.com", "password": PASSWORD}
    )
    assert login.status_code == 200

    duplicate = browser().post(
        SIGNUP,
        json={"name": "Someone Else", "email": "ADA@example.com", "password": PASSWORD},
    )
    assert duplicate.status_code == 409


def test_wrong_password_and_unknown_email_are_indistinguishable(
    sign_up: Callable[..., TestClient], browser: Browser
) -> None:
    sign_up()
    wrong = browser().post(LOGIN, json={"email": "ada@example.com", "password": "nope"})
    unknown = browser().post(
        LOGIN, json={"email": "nobody@example.com", "password": "nope"}
    )

    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()
    assert "set-cookie" not in wrong.headers


def test_neither_password_nor_token_is_stored_in_the_clear(
    sign_up: Callable[..., TestClient], engine: Engine
) -> None:
    client = sign_up()
    token = client.cookies[COOKIE]

    with engine.connect() as connection:
        password_hash = connection.scalar(text("SELECT password_hash FROM users"))
        token_hash = connection.scalar(text("SELECT token_hash FROM user_sessions"))

    assert password_hash.startswith("$argon2id$")
    assert PASSWORD not in password_hash
    assert token_hash == hashlib.sha256(token.encode()).hexdigest()


def test_sign_out_kills_the_session_not_just_the_cookie(
    sign_up: Callable[..., TestClient], browser: Browser
) -> None:
    """A copy of the cookie taken before sign-out must stop working. This is
    the property a JWT cannot give without extra machinery."""
    client = sign_up()
    copied = client.cookies[COOKIE]

    assert client.post(LOGOUT).status_code == 204
    assert client.get(ME).status_code == 401

    replay = browser().get(ME, headers={"Cookie": f"{COOKIE}={copied}"})
    assert replay.status_code == 401


def test_an_expired_session_is_refused(
    sign_up: Callable[..., TestClient], engine: Engine
) -> None:
    client = sign_up()
    assert client.get(ME).status_code == 200

    with engine.begin() as connection:
        connection.execute(
            text("UPDATE user_sessions SET expires_at = now() - interval '1 second'")
        )

    assert client.get(ME).status_code == 401


def test_signing_out_without_a_session_is_not_an_error(browser: Browser) -> None:
    assert browser().post(LOGOUT).status_code == 204
