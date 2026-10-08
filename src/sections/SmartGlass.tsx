import { Armchair, ArrowRight, BellRing, Bus, ChevronRight, CreditCard, DoorOpen } from 'lucide-react'
import {
  AnimatePresence,
  animate,
  easeInOut,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Chapter } from '../components/Chapter'
import { Arrive, Beam } from '../components/fx/Beam'
import { Tilt } from '../components/fx/Tilt'
import { useCycle, useFlow, useLive, useLoop } from '../components/fx/loop'
import { Reveal } from '../components/motion'
import { Em, Label, TechDetail, Title } from '../components/ui'
import { Viewfinder } from '../components/Viewfinder'
import { redesign as r, smartGlass as d, type PipelineNode, type Tone } from '../data/projects'
import { asset, ease } from '../lib/util'

const icons = { bus: Bus, door: DoorOpen, card: CreditCard, seat: Armchair, bell: BellRing }

// 사용 흐름 선 위를 달리는 점: 아이콘마다 stop초 머물고 move초에 다음 아이콘으로, 끝에서 rest초 쉰다
const ride = { lead: 0.15, stop: 0.5, move: 0.55, rest: 0.6 }
const rideAt = (i: number) => ride.lead + i * (ride.stop + ride.move)
const rideSeconds = rideAt(d.usage.length - 1) + ride.stop + ride.rest

export function SmartGlass() {
  return (
    <Chapter id="smart-glass" tone="sky">
      <Overview />
      <Story />
    </Chapter>
  )
}

/* ───────────────────────── 개요: 목표 · 사용 흐름 · 시스템 · 역할 · 사진 ───────────────────────── */

