"""Tests against a real PostgreSQL.

They use their own database — the app's database name plus `_test` — created
on first use and migrated with Alembic, so the migrations are under test too.
Tables are emptied before every test. If Postgres is unreachable these tests
are skipped, not failed.

    docker compose -f docker/docker-compose.yml exec api pytest tests/integration
"""

from collections.abc import Callable, Iterator
from types import SimpleNamespace

import pytest
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import BACKEND_ROOT, settings
from app.db.relational.session import get_session
from app.main import create_app
from app.workers.tasks.analyze_repository import analyze_repository

APP_URL = make_url(settings.database_url)
TEST_URL = APP_URL.set(database=f"{APP_URL.database}_test")

PASSWORD = "correct horse battery"


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    admin = create_engine(APP_URL, isolation_level="AUTOCOMMIT")
    try:
        with admin.connect() as connection:
            exists = connection.scalar(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": TEST_URL.database},
            )
            if not exists:
                connection.execute(text(f'CREATE DATABASE "{TEST_URL.database}"'))
    except OperationalError as exc:
        pytest.skip(f"PostgreSQL is not reachable: {exc}")
    finally:
        admin.dispose()

    migrations = BACKEND_ROOT / "app" / "db" / "relational" / "migrations"
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(migrations))
    config.set_main_option(
        "sqlalchemy.url", TEST_URL.render_as_string(hide_password=False)
    )
    command.upgrade(config, "head")

    test_engine = create_engine(TEST_URL)
    yield test_engine
    test_engine.dispose()


@pytest.fixture
def session_factory(engine: Engine) -> sessionmaker[Session]:
    with engine.begin() as connection:
        # CASCADE empties every table that references these.
        connection.execute(
            text("TRUNCATE users, repositories RESTART IDENTITY CASCADE")
        )
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def app(
    session_factory: sessionmaker[Session], monkeypatch: pytest.MonkeyPatch
) -> FastAPI:
    application = create_app()

    def test_session() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    application.dependency_overrides[get_session] = test_session
    # Never reach Redis or a worker. The job row is what these tests check.
    monkeypatch.setattr(
        analyze_repository, "delay", lambda **_: SimpleNamespace(id="test-task")
    )
    return application


@pytest.fixture
def browser(app: FastAPI) -> Iterator[Callable[[], TestClient]]:
    """Each call opens a separate browser — its own cookie jar and session."""
    opened: list[TestClient] = []

    def open_browser() -> TestClient:
        client = TestClient(app)
        opened.append(client)
        return client

    yield open_browser
    for client in opened:
        client.close()


@pytest.fixture
def sign_up(browser: Callable[[], TestClient]) -> Callable[..., TestClient]:
    """A browser that has just created an account and is signed in to it."""

    def _sign_up(
        email: str = "ada@example.com", name: str = "Ada Lovelace"
    ) -> TestClient:
        client = browser()
        response = client.post(
            "/api/v1/auth/signup",
            json={"name": name, "email": email, "password": PASSWORD},
        )
        assert response.status_code == 201, response.text
        return client

    return _sign_up
