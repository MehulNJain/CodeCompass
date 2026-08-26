import pytest

from app.services.repository_service import derive_name


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://github.com/pallets/flask", "pallets/flask"),
        ("https://github.com/pallets/flask.git", "pallets/flask"),
        ("https://gitlab.com/group/subgroup/project", "subgroup/project"),
        ("git@github.com:pallets/flask.git", "pallets/flask"),
    ],
)
def test_derive_name(url: str, expected: str) -> None:
    assert derive_name(url) == expected
