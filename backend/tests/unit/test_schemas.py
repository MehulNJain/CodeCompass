import pytest
from pydantic import ValidationError

from app.schemas.auth import SignInRequest, SignUpRequest
from app.schemas.repository import RepositoryCreate


def test_strips_the_git_suffix() -> None:
    payload = RepositoryCreate(source_url="https://github.com/pallets/flask.git")
    assert payload.source_url == "https://github.com/pallets/flask"


def test_rejects_a_non_git_url() -> None:
    with pytest.raises(ValidationError):
        RepositoryCreate(source_url="pallets/flask")


def test_email_is_lowercased_so_case_cannot_split_an_account() -> None:
    payload = SignInRequest(email="Ada@Example.COM", password="x")
    assert payload.email == "ada@example.com"


def test_rejects_something_that_is_not_an_email() -> None:
    with pytest.raises(ValidationError):
        SignInRequest(email="ada", password="x")


def test_name_is_trimmed_before_its_length_is_checked() -> None:
    assert SignUpRequest(
        name="  Ada  ", email="ada@example.com", password="long enough"
    ).name == "Ada"
    with pytest.raises(ValidationError):
        SignUpRequest(name="  A  ", email="ada@example.com", password="long enough")


@pytest.mark.parametrize("password", ["short", "x" * 257])
def test_sign_up_bounds_the_password_length(password: str) -> None:
    with pytest.raises(ValidationError):
        SignUpRequest(name="Ada", email="ada@example.com", password=password)
