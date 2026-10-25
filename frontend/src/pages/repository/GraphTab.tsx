import { useMemo } from 'react'
import { GraphExplorer } from '@/features/graph/components/GraphExplorer'
import { AnalysisGate } from '@/pages/repository/AnalysisGate'
import { topFiles, useSelectedFile } from '@/pages/repository/workspace'
import type { Graph } from '@/types/api'

// ponytail: the 100 most important files; module-level grouping (Phase B)
// for repositories where that is too many to read.
const TOP = 100

/** The graph at full width, with search, a minimap and file details. */
export default function GraphTab() {
  return <AnalysisGate>{(graph) => <FullGraph graph={graph} />}</AnalysisGate>
}

function FullGraph({ graph }: { graph: Graph }) {
  const [selectedId, select] = useSelectedFile()
  // Stable across selection changes, so the graph keeps its layout.
  const { files, edges } = useMemo(() => topFiles(graph, TOP), [graph])

  return (
    <section
      aria-label="Dependency graph"
      className="overflow-hidden rounded-xl border border-line bg-canvas lg:h-[calc(100dvh-18.5rem)]"
    >
      <GraphExplorer
        files={files}
        edges={edges}
        selectedId={selectedId}
        onSelect={select}
        variant="full"
      />
    </section>
  )
}
