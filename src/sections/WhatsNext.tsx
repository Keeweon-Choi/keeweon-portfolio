import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { Chapter } from '../components/Chapter'
import { Arrive, Beam } from '../components/fx/Beam'
import { SpotlightCard } from '../components/fx/SpotlightCard'
import { useFlow } from '../components/fx/loop'
import { Reveal } from '../components/motion'
import { Label, Title } from '../components/ui'
import { future as d } from '../data/profile'
import { ease, pad } from '../lib/util'

/** 화면에 들어오면 왼쪽부터 차례로 나타난다 */
const seq = (i: number) => ({
  initial: { opacity: 0, x: -12 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.6 },
  transition: { duration: 0.55, ease, delay: i * 0.18 },
})

export function WhatsNext() {
  const sofar = d.flow.filter((f) => !f.next)
  const ahead = d.flow.filter((f) => f.next)
  // Visual Perception → … → Robotics: 보이는 동안 빛이 화살표를 따라 차례로 지나간다
  const flowRef = useRef<HTMLDivElement>(null)
  const n = d.flow.length
  const t = useFlow(flowRef, n)
  return (
    <Chapter id="next">
      <Reveal>
        <Title text={d.title} />
      </Reveal>

      <div
        ref={flowRef}
        className="mt-[clamp(2.5rem,7vh,4.5rem)] grid gap-4 lg:grid-cols-[3fr_auto_1fr] lg:items-start"
      >
        <div>
          <ol className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {sofar.map((f, i) => (
              <li key={f.label} className="contents">
                {i > 0 && (
                  <motion.span {...seq(i * 2 - 1)} aria-hidden className="relative mx-auto hidden text-faint sm:block">
                    <ArrowRight className="size-4" />
                    <Beam t={t} i={i - 1} n={n} className="-inset-x-2 -inset-y-2" />
                  </motion.span>
                )}
                <motion.span
                  {...seq(i * 2)}
                  className="relative rounded-[4px] border border-line bg-surface px-4 py-3 text-body font-semibold text-ink"
                >
                  <Arrive t={t} i={i} n={n} />
                  {f.label}
                </motion.span>
              </li>
            ))}
          </ol>
          <motion.p {...seq(5)} className="mt-3 border-t border-line-strong pt-2 text-note font-medium text-muted">
            {d.sofar}
          </motion.p>
        </div>
        <motion.span {...seq(6)} aria-hidden className="relative mx-auto mt-3.5 hidden text-blue lg:block">
          <ArrowRight className="size-5" />
          <Beam t={t} i={sofar.length - 1} n={n} className="-inset-x-4 -inset-y-2" />
        </motion.span>
        <motion.div {...seq(7)}>
          {ahead.map((f) => (
            <span
              key={f.label}
              className="relative block rounded-[4px] border border-dashed border-blue bg-sky-wash px-4 py-3 text-body font-semibold text-blue-deep"
            >
              <Arrive t={t} i={n - 1} n={n} />
              {f.label}
            </span>
          ))}
          <p className="mt-3 border-t border-blue pt-2 text-note font-medium text-blue-deep">
            {d.ahead} — <span className="text-muted">{d.aheadNote}</span>
          </p>
        </motion.div>
      </div>

      <Reveal className="mt-[clamp(3rem,9vh,5rem)]">
        <Label>{d.interestsLabel}</Label>
      </Reveal>
      <ol className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-3">
        {d.interests.map((it, i) => (
          <Reveal as="li" key={it.title} delay={i * 0.12} className="h-full">
            <SpotlightCard className="border border-t-2 border-line border-t-line-strong bg-surface px-5 pt-4 pb-5 group-hover:border-t-blue">
              <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
              <p className="mt-2 text-heading leading-snug font-semibold tracking-[-0.02em] text-ink">{it.title}</p>
              <p className="mt-1.5 text-body text-muted">{it.text}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-[clamp(3rem,8vh,4.5rem)]">
        <p className="max-w-[46em] text-lead text-ink-soft">{d.statement}</p>
      </Reveal>
    </Chapter>
  )
}
