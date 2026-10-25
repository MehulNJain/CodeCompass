import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { NODE_HEIGHT } from '@/features/graph/layout'
import { ROLES, type Role } from '@/features/graph/roles'
import type { GraphFile } from '@/types/api'

export type NodeState = 'selected' | 'neighbour' | 'dim' | 'normal'

export type FileNodeData = {
  file: GraphFile
  role: Role
  state: NodeState
  row: number
  width: number
}

export type FileFlowNode = Node<FileNodeData, 'file'>

const SHAPE_CLASS = {
  pill: 'rounded-full px-5',
  box: 'rounded-lg',
  dashed: 'rounded-lg border-dashed',
  folder: 'rounded-lg rounded-tl-none',
  // Elliptical top and bottom corners read as a database cylinder.
  cylinder: 'rounded-[50%/12px] pt-2',
} as const

/** `src/click/core.py` -> `click/core.py`: enough to tell the many
 * `__init__.py` files apart without the whole path. */
function shortName(path: string): string {
  return path.split('/').slice(-2).join('/')
}

function FileNodeView({ data }: NodeProps<FileFlowNode>) {
  const { file, role, state, row, width } = data
  const { icon: Icon, shape, colour } = ROLES[role]
  const lit = state === 'selected' || state === 'neighbour'

  return (
    <div
      // Arrives row by row: entry points first, foundations last.
      style={{
        width,
        animation: `graph-node-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) ${row * 55}ms both`,
      }}
      className={`transition-opacity duration-200 ${state === 'dim' ? 'opacity-20' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!pointer-events-none !opacity-0"
      />
      <div
        title={file.path}
        style={{
          height: NODE_HEIGHT,
          borderColor: lit
            ? colour
            : `color-mix(in srgb, ${colour} 45%, transparent)`,
          boxShadow:
            state === 'selected'
              ? `0 0 0 1px ${colour}, 0 0 28px color-mix(in srgb, ${colour} 35%, transparent)`
              : undefined,
        }}
        className={`relative flex cursor-pointer flex-col justify-center gap-1.5 border px-3 transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 ${
          state === 'selected' ? 'scale-105 bg-surface-2' : 'bg-surface'
        } ${SHAPE_CLASS[shape]}`}
      >
        {shape === 'folder' && (
          // The folder tab sits on the box's top-left corner.
          <span
            aria-hidden="true"
            style={{ borderColor: 'inherit' }}
            className="absolute -top-2 -left-px h-2 w-14 rounded-t-md border border-b-0 bg-inherit"
          />
        )}
        {shape === 'cylinder' && (
          // The lid of the cylinder.
          <span
            aria-hidden="true"
            style={{ borderColor: 'inherit' }}
            className="absolute inset-x-0 top-0 h-3 rounded-[50%] border-b"
          />
        )}
        <span className="flex min-w-0 items-center gap-2">
          <Icon
            className="size-3.5 shrink-0"
            style={{ color: colour }}
            aria-hidden="true"
          />
          <span
            className={`truncate font-mono text-xs ${
              lit || file.importance_score >= 0.5
                ? 'text-ink'
                : 'text-ink-muted'
            }`}
          >
            {shortName(file.path)}
          </span>
        </span>
        {/* Importance, as the same bar the list shows. */}
        <span className="h-0.5 overflow-hidden rounded-full bg-line">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${Math.max(file.importance_score * 100, 3)}%`,
              backgroundColor: colour,
            }}
          />
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!pointer-events-none !opacity-0"
      />
    </div>
  )
}

export const FileNode = memo(FileNodeView)
