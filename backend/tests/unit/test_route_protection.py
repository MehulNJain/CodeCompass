"""Every API route rejects an anonymous request unless it is allowlisted here.

Adding a public route means adding it to PUBLIC_ROUTES — which is the point.
A route being reachable without signing in should be a decision someone made,
not something that happened because a router was mounted in the wrong place.
"""

import re

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

PUBLIC_ROUTES = {
    ("GET", "/api/v1/health"),
    ("GET", "/api/v1/health/ready"),
    ("POST", "/api/v1/auth/signup"),
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/logout"),
}


def _api_routes() -> list[tuple[str, str]]:
    """Read from the OpenAPI schema, not `app.routes` — since FastAPI 0.13x an
    included router is no longer flattened into `app.routes`, and walking it
    silently finds nothing."""
    paths = create_app().openapi()["paths"]
    return sorted(
        (method.upper(), path)
        for path, operations in paths.items()
        for method in operations
    )


PRIVATE_ROUTES = [route for route in _api_routes() if route not in PUBLIC_ROUTES]


def test_the_allowlist_names_routes_that_exist() -> None:
    assert set(_api_routes()) >= PUBLIC_ROUTES


def test_there_are_private_routes_to_check() -> None:
    # Guards against the parametrised test below passing by checking nothing —
    # which is exactly what happened when this read `app.routes`.
    assert len(PRIVATE_ROUTES) >= 8


@pytest.mark.parametrize(("method", "path"), PRIVATE_ROUTES)
def test_private_route_rejects_an_anonymous_request(
    client: TestClient, method: str, path: str
) -> None:
    url = re.sub(r"\{[^}]+\}", "1", path)
    response = client.request(method, url)
    assert response.status_code == 401, (
        f"{method} {path} answered {response.status_code} without a session"
    )
