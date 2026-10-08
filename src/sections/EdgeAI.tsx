import { motion, useInView, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Chapter } from '../components/Chapter'
import { Detect } from '../components/fx/Detect'
import { useLive, useLoop } from '../components/fx/loop'
import { CountUp, Reveal, Words } from '../components/motion'
import { Label, TechDetail, Title } from '../components/ui'
import { edgeAI as d } from '../data/projects'
import { pad } from '../lib/util'

const LAP = 3.5 // 레이스에서 Baseline이 한 바퀴 도는 시간(초). 같은 시간에 Optimized는 ≈5바퀴

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
          <div className="beam-border rounded-[6px] border border-line bg-canvas p-[clamp(1.5rem,4vh,2.75rem)]">
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
              <Words text={d.lesson} />
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
              {best ? (
                <Detect label="speed-up" delay={1.4}>
                  <CountUp from={1} to={b.value} prefix="≈" suffix="×" />
                </Detect>
              ) : (
                b.text
              )}
            </span>
          </Fragment>
        )
      })}
      <Race start={inView} max={max} />
    </div>
  )
}

/**
 * 막대가 다 자란 뒤의 레이스: 같은 트랙을 Baseline이 1바퀴 도는 동안 Optimized는 5바퀴 (≈5×를 눈으로).
 * 보이는 동안만 돈다. 모션 감소면 정적인 그림(두 점 모두 결승선 · 1 lap / 5 laps).
 * 막대와 같은 열에 맞추려고 부모 grid의 subgrid로 들어간다.
 */
function Race({ start, max }: { start: boolean; max: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = !!useReducedMotion()
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    if (!start) return
    const id = setTimeout(() => setGrown(true), 1700) // 막대(1.3s + 지연)가 다 자란 뒤 출발
    return () => clearTimeout(id)
  }, [start])
  const live = useLive(ref, 0.5)
  const t = useLoop(live && grown, LAP)
  const [laps, setLaps] = useState(0) // 가장 빠른 레인 기준 바퀴 수
  useMotionValueEvent(t, 'change', (v) => setLaps(Math.floor(v * max)))
  return (
    <div
      ref={ref}
      aria-hidden // 막대 수치의 시각적 반복이라 스크린리더에는 숨긴다
      className="col-span-3 grid grid-cols-subgrid items-center gap-y-3 border-t border-dashed border-line pt-[clamp(0.75rem,2.5vh,1.5rem)]"
    >
      {d.result.bars.map((b) => {
        const best = b.value === max
        const n = reduce ? b.value : Math.floor((laps * b.value) / max)
        return (
          <Fragment key={b.label}>
            <span className="font-mono text-note text-muted">{b.label}</span>
            <Lane t={t} speed={b.value} best={best} still={reduce} />
            <span className={`text-right font-mono text-note tabular-nums ${best ? 'text-blue-deep' : 'text-muted'}`}>
              {n} {n === 1 ? 'lap' : 'laps'}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

/** 점선 트랙 + 결승선 + 달리는 점(빠른 쪽은 꼬리). 트랙 양끝 밖은 잘라서 꼬리가 라벨을 덮지 않는다 */
function Lane({ t, speed, best, still }: { t: MotionValue<number>; speed: number; best: boolean; still: boolean }) {
  const x = useTransform(t, (v) => (still ? '100%' : `${((v * speed) % 1) * 100}%`))
  return (
    <span className="relative h-3">
      <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-line-strong" />
      <span className="absolute inset-y-0 right-0 w-0.5 rounded-full bg-line-strong" />
      <span className="absolute -inset-x-1.5 -inset-y-1 overflow-hidden">
        <motion.span className="absolute inset-y-0 right-1.5 left-1.5" style={{ x }}>
          {best && (
            <span className="absolute top-1/2 left-0 h-0.5 w-10 -translate-x-full -translate-y-1/2 rounded-full bg-linear-to-r from-transparent to-blue/60" />
          )}
          <span
            className={`absolute top-1/2 left-0 size-2.5 -translate-1/2 rounded-full ${best ? 'bg-blue' : 'bg-faint'}`}
          />
        </motion.span>
      </span>
    </span>
  )
}
