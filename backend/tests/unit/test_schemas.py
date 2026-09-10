import pytest
from pydantic import ValidationError

from app.schemas.repository import RepositoryCreate


def test_strips_the_git_suffix() -> None:
    payload = RepositoryCreate(source_url="https://github.com/pallets/flask.git")
    assert payload.source_url == "https://github.com/pallets/flask"


def test_rejects_a_non_git_url() -> None:
    with pytest.raises(ValidationError):
        RepositoryCreate(source_url="pallets/flask")
