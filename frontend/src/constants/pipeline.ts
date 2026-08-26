/*
 * The analysis stages, mirroring `PIPELINE_STAGES` in
 * `backend/app/workers/tasks/analyze_repository.py` (documentation §11).
 * The backend sends the raw key; these are the labels for it.
 */
export const PIPELINE_STAGES = [
  { key: 'ingest', label: 'Ingest' },
  { key: 'parse', label: 'Parse' },
  { key: 'build_graph', label: 'Build graph' },
  { key: 'rank', label: 'Rank' },
  { key: 'embed', label: 'Embed' },
  { key: 'generate_tour', label: 'Generate tour' },
  { key: 'explain', label: 'Explain' },
] as const

export function stageLabel(key: string | null): string {
  if (!key) return '—'
  return PIPELINE_STAGES.find((stage) => stage.key === key)?.label ?? key
}
