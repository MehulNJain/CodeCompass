import { useMemo } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import type { GraphEdge, GraphFile } from '@/types/api'

const NODE_WIDTH = 180
const GAP_X = 16
const ROW_HEIGHT = 76
const PER_LINE = 5 // a wide layer wraps onto several lines

/*
 * The import graph, layered: a file sits one row above the deepest file it
 * imports, so entry points end up on top and the foundations everything
 * depends on at the bottom. Arrows point from importer to imported.
 *
 * Selecting a file (here or in the list) lights up what it imports and what
 * imports it, and fades the rest.
 */
export function DependencyGraph({
  files,
  edges,
  selectedId,
  onSelect,
}: {
  files: GraphFile[]
  edges: GraphEdge[]
  selectedId: number | null
  onSelect: (id: number | null) => void
}) {
  const initialNodes = useMemo(() => layout(files, edges), [files, edges])
  // Local node state so files can be dragged around.
  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  const neighbours = useMemo(() => {
    const ids = new Set<number>()
    for (const edge of edges) {
      if (edge.source === selectedId) ids.add(edge.target)
      if (edge.target === selectedId) ids.add(edge.source)
    }
    return ids
  }, [edges, selectedId])

  const styledNodes = nodes.map((node) => {
    const id = Number(node.id)
    const score = (node.data as { score: number }).score
    const tone =
      id === selectedId
        ? 'border-accent bg-accent-dim text-ink'
        : neighbours.has(id)
          ? 'border-accent/60 bg-surface text-ink'
          : selectedId !== null
            ? 'border-line bg-surface text-ink-faint opacity-30'
            : score >= 0.5
              ? 'border-line-strong bg-surface-2 text-ink'
              : 'border-line bg-surface text-ink-muted'
    return {
      ...node,
      className: `rounded-lg border px-2.5 py-2 text-center font-mono text-xs transition-opacity duration-200 ${tone}`,
    }
  })

  const styledEdges: Edge[] = edges.map((edge) => {
    const lit = edge.source === selectedId || edge.target === selectedId
    const colour = lit ? 'var(--color-accent)' : 'var(--color-line-strong)'
    return {
      id: `${edge.source}-${edge.target}`,
      source: String(edge.source),
      target: String(edge.target),
      animated: lit,
      zIndex: lit ? 1 : 0,
      style: {
        stroke: colour,
        strokeWidth: lit ? 1.5 : 1,
        opacity: selectedId === null || lit ? 1 : 0.12,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colour,
        width: 14,
        height: 14,
      },
    }
  })

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) =>
        onSelect(Number(node.id) === selectedId ? null : Number(node.id))
      }
      onPaneClick={() => onSelect(null)}
      nodesConnectable={false}
      colorMode="dark"
      minZoom={0.15}
      fitView
      fitViewOptions={{ padding: 0.04 }}
    >
      <Background color="var(--color-line)" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

/** `src/click/core.py` -> `click/core.py`: enough to tell the many
 * `__init__.py` files apart without the full path. */
function shortName(path: string): string {
  return path.split('/').slice(-2).join('/')
}

function layout(files: GraphFile[], edges: GraphEdge[]): Node[] {
  const imports = new Map<number, number[]>()
  for (const { source, target } of edges) {
    imports.set(source, [...(imports.get(source) ?? []), target])
  }

  const depth = new Map<number, number>()
  const visiting = new Set<number>()
  const depthOf = (id: number): number => {
    const known = depth.get(id)
    if (known !== undefined) return known
    if (visiting.has(id)) return 0 // an import cycle: cut it here
    visiting.add(id)
    const below = (imports.get(id) ?? []).map(depthOf)
    const value = below.length ? Math.max(...below) + 1 : 0
    visiting.delete(id)
    depth.set(id, value)
    return value
  }

  // `files` is sorted by importance, so each row is too.
  const rows = new Map<number, GraphFile[]>()
  for (const file of files) {
    const d = depthOf(file.id)
    rows.set(d, [...(rows.get(d) ?? []), file])
  }

  const nodes: Node[] = []
  let y = 0
  for (const d of [...rows.keys()].sort((a, b) => b - a)) {
    const row = rows.get(d)!
    for (let start = 0; start < row.length; start += PER_LINE) {
      const line = row.slice(start, start + PER_LINE)
      const width = line.length * (NODE_WIDTH + GAP_X) - GAP_X
      line.forEach((file, i) => {
        nodes.push({
          id: String(file.id),
          position: { x: i * (NODE_WIDTH + GAP_X) - width / 2, y },
          data: {
            label: <span title={file.path}>{shortName(file.path)}</span>,
            score: file.importance_score,
          },
          style: { width: NODE_WIDTH },
        })
      })
      y += ROW_HEIGHT
    }
  }
  return nodes
}
