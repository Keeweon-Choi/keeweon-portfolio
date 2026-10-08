import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Chapter } from '../components/Chapter'
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
  return (
    <Chapter id="next">
      <Reveal>
        <Title text={d.title} />
      </Reveal>

      <div className="mt-[clamp(2.5rem,7vh,4.5rem)] grid gap-4 lg:grid-cols-[3fr_auto_1fr] lg:items-start">
        <div>
          <ol className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {sofar.map((f, i) => (
              <li key={f.label} className="contents">
                {i > 0 && (
                  <motion.span {...seq(i * 2 - 1)} aria-hidden className="mx-auto hidden text-faint sm:block">
                    <ArrowRight className="size-4" />
                  </motion.span>
                )}
                <motion.span
                  {...seq(i * 2)}
                  className="rounded-[4px] border border-line bg-surface px-4 py-3 text-body font-semibold text-ink"
                >
                  {f.label}
                </motion.span>
              </li>
            ))}
          </ol>
          <motion.p {...seq(5)} className="mt-3 border-t border-line-strong pt-2 text-note font-medium text-muted">
            {d.sofar}
          </motion.p>
        </div>
        <motion.span {...seq(6)} aria-hidden className="mx-auto mt-3.5 hidden text-blue lg:block">
          <ArrowRight className="size-5" />
        </motion.span>
        <motion.div {...seq(7)}>
          {ahead.map((f) => (
            <span
              key={f.label}
              className="block rounded-[4px] border border-dashed border-blue bg-sky-wash px-4 py-3 text-body font-semibold text-blue-deep"
            >
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
      <ol className="mt-4 grid gap-x-10 gap-y-6 md:grid-cols-3">
        {d.interests.map((it, i) => (
          <Reveal
            as="li"
            key={it.title}
            delay={i * 0.12}
            className="h-full border-t-2 border-line-strong pt-4 transition-colors hover:border-blue"
          >
            <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
            <p className="mt-2 text-heading leading-snug font-semibold tracking-[-0.02em] text-ink">{it.title}</p>
            <p className="mt-1.5 text-body text-muted">{it.text}</p>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-[clamp(3rem,8vh,4.5rem)]">
        <p className="max-w-[46em] text-lead text-ink-soft">{d.statement}</p>
      </Reveal>
    </Chapter>
  )
}
