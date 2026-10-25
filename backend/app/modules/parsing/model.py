"""The normalised, language-independent output of M2.

Every language adapter in `languages/` produces these; M3 consumes them and
never sees a syntax tree.
"""

from dataclasses import dataclass, field
from typing import Literal


@dataclass(frozen=True)
class Import:
    """One imported module, exactly as written — resolving it to a file is M3.

    `import a.b`             -> module="a.b", names=(),          level=0
    `from a.b import c, d`   -> module="a.b", names=("c", "d"),  level=0
    `from ..pkg import e`    -> module="pkg", names=("e",),      level=2
    `from . import f`        -> module="",    names=("f",),      level=1
    """

    module: str
    names: tuple[str, ...]
    level: int
    line: int  # 1-based


@dataclass(frozen=True)
class Symbol:
    name: str
    kind: Literal["function", "class", "method"]
    start_line: int  # 1-based, inclusive
    end_line: int


@dataclass(frozen=True)
class ParsedFile:
    path: str
    language: str
    imports: list[Import] = field(default_factory=list)
    symbols: list[Symbol] = field(default_factory=list)
