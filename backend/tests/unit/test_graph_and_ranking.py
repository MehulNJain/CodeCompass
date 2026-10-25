"""M3 — import resolution and the dependency graph; M4 — ranking."""

from app.modules.graph.build import build_graph
from app.modules.parsing.model import Import, ParsedFile
from app.modules.ranking.rank import rank


def _file(path: str, *imports: tuple[str, tuple[str, ...], int]) -> ParsedFile:
    return ParsedFile(path, "python", [Import(m, n, lvl, 1) for m, n, lvl in imports])


# A src/ layout package, a loose script, and tests outside the package.
REPO = [
    _file("src/shop/__init__.py", ("shop.core", ("Cart",), 0)),
    _file("src/shop/core.py", ("os", (), 0), ("requests", (), 0), ("util", (), 1)),
    _file("src/shop/util.py"),
    _file("src/shop/__main__.py", ("", ("cli",), 1)),           # from . import cli
    _file("src/shop/cli.py", ("shop", ("core", "make_cart"), 0)),  # submodule + name
    _file("src/shop/api/__init__.py"),
    _file("src/shop/api/routes.py", ("core", (), 2), ("nowhere", (), 3)),
    _file("tests/test_core.py", ("shop.core", (), 0), ("shop", ("util",), 0)),
    _file("scripts/run.py", ("helpers", (), 0)),
    _file("scripts/helpers.py"),
]


def _edges(parsed: list[ParsedFile]) -> set[tuple[str, str]]:
    return set(build_graph(parsed).edges)


def test_imports_resolve_to_files_and_externals_are_dropped() -> None:
    assert _edges(REPO) == {
        ("src/shop/__init__.py", "src/shop/core.py"),
        ("src/shop/core.py", "src/shop/util.py"),
        ("src/shop/__main__.py", "src/shop/cli.py"),
        ("src/shop/cli.py", "src/shop/__init__.py"),  # make_cart lives in the package
        ("src/shop/cli.py", "src/shop/core.py"),
        ("src/shop/api/routes.py", "src/shop/core.py"),
        ("tests/test_core.py", "src/shop/core.py"),
        ("tests/test_core.py", "src/shop/util.py"),
        ("scripts/run.py", "scripts/helpers.py"),
    }


def test_every_file_is_a_node_and_self_imports_are_dropped() -> None:
    graph = build_graph([_file("solo.py", ("solo", (), 0))])

    assert list(graph.nodes) == ["solo.py"]
    assert graph.number_of_edges() == 0


def test_ranking_puts_shared_code_first_and_boosts_entry_points() -> None:
    graph = build_graph([
        _file("pkg/__init__.py"),
        _file("pkg/core.py"),
        _file("pkg/a.py", ("pkg.core", (), 0)),
        _file("pkg/b.py", ("pkg.core", (), 0)),
        _file("pkg/leaf.py"),
        _file("pkg/cli.py", ("pkg.a", (), 0)),
    ])

    scores = rank(graph)

    assert scores["pkg/core.py"] == 1.0
    assert scores["pkg/cli.py"] > scores["pkg/leaf.py"]
    assert all(0 < s <= 1 for s in scores.values())
    assert rank(build_graph([])) == {}

