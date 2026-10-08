import { MotionConfig } from 'motion/react'
import { Marquee } from './components/Marquee'
import { SiteHeader } from './components/SiteHeader'
import { useChapters } from './hooks/useChapters'
import { About } from './sections/About'
import { Closing } from './sections/Closing'
import { EdgeAI } from './sections/EdgeAI'
import { Intro } from './sections/Intro'
import { Journey } from './sections/Journey'
import { Neus } from './sections/Neus'
import { Segmentation } from './sections/Segmentation'
import { SmartGlass } from './sections/SmartGlass'
import { WhatsNext } from './sections/WhatsNext'

// 챕터 순서는 data/sections.ts와 같아야 한다.
export default function App() {
  const active = useChapters()
  return (
    <MotionConfig reducedMotion="user">
      <SiteHeader active={active} />
      <main>
        <Intro />
        <Marquee />
        <About />
        <Journey />
        <EdgeAI />
        <Segmentation />
        <SmartGlass />
        <Neus />
        <WhatsNext />
        <Closing />
      </main>
    </MotionConfig>
  )
}
