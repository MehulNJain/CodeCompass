"""M2 — Python parsing."""

from pathlib import Path

from app.modules.ingestion.ingest import Inventory, SourceFile
from app.modules.parsing.languages import python
from app.modules.parsing.model import Import, Symbol
from app.modules.parsing.parse import parse_files

SOURCE = b'''\
import os, a.b as c
from . import sibling
from ..pkg.mod import y as z, w
from m import *

if TYPE_CHECKING:
    from typing_only import T


@decorator
def top():
    import lazy

    def inner():
        pass


class Shape:
    def area(self):
        return 0

    class Meta:
        pass


def broken(:
'''


def test_imports_are_extracted_as_written() -> None:
    imports, _ = python.parse(SOURCE)

    assert imports == [
        Import("os", (), 0, 1),
        Import("a.b", (), 0, 1),
        Import("", ("sibling",), 1, 2),
        Import("pkg.mod", ("y", "w"), 2, 3),
        Import("m", (), 0, 4),
        Import("typing_only", ("T",), 0, 7),
        Import("lazy", (), 0, 12),
    ]


def test_symbols_skip_functions_nested_in_functions() -> None:
    _, symbols = python.parse(SOURCE)

    assert [(s.name, s.kind) for s in symbols] == [
        ("top", "function"),
        ("Shape", "class"),
        ("area", "method"),
        ("Meta", "class"),
        ("broken", "function"),  # tree-sitter recovers from the syntax error
    ]
    assert symbols[0] == Symbol("top", "function", 11, 15)


def test_parse_files_only_parses_languages_with_an_adapter(tmp_path: Path) -> None:
    (tmp_path / "a.py").write_text("import b\n")
    (tmp_path / "b.ts").write_text("export {}\n")
    inventory = Inventory(
        root=tmp_path,
        commit="0" * 40,
        files=[SourceFile("a.py", "python", 9), SourceFile("b.ts", "typescript", 10)],
    )

    parsed = parse_files(inventory)

    assert [(p.path, p.imports) for p in parsed] == [("a.py", [Import("b", (), 0, 1)])]
