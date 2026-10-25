import { useOutletContext, useSearchParams } from 'react-router-dom'
import { roleOf } from '@/features/graph/roles'
import type { WorkspaceContext } from '@/pages/repository/RepositoryLayout'
import type { Graph } from '@/types/api'

export const useWorkspace = () => useOutletContext<WorkspaceContext>()

/** The selected file lives in the URL (?file=12), so it survives switching
 * tabs and a link to it opens on that file. */
export function useSelectedFile(): [
  number | null,
  (id: number | null) => void,
] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('file')
  const select = (id: number | null) =>
    setParams(id === null ? {} : { file: String(id) }, { replace: true })
  return [raw ? Number(raw) : null, select]
}

/** The top `limit` analysed files (score above 0 — README and other
 * non-Python files score 0) and only the edges among them. */
export function topFiles(graph: Graph, limit: number, { tests = true } = {}) {
  const files = graph.files
    .filter((f) => f.importance_score > 0)
    .filter((f) => tests || roleOf(f.path) !== 'test')
    .slice(0, limit)
  const ids = new Set(files.map((f) => f.id))
  const edges = graph.edges.filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  )
  return { files, edges }
}
