import { useInView } from 'motion/react'
import { Fragment, useRef } from 'react'
import { Chapter } from '../components/Chapter'
import { CountUp, Reveal } from '../components/motion'
import { Em, Label, TechDetail, Title } from '../components/ui'
import { edgeAI as d } from '../data/projects'
import { pad } from '../lib/util'

export function EdgeAI() {
  return (
    <Chapter id="edge-ai" tone="surface">
      <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <Title text={d.question} />
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <Label>Problem</Label>
          <p className="mt-2 text-lead text-ink-soft">{d.problem}</p>
        </Reveal>
      </div>

      <div className="mt-[clamp(3rem,9vh,5rem)] grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Label>What I did</Label>
          <ol className="relative mt-5 space-y-[clamp(1rem,3vh,1.75rem)]">
            <span aria-hidden className="absolute top-4 bottom-4 left-[15px] w-px bg-line-strong" />
            {d.did.map((s, i) => (
              <Reveal
                as="li"
                key={s.title}
                delay={i * 0.12}
                y={16}
                className="relative grid grid-cols-[2rem_1fr] gap-x-4"
              >
                <span className="grid size-8 place-items-center rounded-full border border-blue bg-surface font-mono text-[12px] text-blue-deep">
                  {pad(i + 1)}
                </span>
                <div className="pt-1">
                  <p className="text-lead leading-snug font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-body text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <TechDetail items={d.tech} className="mt-6 ml-12" />
        </div>

        <Reveal delay={0.15} className="lg:col-span-7">
          <div className="rounded-[6px] border border-line bg-canvas p-[clamp(1.5rem,4vh,2.75rem)]">
            <Label>{d.result.caption}</Label>
            <SpeedBars />
            <p className="mt-6 flex items-start gap-3 border-t border-line pt-5 text-body text-ink-soft">
              <span aria-hidden className="mt-[0.55em] size-2 shrink-0 rounded-full bg-warn" />
              {d.result.caveat}
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-[clamp(3rem,9vh,5rem)]">
        <blockquote className="grid gap-x-16 gap-y-4 border-l-2 border-sky pl-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Label>What I learned</Label>
            <p className="mt-2 text-heading leading-snug font-semibold tracking-[-0.02em] text-ink">
              <Em text={d.lesson} />
            </p>
          </div>
          <p className="self-end text-body text-muted lg:col-span-4">
            <span className="mr-1 font-mono text-note text-blue-deep">↳ Robotics</span> {d.robotics}
          </p>
        </blockquote>
      </Reveal>
    </Chapter>
  )
}

/** Baseline 대비 normalized 속도 막대 (raw 수치 비공개). 화면에 들어오면 막대가 자라고 숫자가 올라간다 */
function SpeedBars() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const max = Math.max(...d.result.bars.map((b) => b.value))
  return (
    <div
      ref={ref}
      className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-[clamp(0.75rem,2.5vh,1.5rem)]"
    >
      {d.result.bars.map((b, i) => {
        const best = b.value === max
        return (
          <Fragment key={b.label}>
            <span className="font-mono text-note text-muted">{b.label}</span>
            <span className="h-3 rounded-full bg-line/70">
              <span
                className={`block h-full rounded-full transition-[width] duration-[1300ms] ease-out ${best ? 'bg-blue' : 'bg-faint'}`}
                style={{ width: inView ? `${(b.value / max) * 100}%` : '0%', transitionDelay: `${i * 180}ms` }}
              />
            </span>
            <span
              className={`min-w-[2.6em] text-right text-title leading-[1.1] font-light tracking-[-0.03em] tabular-nums ${
                best ? 'text-blue' : 'text-faint'
              }`}
            >
              {best ? <CountUp from={1} to={b.value} prefix="≈" suffix="×" /> : b.text}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}
