"""One user's repositories are invisible to every other user.

Before ownership existed, `source_url` was unique across all users, and a
second user submitting the same URL was handed the first user's row — and with
it, eventually, their tours and code.
"""

from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

REPOSITORIES = "/api/v1/repositories"
URL = "https://github.com/pallets/flask"

SignUp = Callable[..., TestClient]


def test_the_list_shows_only_your_own_repositories(sign_up: SignUp) -> None:
    ada = sign_up("ada@example.com")
    grace = sign_up("grace@example.com")

    assert ada.post(REPOSITORIES, json={"source_url": URL}).status_code == 202

    assert ada.get(REPOSITORIES).json()["total"] == 1
    assert grace.get(REPOSITORIES).json()["total"] == 0


def test_the_same_url_gives_each_user_their_own_row(sign_up: SignUp) -> None:
    ada = sign_up("ada@example.com")
    grace = sign_up("grace@example.com")

    ada_job = ada.post(REPOSITORIES, json={"source_url": URL}).json()
    grace_job = grace.post(REPOSITORIES, json={"source_url": URL}).json()

    assert ada_job["repository_id"] != grace_job["repository_id"]


def test_resubmitting_your_own_url_requeues_the_same_row(sign_up: SignUp) -> None:
    ada = sign_up()

    first = ada.post(REPOSITORIES, json={"source_url": URL}).json()
    second = ada.post(REPOSITORIES, json={"source_url": URL}).json()

    assert first["repository_id"] == second["repository_id"]
    assert first["id"] != second["id"]  # a new job each time


@pytest.mark.parametrize(
    ("method", "path", "owner_status"),
    [
        ("GET", "/api/v1/repositories/{repository_id}", 200),
        ("GET", "/api/v1/repositories/{repository_id}/job", 200),
        ("GET", "/api/v1/jobs/{job_id}", 200),
        ("GET", "/api/v1/tours/repository/{repository_id}", 501),
        ("GET", "/api/v1/graph/repository/{repository_id}", 501),
        ("POST", "/api/v1/qa/repository/{repository_id}", 501),
    ],
)
def test_another_users_ids_answer_404(
    sign_up: SignUp, method: str, path: str, owner_status: int
) -> None:
    """404, not 403 — a 403 would confirm the repository exists."""
    ada = sign_up("ada@example.com")
    grace = sign_up("grace@example.com")
    job = ada.post(REPOSITORIES, json={"source_url": URL}).json()
    url = path.format(repository_id=job["repository_id"], job_id=job["id"])

    assert ada.request(method, url).status_code == owner_status
    assert grace.request(method, url).status_code == 404
