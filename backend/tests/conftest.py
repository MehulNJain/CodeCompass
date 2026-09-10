import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """The app is importable without any database being up — creating the
    engine does not open a connection. Anything that actually queries belongs
    in tests/integration/."""
    return TestClient(create_app())
