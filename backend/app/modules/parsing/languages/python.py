"""Python adapter: tree-sitter syntax tree -> imports and symbols."""

import tree_sitter_python
from tree_sitter import Language, Node, Parser

from app.modules.parsing.model import Import, Symbol

_parser = Parser(Language(tree_sitter_python.language()))


def parse(source: bytes) -> tuple[list[Import], list[Symbol]]:
    """Every import anywhere in the file (including inside functions and
    `if TYPE_CHECKING:` blocks), plus top-level functions, classes, and their
    methods. Functions nested inside functions are implementation detail and
    are left out. tree-sitter tolerates syntax errors, so this never raises on
    bad code."""
    imports: list[Import] = []
    symbols: list[Symbol] = []
    _walk(_parser.parse(source).root_node, imports, symbols, scope="module")
    return imports, symbols


def _walk(node: Node, imports: list[Import], symbols: list[Symbol], scope: str) -> None:
    for child in node.children:
        kind = child.type
        if kind == "import_statement":
            imports.extend(_plain_import(child))
        elif kind == "import_from_statement":
            imports.append(_from_import(child))
        elif kind in ("function_definition", "class_definition"):
            is_class = kind == "class_definition"
            if scope != "function":
                symbols.append(
                    Symbol(
                        name=_text(child.child_by_field_name("name")),
                        kind="class" if is_class else
                        "method" if scope == "class" else "function",
                        start_line=child.start_point.row + 1,
                        end_line=child.end_point.row + 1,
                    )
                )
            _walk(child, imports, symbols, scope="class" if is_class else "function")
        else:
            # Blocks, decorators, if/try bodies: same scope, keep descending.
            _walk(child, imports, symbols, scope)


def _plain_import(node: Node) -> list[Import]:
    """`import a, b.c as d` -> two imports."""
    line = node.start_point.row + 1
    return [
        Import(module=_dotted(name), names=(), level=0, line=line)
        for name in node.children_by_field_name("name")
    ]


def _from_import(node: Node) -> Import:
    module_node = node.child_by_field_name("module_name")
    level, module = 0, _text(module_node)
    if module_node.type == "relative_import":
        prefix = next(c for c in module_node.children if c.type == "import_prefix")
        level = prefix.child_count
        dotted = [c for c in module_node.children if c.type == "dotted_name"]
        module = _text(dotted[0]) if dotted else ""
    names = tuple(_dotted(name) for name in node.children_by_field_name("name"))
    line = node.start_point.row + 1
    return Import(module=module, names=names, level=level, line=line)


def _dotted(node: Node) -> str:
    """The imported name, without any `as` alias."""
    if node.type == "aliased_import":
        node = node.child_by_field_name("name")
    return _text(node)


def _text(node: Node | None) -> str:
    return node.text.decode("utf-8", errors="replace") if node else ""
