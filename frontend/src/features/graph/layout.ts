import dagre from '@dagrejs/dagre'
import type { GraphEdge, GraphFile } from '@/types/api'

export const NODE_HEIGHT = 52
const GAP_X = 24
const LINE_GAP = 40 // between wrapped lines of one layer
const LAYER_GAP = 76 // between layers

/** 184px for the least important file up to 256px for the most. */
export function nodeWidth(score: number): number {
  return Math.round(184 + 72 * score)
}

export type Placed = { x: number; y: number; width: number; row: number }

export type Bounds = { x: number; y: number; width: number; height: number }

/*
 * Layered top-to-bottom: importers above what they import, so entry points
 * sit on top and the foundations everything depends on at the bottom.
 *
 * dagre decides the layers and the left-to-right order within each (it keeps
 * crossing lines down). Foundation layers are often very wide — everything
 * imports the same few files — so a layer longer than `perLine` wraps onto
 * extra lines, in dagre's order. Without that the graph is one long strip
 * that only fits on screen at an unreadable zoom. `row` drives the staggered
 * entrance.
 *
 * Files with no links among those shown (often empty `__init__.py` files)
 * would all land in dagre's top layer and crowd out the entry points, so
 * they go last, as their own group at the bottom.
 */
export function layout(
  files: GraphFile[],
  edges: GraphEdge[],
  perLine: number,
): { placed: Map<number, Placed>; bounds: Bounds } {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: GAP_X, ranksep: LAYER_GAP })
  g.setDefaultEdgeLabel(() => ({}))
  const linked = new Set(edges.flatMap((e) => [e.source, e.target]))
  const connected = files.filter((f) => linked.has(f.id))
  const loose = files.filter((f) => !linked.has(f.id))

  for (const file of connected) {
    g.setNode(String(file.id), {
      width: nodeWidth(file.importance_score),
      height: NODE_HEIGHT,
    })
  }
  for (const edge of edges) g.setEdge(String(edge.source), String(edge.target))
  dagre.layout(g)

  const layers = new Map<number, GraphFile[]>()
  for (const file of connected) {
    const y = g.node(String(file.id)).y
    layers.set(y, [...(layers.get(y) ?? []), file])
  }
  const ordered = [...layers.keys()]
    .sort((a, b) => a - b)
    .map((y) =>
      layers
        .get(y)!
        .sort((a, b) => g.node(String(a.id)).x - g.node(String(b.id)).x),
    )
  if (loose.length) ordered.push(loose) // already in importance order

  const placed = new Map<number, Placed>()
  let y = 0
  let row = 0
  let maxHalfWidth = 0
  for (const layer of ordered) {
    for (let start = 0; start < layer.length; start += perLine) {
      const line = layer.slice(start, start + perLine)
      const widths = line.map((f) => nodeWidth(f.importance_score))
      const total =
        widths.reduce((a, b) => a + b, 0) + GAP_X * (line.length - 1)
      maxHalfWidth = Math.max(maxHalfWidth, total / 2)
      let x = -total / 2 // every line is centred on x = 0
      line.forEach((file, i) => {
        placed.set(file.id, { x, y, width: widths[i], row })
        x += widths[i] + GAP_X
      })
      y += NODE_HEIGHT + LINE_GAP
      row += 1
    }
    y += LAYER_GAP - LINE_GAP
  }

  const height = Math.max(y - LAYER_GAP, NODE_HEIGHT)
  return {
    placed,
    bounds: { x: -maxHalfWidth, y: 0, width: maxHalfWidth * 2, height },
  }
}
