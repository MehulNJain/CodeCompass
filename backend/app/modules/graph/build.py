"""M3 — Graph: resolve each import to a file in the repository and build the
file-level dependency graph. An edge A -> B means "A imports B".

Imports that resolve to nothing in the repository (the standard library,
third-party packages) are dropped: the graph is about this codebase only.
"""

import networkx as nx

from app.core.logging import get_logger
from app.modules.parsing.model import Import, ParsedFile

logger = get_logger(__name__)


def build_graph(parsed: list[ParsedFile]) -> nx.DiGraph:
    """Every parsed file is a node, even one with no edges, so it still gets a
    score. Each edge carries the line of the first import that created it."""
    paths = {p.path for p in parsed}
    roots = _source_roots(paths)
    graph = nx.DiGraph()
    graph.add_nodes_from(sorted(paths))
    for file in parsed:
        for imp in file.imports:
            for target in _resolve(imp, file.path, paths, roots):
                if target != file.path and not graph.has_edge(file.path, target):
                    graph.add_edge(file.path, target, line=imp.line)
    logger.info("graph: %d files, %d imports", graph.number_of_nodes(),
                graph.number_of_edges())
    return graph


def _source_roots(paths: set[str]) -> list[str]:
    """Directories that absolute imports are resolved against: the repository
    root, plus the parent of every top-level package (a directory with an
    `__init__.py` whose parent has none). That covers `src/` layouts and
    monorepos with several packages side by side."""
    packages = {p.rsplit("/", 1)[0] for p in paths if p.endswith("/__init__.py")}
    roots = {""}
    for pkg in packages:
        parent = pkg.rsplit("/", 1)[0] if "/" in pkg else ""
        if parent not in packages:
            roots.add(parent)
    return sorted(roots, key=lambda r: (r.count("/"), r))


def _resolve(
    imp: Import, importer: str, paths: set[str], roots: list[str]
) -> list[str]:
    if imp.level:
        # `from ..x import y` in a/b/c.py is relative to package a/b, then up
        # one level per extra dot.
        base = importer.split("/")[:-1]
        if imp.level - 1 > len(base):
            return []
        bases = ["/".join(base[: len(base) - (imp.level - 1)])]
    else:
        # Absolute: try each source root, then the importer's own directory
        # (a loose script importing its neighbour, as `python script.py` allows).
        bases = [*roots, importer.rsplit("/", 1)[0] if "/" in importer else ""]

    module = imp.module.replace(".", "/")
    for base in bases:
        prefix = "/".join(part for part in (base, module) if part)
        # `from pkg import mod` imports the submodule pkg/mod.py when there is
        # one; any other name (a function, a class) lives in pkg itself.
        subs = [_module_file("/".join(filter(None, (prefix, n))), paths)
                for n in imp.names]
        targets = [s for s in subs if s]
        if None in subs or not imp.names:
            found = _module_file(prefix, paths)
            if found:
                targets.insert(0, found)
        if targets:
            return targets
    return []


def _module_file(prefix: str, paths: set[str]) -> str | None:
    if not prefix:
        return None
    for candidate in (f"{prefix}.py", f"{prefix}/__init__.py"):
        if candidate in paths:
            return candidate
    return None
