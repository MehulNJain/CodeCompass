import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  useStore,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import {
  FileNode,
  type FileFlowNode,
  type NodeState,
} from '@/features/graph/components/FileNode'
import { GraphLegend } from '@/features/graph/components/GraphLegend'
import { GraphSearch } from '@/features/graph/components/GraphSearch'
import { FileDetailPanel } from '@/features/graph/components/FileDetailPanel'
import { layout, NODE_HEIGHT } from '@/features/graph/layout'
import { ROLES, roleOf, type Role } from '@/features/graph/roles'
import type { GraphEdge, GraphFile } from '@/types/api'

const nodeTypes = { file: FileNode }

/** Below this zoom, 12px labels shrink past legible. */
const READABLE_ZOOM = 0.75

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

/** SVG attributes (arrowheads, minimap fills) cannot read CSS variables, so
 * resolve the theme token to its value once. */
function token(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/*
 * The interactive import graph. `compact` sits beside the Start here list;
 * `full` is the Graph tab, with search, a minimap, and a details panel.
 *
 * Hovering previews a file's connections; clicking pins them. Selecting from
 * outside the canvas (the list, search, the panel) flies the camera there.
 */
export function GraphExplorer(props: {
  files: GraphFile[]
  edges: GraphEdge[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  variant: 'compact' | 'full'
}) {
  return (
    <ReactFlowProvider>
      <Explorer {...props} />
    </ReactFlowProvider>
  )
}

function Explorer({
  files,
  edges,
  selectedId,
  onSelect,
  variant,
}: {
  files: GraphFile[]
  edges: GraphEdge[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  variant: 'compact' | 'full'
}) {
  const flow = useReactFlow()
  const [hiddenRoles, setHiddenRoles] = useState<Set<Role>>(new Set(['test']))
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const clickedId = useRef<number | null>(null)

  const roles = useMemo(
    () => new Map(files.map((f) => [f.id, roleOf(f.path)] as const)),
    [files],
  )

  // A file picked while its role is hidden (from search or the list) brings
  // its role back rather than selecting something invisible.
  const selectedRole = selectedId === null ? undefined : roles.get(selectedId)
  useEffect(() => {
    if (selectedRole && hiddenRoles.has(selectedRole)) {
      setHiddenRoles(
        (hidden) => new Set([...hidden].filter((r) => r !== selectedRole)),
      )
    }
  }, [selectedRole, hiddenRoles])

  const visible = useMemo(() => {
    const shown = files.filter((f) => !hiddenRoles.has(roles.get(f.id)!))
    const ids = new Set(shown.map((f) => f.id))
    return {
      files: shown,
      edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    }
  }, [files, edges, hiddenRoles, roles])

  const { placed, bounds } = useMemo(
    () => layout(visible.files, visible.edges, variant === 'compact' ? 4 : 5),
    [visible, variant],
  )

  const laidOut = useMemo<FileFlowNode[]>(
    () =>
      visible.files.map((file) => {
        const p = placed.get(file.id)!
        return {
          id: String(file.id),
          type: 'file',
          position: { x: p.x, y: p.y },
          ariaLabel: `${file.path}, ${ROLES[roles.get(file.id)!].label}, imported by ${file.imported_by}`,
          data: {
            file,
            role: roles.get(file.id)!,
            state: 'normal',
            row: p.row,
            width: p.width,
          },
        }
      }),
    [visible, placed, roles],
  )

  // Local node state so files can be dragged; reset whenever the layout does.
  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut)

  /*
   * The opening view. Fit the whole graph if that stays readable; otherwise
   * open at a readable zoom on the top of the graph — the entry points, where
   * reading starts — and let the user pan down. (The fit button in the
   * controls still shows everything.)
   */
  const paneWidth = useStore((s) => s.width)
  const paneHeight = useStore((s) => s.height)
  const showTop = useCallback(
    (duration: number) => {
      if (!paneWidth || !paneHeight) return
      const pad = 32
      const fit = Math.min(
        (paneWidth - 2 * pad) / bounds.width,
        (paneHeight - 2 * pad) / bounds.height,
      )
      const zoom = Math.min(Math.max(fit, READABLE_ZOOM), 1.1)
      const fits = fit >= READABLE_ZOOM
      flow.setViewport(
        {
          x: paneWidth / 2 - (bounds.x + bounds.width / 2) * zoom,
          y: fits
            ? paneHeight / 2 - (bounds.y + bounds.height / 2) * zoom
            : pad - bounds.y * zoom,
          zoom,
        },
        { duration: reduceMotion ? 0 : duration },
      )
    },
    [paneWidth, paneHeight, bounds, flow],
  )

  useEffect(() => setNodes(laidOut), [laidOut, setNodes])

  // First time (and on resize): place the camera at once. After a filter
  // change: glide to the new layout.
  const firstLayout = useRef(true)
  useEffect(() => {
    const duration = firstLayout.current ? 0 : 400
    firstLayout.current = false
    requestAnimationFrame(() => showTop(duration))
  }, [showTop])

  // Fly to a file selected from outside the canvas.
  useEffect(() => {
    if (selectedId === null) return
    if (clickedId.current === selectedId) {
      // Clicked on the canvas: the file is already in view.
      clickedId.current = null
      return
    }
    const node = flow.getNode(String(selectedId)) as FileFlowNode | undefined
    if (!node) return
    flow.setCenter(
      node.position.x + node.data.width / 2,
      node.position.y + NODE_HEIGHT / 2,
      { zoom: Math.max(flow.getZoom(), 1), duration: reduceMotion ? 0 : 600 },
    )
  }, [selectedId, flow, nodes.length])

  const focusId = selectedId ?? hoveredId
  const neighbours = useMemo(() => {
    const ids = new Set<number>()
    for (const e of visible.edges) {
      if (e.source === focusId) ids.add(e.target)
      if (e.target === focusId) ids.add(e.source)
    }
    return ids
  }, [visible.edges, focusId])

  const styledNodes = nodes.map((node) => {
    const id = Number(node.id)
    const state: NodeState =
      focusId === null
        ? 'normal'
        : id === focusId
          ? 'selected'
          : neighbours.has(id)
            ? 'neighbour'
            : 'dim'
    return node.data.state === state
      ? node
      : { ...node, data: { ...node.data, state } }
  })

  const colours = useMemo(
    () => ({
      lit: token('--color-accent'),
      quiet: token('--color-line-strong'),
    }),
    [],
  )
  const styledEdges: Edge[] = visible.edges.map((e) => {
    const lit = e.source === focusId || e.target === focusId
    const colour = lit ? colours.lit : colours.quiet
    return {
      id: `${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      // The dashes flow from importer to imported: the direction of the
      // dependency, shown rather than labelled.
      animated: lit && !reduceMotion,
      zIndex: lit ? 1 : 0,
      style: {
        stroke: colour,
        strokeWidth: lit ? 1.75 : 1,
        opacity: focusId === null ? 0.55 : lit ? 1 : 0.06,
        transition: 'opacity 200ms, stroke 200ms',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: colour,
        width: 14,
        height: 14,
      },
    }
  })

  const roleCounts = useMemo(() => {
    const counts = new Map<Role, number>()
    for (const role of roles.values())
      counts.set(role, (counts.get(role) ?? 0) + 1)
    return counts
  }, [roles])

  const selected = files.find((f) => f.id === selectedId) ?? null

  const canvas = (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={(_, node) => {
        const id = Number(node.id)
        clickedId.current = id
        onSelect(id === selectedId ? null : id)
      }}
      onNodeMouseEnter={(_, node) => setHoveredId(Number(node.id))}
      onNodeMouseLeave={() => setHoveredId(null)}
      onPaneClick={() => onSelect(null)}
      nodesConnectable={false}
      colorMode="dark"
      minZoom={0.1}
      maxZoom={2}
      // React Flow is MIT-licensed; it is credited in the site footer.
      proOptions={{ hideAttribution: true }}
    >
      <Background color={token('--color-line')} gap={22} size={1.2} />
      <Controls showInteractive={false} position="bottom-left" />
      {variant === 'full' && (
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          bgColor={token('--color-surface')}
          maskColor="rgba(0, 0, 0, 0.6)"
          nodeColor={(node) =>
            token(`--color-role-${(node as FileFlowNode).data.role}`)
          }
          nodeBorderRadius={4}
          style={{ width: 168, height: 112 }}
          // Too much of a phone screen; pinch-zoom covers it there.
          className="hidden sm:block"
        />
      )}
    </ReactFlow>
  )

  // The legend and search sit in a bar above the canvas, never over it.
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-2">
        <GraphLegend
          counts={roleCounts}
          hidden={hiddenRoles}
          onToggle={(role) =>
            setHiddenRoles((hidden) => {
              const next = new Set(hidden)
              if (next.has(role)) next.delete(role)
              else next.add(role)
              return next
            })
          }
        />
        {variant === 'full' && <GraphSearch files={files} onPick={onSelect} />}
      </div>

      {variant === 'compact' ? (
        <div className="min-h-0 flex-1">{canvas}</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* A fixed height on phones: in a column, flex-1 alone collapses
              the canvas to nothing. */}
          <div className="h-[28rem] shrink-0 lg:h-auto lg:min-w-0 lg:flex-1">
            {canvas}
          </div>
          <FileDetailPanel
            file={selected}
            role={selected ? roles.get(selected.id)! : null}
            files={files}
            edges={edges}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}
