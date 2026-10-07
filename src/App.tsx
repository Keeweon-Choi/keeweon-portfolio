import { MotionConfig } from 'motion/react'
import { DeckNav } from './components/DeckNav'
import { useDeck } from './hooks/useDeck'
import { EdgeAI } from './sections/EdgeAI'
import { Hero } from './sections/Hero'
import { Journey } from './sections/Journey'
import { Neus } from './sections/Neus'
import { Redesign } from './sections/Redesign'
import { Segmentation } from './sections/Segmentation'
import { SmartGlass } from './sections/SmartGlass'
import { Thanks } from './sections/Thanks'
import { WhatsNext } from './sections/WhatsNext'

// 섹션 순서는 data/sections.ts와 같아야 한다.
export default function App() {
  const deck = useDeck()
  return (
    <MotionConfig reducedMotion="user">
      <main>
        <Hero />
        <Journey step={deck.steps.journey ?? 0} onStep={(s) => deck.setStep('journey', s)} onJump={deck.goToId} />
        <EdgeAI />
        <Segmentation />
        <SmartGlass />
        <Redesign step={deck.steps.redesign ?? 0} onStep={(s) => deck.setStep('redesign', s)} />
        <Neus />
        <WhatsNext />
        <Thanks />
      </main>
      <DeckNav active={deck.active} onPrev={deck.prev} onNext={deck.next} onJump={deck.goTo} />
    </MotionConfig>
  )
}
