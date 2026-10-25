import { MessageSquareText, Route } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

const COPY = {
  tours: {
    icon: Route,
    title: 'Guided tours are coming next',
    description:
      'A step-by-step walk through this repository for your role — new contributor, bug fixer, reviewer — in the order the ranking already gives, with each step explained.',
  },
  ask: {
    icon: MessageSquareText,
    title: 'Ask about this code — coming soon',
    description:
      'Ask questions in plain language and get answers that cite the files they come from.',
  },
} as const

/** Says why the tab is empty instead of hiding it, so the roadmap is visible
 * where it will land. */
export default function ComingSoonTab({
  feature,
}: {
  feature: keyof typeof COPY
}) {
  return <EmptyState {...COPY[feature]} />
}
