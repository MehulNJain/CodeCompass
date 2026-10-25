import { useMemo } from 'react'
import { GraphExplorer } from '@/features/graph/components/GraphExplorer'
import { StartHereList } from '@/features/graph/components/StartHereList'
import { AnalysisGate } from '@/pages/repository/AnalysisGate'
import { topFiles, useSelectedFile } from '@/pages/repository/workspace'
import type { Graph } from '@/types/api'

// ponytail: the top 40 in the list and the graph beside it; the Graph tab
// shows more.
const TOP = 40

/** The reading order next to a compact graph of the same files. Tests and
 * examples are left out: a newcomer reads the code before its tests. */
export default function StartHereTab() {
  return <AnalysisGate>{(graph) => <StartHere graph={graph} />}</AnalysisGate>
}

function StartHere({ graph }: { graph: Graph }) {
  const [selectedId, select] = useSelectedFile()
  // Stable across selection changes, so the graph keeps its layout.
  const { files, edges } = useMemo(
    () => topFiles(graph, TOP, { tests: false }),
    [graph],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section aria-labelledby="start-here" className="min-w-0">
        <h2 id="start-here" className="font-mono text-sm font-semibold">
          Start here
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Ranked by how much of the codebase depends on each file. Select one to
          see its connections.
        </p>
        <div className="mt-3 max-h-[36rem] overflow-y-auto pr-1 lg:max-h-[calc(100vh-20rem)]">
          <StartHereList
            files={files}
            selectedId={selectedId}
            onSelect={select}
          />
        </div>
      </section>

      <section
        aria-label="Dependency graph of these files"
        className="h-[32rem] min-w-0 overflow-hidden rounded-xl border border-line bg-canvas lg:h-[calc(100vh-16rem)]"
      >
        <GraphExplorer
          files={files}
          edges={edges}
          selectedId={selectedId}
          onSelect={select}
          variant="compact"
        />
      </section>
    </div>
  )
}
