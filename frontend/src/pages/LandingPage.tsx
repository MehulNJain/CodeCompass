import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Hero } from '@/features/landing/components/Hero'
import { ProblemContrast } from '@/features/landing/components/ProblemContrast'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { FeatureGrid } from '@/features/landing/components/FeatureGrid'
import { FinalCta } from '@/features/landing/components/FinalCta'

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProblemContrast />
        <HowItWorks />
        <FeatureGrid />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
