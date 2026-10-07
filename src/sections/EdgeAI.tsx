import { useInView } from 'motion/react'
import { Fragment, useRef } from 'react'
import { Section } from '../components/Section'
import { Em, Label, TechDetail, Title } from '../components/ui'
import { edgeAI as d } from '../data/projects'
import { pad } from '../lib/util'

export function EdgeAI() {
  return (
    <Section id="edge-ai">
      <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
        <Title text={d.question} className="lg:col-span-7" />
        <div className="lg:col-span-5">
          <Label>Problem</Label>
          <p className="mt-2 text-lead text-ink-soft">{d.problem}</p>
        </div>
      </div>

      <div className="mt-[clamp(1.5rem,5vh,3.5rem)] grid gap-x-16 gap-y-10 border-t border-line pt-[clamp(1.25rem,4vh,2.5rem)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label>What I did</Label>
          <ol className="mt-4 space-y-[clamp(0.75rem,2vh,1.25rem)]">
            {d.did.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr]">
                <span className="pt-[0.2em] font-mono text-note text-blue-deep">{pad(i + 1)}</span>
                <div>
                  <p className="text-body font-semibold text-ink">{s.title}</p>
                  <p className="text-body text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <TechDetail items={d.tech} className="mt-5 ml-10" />
        </div>

        <div className="lg:col-span-7">
          <Label>{d.result.caption}</Label>
          <SpeedBars />
          <p className="mt-5 flex items-start gap-3 text-body text-ink-soft">
            <span aria-hidden className="mt-[0.55em] size-2 shrink-0 rounded-full bg-warn" />
            {d.result.caveat}
          </p>
        </div>
      </div>

      <blockquote className="mt-[clamp(1.5rem,5vh,3.5rem)] grid gap-x-16 gap-y-3 border-l-2 border-sky pl-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Label>What I learned</Label>
          <p className="mt-2 text-heading font-semibold tracking-[-0.02em] text-ink">
            <Em text={d.lesson} />
          </p>
        </div>
        <p className="self-end text-note text-muted lg:col-span-4">
          <span className="mr-1 font-mono text-blue-deep">↳ Robotics</span> {d.robotics}
        </p>
      </blockquote>
    </Section>
  )
}

/** Baseline 대비 normalized 속도 막대 (raw 수치 비공개) */
function SpeedBars() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const max = Math.max(...d.result.bars.map((b) => b.value))
  return (
    <div
      ref={ref}
      className="mt-[clamp(0.5rem,2vh,1.25rem)] grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-[clamp(0.25rem,1.5vh,1rem)]"
    >
      {d.result.bars.map((b, i) => {
        const best = b.value === max
        return (
          <Fragment key={b.label}>
            <span className="font-mono text-note text-muted">{b.label}</span>
            <span className="h-2.5 rounded-full bg-line/70">
              <span
                className={`block h-full rounded-full transition-[width] duration-[1100ms] ease-out ${best ? 'bg-blue' : 'bg-faint'}`}
                style={{ width: inView ? `${(b.value / max) * 100}%` : '0%', transitionDelay: `${i * 150}ms` }}
              />
            </span>
            <span
              className={`text-right text-title leading-[1.1] font-light tracking-[-0.03em] tabular-nums ${best ? 'text-blue' : 'text-faint'}`}
            >
              {b.text}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}