function Overview() {
  return (
    <>
      <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <Title text={d.title} />
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <p className="text-lead text-ink-soft">{d.goal}</p>
        </Reveal>
      </div>

      {/* 시스템 개요: ①–③은 팀원 담당(예약 · 통신), ④가 내 담당(스마트글래스) */}
      <Reveal className="mt-[clamp(2rem,6vh,3.5rem)]">
        <figure className="mx-auto max-w-[min(100%,calc(78vh*1464/807))] overflow-hidden rounded-[8px] border border-line bg-surface">
          <img
            src={asset(d.overview.src)}
            alt={d.overview.alt}
            className="block aspect-[1464/807] w-full object-cover"
          />
          <figcaption className="grid gap-x-6 gap-y-2 border-t border-line px-5 py-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {d.overview.parts.map((part) => (
              <span
                key={part.no}
                className={`flex items-center gap-2 text-note ${part.mine ? 'font-semibold text-blue-deep' : 'text-muted'}`}
              >
                <span className="font-mono">{part.no}</span>
                {part.label}
                {part.mine && (
                  <span className="rounded-full bg-blue px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-white uppercase">
                    My Role
                  </span>
                )}
              </span>
            ))}
          </figcaption>
        </figure>
      </Reveal>

      {/* 참고했던 기존 보조 기술의 한계 → 그래서 하나의 안내 흐름으로 */}
      <div className="mt-[clamp(3rem,8vh,4.5rem)] grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-start">
        <Reveal className="lg:col-span-4">
          <Label>{d.referencesLabel}</Label>
          <p className="mt-3 text-lead leading-snug font-semibold tracking-[-0.01em] text-ink">
            <Em text={d.gap} />
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {d.references.map((r, i) => (
            <Reveal key={r.name} delay={0.1 + i * 0.12} className="h-full">
              <div className="h-full rounded-[6px] border border-line bg-surface p-5">
                <p className="text-body font-semibold text-ink">{r.name}</p>
                <p className="mt-2 text-body text-muted">
                  <span className="mr-2 font-medium text-warn">한계</span>
                  {r.limit}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-[clamp(3rem,8vh,4.5rem)] grid gap-x-16 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <Label>{d.usageLabel}</Label>
            <UsageFlow />
          </Reveal>

          <Reveal className="mt-[clamp(2.5rem,7vh,4rem)]">
            <Label>{d.systemLabel}</Label>
            <SystemFlow />
            <div className="mt-3 border-t-2 border-blue pt-3">
              <p className="text-body text-ink">
                <span className="mr-3 font-mono text-note tracking-[0.1em] text-blue-deep uppercase">My Role</span>
                <span className="font-semibold">{d.role}</span>
              </p>
              <p className="mt-1 text-note text-muted">{d.roleItems.join(' · ')}</p>
              <p className="mt-1 text-note text-faint">※ {d.roleNote}</p>
              <TechDetail items={d.tech} className="mt-3" />
            </div>
          </Reveal>
        </div>

        {/* 같은 크기로 나란히: 하드웨어 클로즈업 · 착용 사진 */}
        <div className="grid grid-cols-2 gap-3 self-start lg:col-span-5">
          <Photo {...d.photos.hardware} fit="object-center" delay={0.15} />
          <Photo {...d.photos.worn} fit="object-top" delay={0} />
        </div>
      </div>
    </>
  )
}

/** 입력 → 인식 → 판단 → 피드백: 보이는 동안 빛이 화살표를 따라 단계마다 차례로 지나간다 */
function SystemFlow() {
  const ref = useRef<HTMLOListElement>(null)
  const n = d.system.length
  const t = useFlow(ref, n)
  return (
    <ol ref={ref} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-stretch">
      {d.system.map((s, i) => (
        <li key={s.label} className="contents">
          {i > 0 && (
            <span aria-hidden className="relative hidden place-items-center text-faint sm:grid">
              <ArrowRight className="size-4" />
              <Beam t={t} i={i - 1} n={n} className="inset-y-0 -inset-x-2" />
            </span>
          )}
          <span className="relative rounded-[4px] border border-line bg-surface px-3.5 py-3">
            <Arrive t={t} i={i} n={n} />
            <span className="block text-note font-medium text-muted">{s.stage}</span>
            <span className="mt-0.5 block text-body leading-snug font-semibold text-ink">{s.label}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/** 화면에 들어오면 아래에서 위로 걷히며 나타나는 사진. 마우스를 올리면 살짝 기운다 */
function Photo({
  src,
  alt,
  caption,
  fit,
  delay,
}: {
  src: string
  alt: string
  caption: string
  fit: string
  delay: number
}) {
  const reduce = useReducedMotion()
  // 완전히 clip된 요소는 IntersectionObserver가 '안 보임'으로 판정하므로, 관찰은 figure가 하고 사진은 variant로 따라간다
  return (
    <motion.figure initial={reduce ? false : 'hidden'} whileInView="shown" viewport={{ once: true, amount: 0.3 }}>
      <Tilt>
        <motion.div
          className="overflow-hidden rounded-[4px] bg-line"
          variants={{ hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, shown: { clipPath: 'inset(0% 0% 0% 0%)' } }}
          transition={{ duration: 1.1, ease, delay }}
        >
          <img src={asset(src)} alt={alt} className={`block aspect-[4/5] w-full object-cover ${fit}`} />
        </motion.div>
      </Tilt>
      <figcaption className="mt-2 text-note text-muted">{caption}</figcaption>
    </motion.figure>
  )
}

/**
 * 버스 확인 → … → 하차벨: 화면에 들어오면 순서대로 불이 켜지고,
 * 그다음부터는 보이는 동안 점이 선을 따라 달리며 아이콘마다 잠깐 멈춘다(멈춘 아이콘이 밝아진다)
 */
function UsageFlow() {
  const ref = useRef<HTMLOListElement>(null)
  const on = useInView(ref, { once: true, amount: 0.7 })
  const step = 0.22 // 초
  const [ready, setReady] = useState(false) // 순서대로 다 켜진 뒤에 점이 출발
  useEffect(() => {
    if (!on) return
    const id = setTimeout(() => setReady(true), (step * (d.usage.length - 1) + 0.6) * 1000)
    return () => clearTimeout(id)
  }, [on])
  const live = useLive(ref, 0.5)
  const t = useLoop(live && ready, rideSeconds)
  return (
    <ol ref={ref} className="relative mt-4 grid grid-cols-5 gap-2">
      <span
        aria-hidden
        className="absolute top-[1.375rem] right-[10%] left-[10%] border-t border-dashed border-line-strong"
      />
      <span
        aria-hidden
        className="absolute top-[calc(1.375rem-0.5px)] right-[10%] left-[10%] h-0.5 origin-left bg-blue transition-transform ease-linear"
        style={{ transform: `scaleX(${on ? 1 : 0})`, transitionDuration: `${step * (d.usage.length - 1)}s` }}
      />
      <RideDot t={t} />
      {d.usage.map((u, i) => {
        const Icon = icons[u.icon]
        return (
          <li key={u.label} className="relative flex flex-col items-center text-center">
            <span
              className={`relative grid size-11 place-items-center rounded-full border bg-surface transition-colors duration-300 ${
                on ? 'border-blue text-blue' : 'border-line-strong text-faint'
              }`}
              style={{ transitionDelay: `${i * step}s` }}
            >
              <StopGlow t={t} i={i} />
              <Icon aria-hidden className="relative size-5" strokeWidth={1.6} />
            </span>
            <span className="mt-2.5 text-body font-semibold text-ink">{u.label}</span>
            <span className="font-mono text-note text-muted">{u.en}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** 선 위를 달리는 점. 아이콘 뒤로 지나가므로 정류장에 멈춘 동안은 아이콘이 대신 밝아진다 */
function RideDot({ t }: { t: MotionValue<number> }) {
  const n = d.usage.length
  // [도착0, 출발0, 도착1, …, 도착(n-1)] → [0%, 0%, 25%, …, 100%]
  const times = d.usage.flatMap((_, i) => [rideAt(i), rideAt(i) + ride.stop]).slice(0, -1)
  const spots = d.usage.flatMap((_, i) => [i, i]).slice(0, -1)
  const x = useCycle(
    t,
    times.map((s) => s / rideSeconds),
    spots.map((i) => `${(i / (n - 1)) * 100}%`),
    { ease: easeInOut },
  )
  return (
    <motion.span aria-hidden style={{ x }} className="absolute top-[1.375rem] right-[10%] left-[10%] h-0">
      <span className="absolute top-0 left-0 size-3 -translate-1/2 rounded-full border-2 border-surface bg-blue shadow-[0_0_0_3px_rgba(142,201,232,0.55)]" />
    </motion.span>
  )
}

/** 점이 i번째 아이콘에 머무는 동안 아이콘 안쪽이 하늘색으로 은은하게 밝아진다 */
function StopGlow({ t, i }: { t: MotionValue<number>; i: number }) {
  const a = rideAt(i)
  const opacity = useCycle(
    t,
    [a - 0.12, a, a + ride.stop, a + ride.stop + 0.35].map((s) => s / rideSeconds),
    [0, 1, 1, 0],
  )
  return (
    <motion.span aria-hidden style={{ opacity }} className="absolute inset-0 rounded-full bg-sky-pale ring-4 ring-sky/35" />
  )
}

/* ───────────────────────── 재설계 스토리: 글은 스크롤되고, 패널은 붙어서 상태만 바뀐다 ───────────────────────── */

function Story() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const update = () => {
      let a = 0
      stepRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) a = i
      })
      setActive(a)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const pick = (state: number) =>
    stepRefs.current[r.story.findIndex((s) => s.state === state)]?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    })

  return (
    <div className="mt-[clamp(5rem,15vh,10rem)]">
      <Reveal className="max-w-[46rem]">
        <Label tone="blue">{r.kicker}</Label>
        <h3 className="mt-2 text-title font-bold tracking-[-0.035em] text-ink">
          <Em text={r.heading} />
        </h3>
      </Reveal>

      <div className="mt-[clamp(1rem,4vh,2.5rem)] grid gap-x-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {r.story.map((s, i) => (
            <div
              key={s.label}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              className={`flex flex-col justify-center py-10 transition-opacity duration-500 lg:min-h-[80vh] ${
                active === i ? '' : 'lg:opacity-30'
              }`}
            >
              <StepText step={s} />
              <div className="mt-8 lg:hidden">
                <Panel state={s.state} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:col-span-7 lg:block">
          <div className="sticky top-[max(3rem,calc(50vh-14rem))]">
            <Panel state={r.story[active].state} onPick={pick} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepText({ step }: { step: (typeof r.story)[number] }) {
  return (
    <div>
      <Label tone={step.tone}>{step.label}</Label>
      <h4 className="mt-2 text-heading leading-snug font-semibold tracking-[-0.02em] text-ink">
        <Em text={step.title} />
      </h4>
      <p className="mt-3 text-lead text-ink-soft">{step.text}</p>
      {step.list && (
        <>
          <p className="mt-6 text-note font-medium text-muted">{step.listLabel}</p>
          <ul className="mt-2 space-y-1.5">
            {step.list.map((n) => (
              <li key={n} className="flex items-start gap-3 text-body text-ink">
                <span
                  aria-hidden
                  className={`mt-[0.62em] size-1.5 shrink-0 rounded-full ${step.tone === 'warn' ? 'bg-warn' : 'bg-blue'}`}
                />
                {n}
              </li>
            ))}
          </ul>
        </>
      )}
      {step.quote && (
        <blockquote className="mt-6 border-l-2 border-sky pl-5">
          <p className="text-note font-medium text-muted">What I learned</p>
          <p className="mt-1.5 text-lead font-semibold tracking-[-0.01em] text-ink">
            <Em text={step.quote} />
          </p>
        </blockquote>
      )}
    </div>
  )
}

/** 파이프라인 + FPS. onPick이 있으면(데스크톱 고정 패널) 토글로 해당 단계까지 스크롤 */
function Panel({ state, onPick }: { state: number; onPick?: (state: number) => void }) {
  const s = r.states[state]
  const ref = useRef<HTMLDivElement>(null)
  const live = useLive(ref) // 점선 흐름 · 프레임 메트로놈은 보일 때만
  return (
    <div
      ref={ref}
      className="rounded-[8px] border border-line bg-surface p-[clamp(1.25rem,3.5vh,2.25rem)] shadow-[0_1px_2px_rgba(23,35,49,0.04),0_16px_40px_-20px_rgba(23,35,49,0.18)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onPick ? (
          <div
            role="group"
            aria-label="설계 단계"
            className="inline-flex rounded-full border border-line-strong bg-canvas p-1"
          >
            {r.states.map((st, i) => (
              <button
                key={st.tab}
                type="button"
                aria-pressed={state === i}
                onClick={() => onPick(i)}
                className={`rounded-full px-3.5 py-1.5 text-note font-medium transition-colors ${
                  state === i ? (i ? 'bg-blue text-white' : 'bg-ink text-white') : 'text-muted hover:text-ink'
                }`}
              >
                {st.tab} <span className="ml-1 font-mono opacity-80">{st.fps} FPS</span>
              </button>
            ))}
          </div>
        ) : (
          <p className={`text-note font-medium ${state ? 'text-blue-deep' : 'text-warn'}`}>{s.tab}</p>
        )}
        <span className="font-mono text-note text-faint">vision pipeline</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Pipeline state={s} live={live} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 grid items-end gap-x-6 gap-y-4 border-t border-line pt-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)]">
        <div className="grid items-end gap-x-6 gap-y-3 sm:grid-cols-[auto_1fr]">
          <FpsNumber state={state} />
          <div>
            <FrameStrip key={state} state={state} live={live} />
            <p className="mt-2 text-note text-muted">{r.stripLabel}</p>
          </div>
        </div>
        <Viewfinder state={state} fps={s.lit} />
      </div>
    </div>
  )
}

type State = (typeof r.states)[number]

const box: Record<Tone, string> = {
  muted: 'border-line bg-surface',
  blue: 'border-blue/50 bg-sky-wash',
  warn: 'border-warn/50 bg-warn-pale',
}

function Pipeline({ state, live }: { state: State; live: boolean }) {
  const { group, selector } = state
  const warn = group.tone === 'warn'
  // 병목(초기 설계)이면 점선이 느리게, 재설계면 빠르게 흐른다
  const arrow = <Arrow live={live} seconds={warn ? 1.2 : 0.4} />
  return (
    <div
      className={`mt-6 grid items-center gap-2 ${
        selector
          ? 'sm:grid-cols-[minmax(0,0.85fr)_auto_minmax(0,1fr)_auto_minmax(0,1.45fr)_auto_minmax(0,1fr)]'
          : 'sm:grid-cols-[minmax(0,0.85fr)_auto_minmax(0,1.6fr)_auto_minmax(0,1fr)]'
      }`}
    >
      <Stack nodes={state.input} />
      {arrow}
      {selector && (
        <>
          <Node node={selector} />
          {arrow}
        </>
      )}
      <div className={`rounded-[4px] border border-dashed p-2 ${warn ? 'border-warn/60' : 'border-blue/60'}`}>
        <p className={`px-1 pb-1.5 text-note font-medium ${warn ? 'text-warn' : 'text-blue-deep'}`}>{group.label}</p>
        <Stack nodes={state.modules} />
        <p className={`px-1 pt-1.5 text-note ${warn ? 'text-warn' : 'text-muted'}`}>
          {warn ? '⚠ ' : ''}
          {group.note}
        </p>
      </div>
      {arrow}
      <Stack nodes={state.output} />
    </div>
  )
}

function Stack({ nodes }: { nodes: PipelineNode[] }) {
  return (
    <div className="grid gap-1.5">
      {nodes.map((n) => (
        <Node key={n.name} node={n} />
      ))}
    </div>
  )
}

function Node({ node }: { node: PipelineNode }) {
  return (
    <div className={`rounded-[3px] border px-3 py-2 ${box[node.tone ?? 'muted']}`}>
      <p className="text-body leading-snug font-semibold text-ink">{node.name}</p>
      {node.note && (
        <p
          className={`mt-0.5 text-note leading-snug ${node.tone === 'warn' ? 'text-warn' : node.tone === 'blue' ? 'text-blue-deep' : 'text-muted'}`}
        >
          {node.note}
        </p>
      )}
    </div>
  )
}

/** 흐름 방향으로 점선이 흘러가는 화살표 (모바일은 아래 방향). seconds = 점선 한 칸(6px)이 흐르는 시간 */
function Arrow({ live, seconds }: { live: boolean; seconds: number }) {
  return (
    <span aria-hidden className="relative mx-auto block size-4 rotate-90 text-faint sm:rotate-0">
      <motion.span
        className="absolute top-1/2 -left-1 right-1.5 h-[1.5px] -translate-y-1/2"
        style={{ backgroundImage: 'linear-gradient(90deg, currentColor 50%, transparent 0)', backgroundSize: '6px 100%' }}
        animate={{ backgroundPositionX: live ? ['0px', '6px'] : '0px' }}
        transition={live ? { duration: seconds, ease: 'linear', repeat: Infinity } : { duration: 0 }}
      />
      <ChevronRight className="absolute top-0 -right-1 size-4" />
    </span>
  )
}

/** 상태가 바뀌면 3 ↔ 15로 세고, 끝나면 '2–3' / '15+' 표기로 */
function FpsNumber({ state }: { state: number }) {
  const reduce = useReducedMotion()
  const [counting, setCounting] = useState<number | null>(null)
  const prev = useRef(state)

  useEffect(() => {
    if (prev.current === state) return
    prev.current = state
    if (reduce) return
    const [from, to] = state ? [3, 15] : [15, 3]
    const controls = animate(from, to, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setCounting(Math.round(v)),
      onComplete: () => setCounting(null),
    })
    return () => {
      controls.stop()
      setCounting(null)
    }
  }, [state, reduce])

  return (
    <div>
      <p className="font-mono text-note tracking-[0.1em] text-muted uppercase">{r.fpsLabel}</p>
      <p
        data-fps
        className={`min-w-[3.2ch] text-[length:clamp(3rem,6.5*var(--u)_+_1rem,6.5rem)] leading-none font-light tracking-[-0.04em] tabular-nums transition-colors duration-500 ${
          state ? 'text-blue' : 'text-warn'
        }`}
      >
        {counting ?? r.states[state].fps}
      </p>
    </div>
  )
}

/**
 * 1초 동안 처리하는 프레임 메트로놈: 실제 속도(2.5 / 15 FPS)로 칸이 하나씩 켜지고 1초가 지나면 비운다.
 * 가장 최근 프레임이 가장 진하다. 모션 감소 · 화면 밖이면 정적인 그림(StaticStrip)
 */
function FrameStrip({ state, live }: { state: number; live: boolean }) {
  const slots = r.states[1].lit // 15칸 = 1초 (1칸 = 1/15초)
  const every = slots / r.states[state].lit // 몇 칸마다 한 프레임: 6 (2.5 FPS) · 1 (15 FPS)
  const t = useLoop(live, 1)
  const [tick, setTick] = useState(0)
  useMotionValueEvent(t, 'change', (v) => setTick(Math.floor(v * slots)))
  if (!live) return <StaticStrip state={state} />
  const first = Math.ceil((tick - (tick % slots)) / every) * every // 이번 1초의 첫 프레임
  const count = tick < first ? 0 : Math.floor((tick - first) / every) + 1
  return (
    <div aria-hidden className="flex gap-1">
      {Array.from({ length: slots }, (_, i) => (
        <span key={i} className="relative h-7 flex-1 rounded-[2px] bg-line">
          <span
            className={`absolute inset-0 rounded-[2px] ${state ? 'bg-blue' : 'bg-warn'} ${
              i < count ? '' : 'transition-opacity duration-200'
            }`}
            style={{ opacity: i < count ? (i === count - 1 ? 1 : 0.7) : 0 }}
          />
        </span>
      ))}
    </div>
  )
}

function StaticStrip({ state }: { state: number }) {
  const lit = r.states[state].lit
  const slots = r.states[1].lit
  return (
    <div aria-hidden className="flex gap-1">
      {Array.from({ length: slots }, (_, i) => {
        const fill = Math.min(1, Math.max(0, lit - i))
        return (
          <span
            key={i}
            className={`h-7 flex-1 rounded-[2px] transition-colors duration-300 ${
              fill === 1 ? (state ? 'bg-blue' : 'bg-warn') : fill > 0 ? 'bg-warn/40' : 'bg-line'
            }`}
            style={{ transitionDelay: `${state ? i * 35 : 0}ms` }}
          />
        )
      })}
    </div>
  )
}
