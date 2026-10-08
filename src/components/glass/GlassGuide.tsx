import {
  Armchair,
  ArrowRight,
  BellRing,
  Bus,
  CreditCard,
  Crosshair,
  DoorOpen,
  Vibrate,
  Volume2,
} from 'lucide-react'
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { guide as g, smartGlass as d } from '../../data/projects'
import { asset } from '../../lib/util'
import { useLive, useLoop } from '../fx/loop'
import { Reveal } from '../motion'
import { Em, Label } from '../ui'
import type { GuideScene, Pin, Pose } from './scene'
import { Bell, Door, Reader, Seats, Street } from './views'

const icons = { bus: Bus, door: DoorOpen, card: CreditCard, seat: Armchair, bell: BellRing }
const legendIcons = [Vibrate, Crosshair, Volume2]
const n = d.usage.length
const scenes = [Street, Door, Reader, Seats, Bell] // usage와 같은 순서

/*
 * 한 단계(T초): 탐색 → 박스 등장(중심에서 벗어난 쪽만 진동) → 머리를 돌려 박스가 중심으로
 * → 가까울수록 양쪽 진동이 강하게 → 맞춰지면 거리 음성 → 정리하며 머리가 정면으로.
 * 아래 위치 · 세기 값은 화면 표현용 예시다 (실제 시스템의 기준값이 아니다).
 */
const T = 4.6
const LOOP = T * n
const at = { appear: 0.4, turn: 1.3, aligned: 2.7, voice: 3.0, end: 4.1 }
const OFF = 0.7 // 처음 박스 위치 (중심 0 → 가장자리 1)
const NEAR = 0.4 // 이보다 중심에 가까우면 양쪽 진동
const BASE = 0.45 // 한쪽만 울릴 때 세기
const TURN = 0.5 // 머리를 돌리는 각도 (rad)
const STILL = 0.9 // 모션 감소: 1단계에서 박스가 왼쪽에 있어 왼쪽 모터만 울리는 순간

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/** time초의 안내 상태. phase: 0 탐색 · 1 한쪽 진동 · 2 양쪽 진동 · 3 거리 음성 */
function guideAt(time: number) {
  const stage = Math.floor(time / T) % n
  const s = time % T
  const side = g.targets[stage].side === 'L' ? -1 : 1
  const turn = smooth((s - at.turn) / (at.aligned - at.turn))
  const offset = side * OFF * (1 - turn)
  const seen = s >= at.appear && s < at.end
  const dist = Math.abs(offset)
  const both = seen && dist <= NEAR ? BASE + (1 - BASE) * (1 - dist / NEAR) : 0
  const one = seen ? Math.max(BASE, both) : 0
  const voice = s >= at.voice && s < at.end
  return {
    stage,
    offset,
    L: side < 0 ? one : both,
    R: side > 0 ? one : both,
    voice,
    phase: !seen ? 0 : voice ? 3 : dist <= NEAR ? 2 : 1,
    yaw: -side * TURN * turn * (1 - smooth((s - at.end) / (T - at.end))),
  }
}

const poseAt = (time: number, still: boolean): Pose => {
  const s = guideAt(time)
  const t = time % T
  const side = g.targets[s.stage].side === 'L' ? -1 : 1
  // 단계가 바뀔 때 앞 장면이 잠깐 옅어졌다가 다음 장면으로
  const world = Math.min(smooth(t / 0.35), 1 - smooth((t - at.end) / (T - at.end)))
  return { time, yaw: s.yaw, L: s.L, R: s.R, sensor: s.voice ? 1 : 0, still, stage: s.stage, aim: -side * TURN, world }
}

// 3D 앞 장면: 카메라 화면과 같은 그림을 흐리게. 머리를 TURN만큼 돌리면 목표가 OFF·0.38 화면폭(800단위 기준)만큼 움직이므로
const panos = d.usage.map((_, i) => asset(`images/guide-pano-${i}.jpg`))
const rpu = TURN / (OFF * 0.38 * 800)

const pinIds: Pin[] = ['camera', 'sensor', 'L', 'R']
// 점 기준 라벨 위치: 왼쪽 모터는 왼쪽으로, 카메라는 아래로 → 모형 가운데를 가리지 않는다.
// 폰에서는 옆으로 내면 무대 밖으로 잘리므로 점 위 · 아래 가운데에 둔다
const below = 'top-3 left-0 -translate-x-1/2'
const pinPlace: Record<Pin, string> = {
  camera: below,
  sensor: 'bottom-3 left-0 -translate-x-1/2 sm:bottom-auto sm:left-3 sm:top-0 sm:translate-x-0 sm:-translate-y-1/2',
  L: `${below} sm:top-0 sm:right-3 sm:left-auto sm:translate-x-0 sm:-translate-y-1/2`,
  R: `${below} sm:top-0 sm:left-3 sm:translate-x-0 sm:-translate-y-1/2`,
}

/**
 * 안경이 실제로 안내하는 방식: 3D 모형(뒤에서 본 모습) + 카메라 화면 + 설명.
 * 시계는 여기 하나 — 카메라 화면 · 오른쪽 설명 · 3D가 같은 시각을 그린다. three는 화면 근처에 오면 불러온다.
 */
export function GlassGuide() {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pinRefs = useRef<Partial<Record<Pin, HTMLElement | null>>>({})
  const sceneRef = useRef<GuideScene | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState<string | null>(null) // 사진으로 대신한 이유

  const reduce = !!useReducedMotion()
  const live = useLive(stageRef)
  const near = useInView(stageRef, { once: true, margin: '400px 0px' })
  // 3D 준비(셰이더 컴파일 등)는 한 번 메인 스레드를 수백 ms 붙잡는다 → 스크롤 도중이 아니라
  // 페이지를 연 직후 한가한 때(보통 표지에 있을 때) 미리 해 둔다. 가까워지면 바로.
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setIdle(true), { timeout: 2500 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(() => setIdle(true), 1200)
    return () => clearTimeout(id)
  }, [])
  const start = near || idle
  // 3D가 준비된 뒤(또는 사진으로 대신한 뒤)에 시계를 시작 → 첫 단계를 건너뛰지 않는다
  const loop = useLoop(live && (ready || !!failed), LOOP)
  const time = useTransform(loop, (v) => (reduce ? STILL : (v % 1) * LOOP))

  // 단계 · 페이즈가 바뀔 때만 리렌더 (박스 위치 · 진동 세기 · 3D는 매 프레임 직접 그린다)
  const [step, setStep] = useState(() => {
    const s = guideAt(time.get())
    return s.stage * 4 + s.phase
  })
  const stepRef = useRef(step)
  useMotionValueEvent(time, 'change', (t) => {
    sceneRef.current?.update(poseAt(t, reduce))
    const s = guideAt(t)
    const k = s.stage * 4 + s.phase
    if (k !== stepRef.current) {
      stepRef.current = k
      setStep(k)
    }
  })

  useEffect(() => {
    if (!start) return
    let dead = false
    let scene: GuideScene | undefined
    import('./scene')
      .then(({ mount }) => {
        const canvas = canvasRef.current
        return dead || !canvas ? undefined : mount(canvas, pinRefs.current as Record<Pin, HTMLElement>, { panos, rpu })
      })
      .then((s) => {
        if (!s) return
        if (dead) return s.dispose() // 불러오는 사이에 사라졌다
        scene = s
        s.update(poseAt(time.get(), reduce))
        sceneRef.current = s
        setReady(true)
      })
      .catch((e: unknown) => {
        // WebGL을 못 쓰거나 청크를 못 불러오면 실제 사진으로 대신한다
        if (!dead) setFailed(e instanceof Error ? `${e.name}: ${e.message}` : String(e))
      })
    return () => {
      dead = true
      scene?.dispose()
      sceneRef.current = null
    }
  }, [start, time, reduce])

  const stage = Math.floor(step / 4)
  const phase = step % 4
  const side = g.targets[stage].side
  const lit: Record<Pin, boolean> = {
    camera: false,
    sensor: phase === 3,
    L: phase >= 2 || (phase === 1 && side === 'L'),
    R: phase >= 2 || (phase === 1 && side === 'R'),
  }

  return (
    <div className="mt-[clamp(3rem,8vh,4.5rem)] grid gap-x-16 gap-y-8 lg:grid-cols-12 lg:items-center">
      <Reveal className="lg:col-span-7">
        <div ref={stageRef} className="overflow-hidden rounded-[8px] border border-line bg-surface">
          {/* 카메라 화면을 모형 위에 따로 둔다 → 어떤 화면 비율에서도 모형을 가리지 않는다 */}
          <div aria-hidden className="border-b border-line px-4 pt-3 pb-4 sm:px-6">
            <CameraView time={time} stage={stage} phase={phase} />
          </div>
          {/* 폰은 정사각: 모형 크기는 그대로(가로 맞춤)이고 라벨 · 말풍선이 들어갈 위아래 여유만 는다 */}
          <div className="relative aspect-square sm:aspect-video">
            {failed ? (
              <>
                <img
                  src={asset(d.photos.hardware.src)}
                  alt={d.photos.hardware.alt}
                  className="absolute inset-0 size-full object-cover"
                />
                <p
                  title={failed}
                  className="absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-1.5 text-[11px] leading-snug text-white"
                >
                  3D 모형을 표시할 수 없어 시제품 사진으로 대신합니다
                </p>
              </>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={g.alt}
                  className="absolute inset-0 size-full cursor-grab touch-pan-y active:cursor-grabbing"
                />
                <div className={`transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
                  {pinIds.map((id) => (
                    <div
                      key={id}
                      ref={(el) => {
                        pinRefs.current[id] = el
                      }}
                      aria-hidden
                      className="pointer-events-none absolute top-0 left-0"
                    >
                      <span
                        className={`absolute size-2.5 -translate-1/2 rounded-full ring-4 transition-colors duration-300 ${
                          lit[id] ? 'bg-blue ring-sky/60' : 'bg-ink ring-ink/10'
                        }`}
                      />
                      <span
                        className={`absolute rounded-full border px-2.5 py-1 font-mono text-note leading-none whitespace-nowrap transition-colors duration-300 ${pinPlace[id]} ${
                          lit[id] ? 'border-blue bg-blue text-white' : 'border-line bg-surface/90 text-ink-soft'
                        }`}
                      >
                        {g.pins[id]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="pointer-events-none absolute right-4 bottom-3 hidden font-mono text-note text-faint sm:block">{g.hint}</p>
              </>
            )}

            {/* 맞춰지면 거리를 음성으로 (실제 문장은 넣지 않는다) */}
            <div
              aria-hidden
              className={`pointer-events-none absolute bottom-[7%] left-1/2 -translate-x-1/2 transition duration-300 ${
                phase === 3 ? 'opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              <span className="flex items-center gap-2 rounded-full border border-blue/40 bg-surface px-3.5 py-1.5 text-note whitespace-nowrap text-ink shadow-[0_6px_20px_-10px_rgba(23,35,49,0.35)]">
                <Volume2 className="size-4 text-blue" strokeWidth={1.8} />
                {g.voice}
                <span className="text-faint">·</span>
                <span className="font-semibold">{g.targets[stage].name}</span>
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="lg:col-span-5">
        <Label>{g.label}</Label>
        <h3 className="mt-2 text-heading leading-snug font-semibold tracking-[-0.02em] text-ink">
          <Em text={g.heading} />
        </h3>
        <p className="mt-3 text-body text-ink-soft">{g.text}</p>

        {/* 지금 화면에서 일어나는 규칙이 밝아진다 */}
        <ul className="mt-6 grid gap-2">
          {g.legend.map((l, i) => {
            const Icon = legendIcons[i]
            const on = phase === i + 1
            return (
              <li
                key={l.key}
                className={`flex gap-3 rounded-[6px] border px-4 py-3 transition-colors duration-300 ${
                  on ? 'border-blue/50 bg-sky-wash' : 'border-line bg-surface'
                }`}
              >
                <Icon
                  aria-hidden
                  className={`mt-1 size-5 shrink-0 transition-colors duration-300 ${on ? 'text-blue' : 'text-faint'}`}
                  strokeWidth={1.7}
                />
                <div>
                  <p className="text-body leading-snug font-semibold text-ink">
                    {l.key}
                    <ArrowRight aria-hidden className="mx-1.5 inline size-4 align-[-0.15em] text-faint" />
                    {l.to}
                  </p>
                  <p className="mt-0.5 text-note text-muted">{l.note}</p>
                </div>
              </li>
            )
          })}
        </ul>

        <ol className="mt-4 grid grid-cols-5 gap-1.5">
          {d.usage.map((u, i) => {
            const Icon = icons[u.icon]
            const on = i === stage
            return (
              <li
                key={u.label}
                aria-current={on ? 'step' : undefined}
                className={`flex flex-col items-center gap-1 rounded-[6px] border px-1 py-2 text-center transition-colors duration-300 ${
                  on ? 'border-blue/50 bg-sky-wash text-ink' : 'border-line text-muted'
                }`}
              >
                <Icon aria-hidden className={`size-4 ${on ? 'text-blue' : 'text-faint'}`} strokeWidth={1.7} />
                <span className="text-note leading-tight font-medium">{u.label}</span>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-note text-faint">※ {g.note}</p>
      </Reveal>
    </div>
  )
}

/** 카메라 화면: 가운데 고정 표시 = 사용자 시점. 박스가 중심으로 다가오고, 양옆 막대가 좌우 진동 세기 */
function CameraView({ time, stage, phase }: { time: MotionValue<number>; stage: number; phase: number }) {
  // 머리를 돌리면 장면이 좌우로 밀린다: 목표(장면 가운데)가 화면의 50 + offset·38 % 자리에 오도록.
  // 장면 폭 = 화면의 2배 → translateX(%)는 장면 자기 폭 기준이라 /2
  const x = useTransform(time, (t) => `${((0.5 + guideAt(t).offset * 0.38 - 1) / 2) * 100}%`)
  // 거리뷰의 방위 눈금처럼: 장면과 같이 움직이는 눈금, 가운데 표시는 고정
  const tape = useTransform(time, (t) => `${guideAt(t).offset * 38}%`)
  // 진동이 울리는 쪽 화면 가장자리가 맥박처럼 빛난다 (세기 × 빠른 맥동)
  const edgeL = useTransform(time, (t) => guideAt(t).L * (0.4 + 0.3 * Math.sin(t * 26)))
  const edgeR = useTransform(time, (t) => guideAt(t).R * (0.4 + 0.3 * Math.sin(t * 26 + 1)))
  const Icon = icons[d.usage[stage].icon]
  const close = phase >= 2
  const { box: b } = g.targets[stage]
  const inside = b.y < 60 // 박스가 화면 위쪽 끝이면 라벨을 박스 안에
  return (
    <div className="mx-auto max-w-[40rem]">
      {/* 가운데 라벨은 시점 표시 바로 위에 온다 */}
      <p className="grid grid-cols-[1fr_auto_1fr] gap-2 px-6 text-note text-muted">
        <span className="font-mono">{g.view.label}</span>
        <span>{g.view.center}</span>
      </p>
      <div className="mt-1.5 flex items-stretch gap-2.5">
        <Motor time={time} side="L" />
        <div className="relative aspect-[2/1] flex-1 overflow-hidden rounded-[6px] border border-line-strong bg-[#dfe6ec]">
          <motion.div style={{ x }} className="absolute inset-y-0 left-0 w-[200%] will-change-transform">
            {/* 다섯 장면을 겹쳐 두고 단계가 바뀌면 교차 페이드 (다시 그리지 않아 깜빡이지 않는다) */}
            {scenes.map((Scene, i) => (
              <svg
                key={i}
                viewBox="0 0 1600 400"
                className={`absolute inset-0 size-full transition-opacity duration-300 ${i === stage ? 'opacity-100' : 'opacity-0'}`}
              >
                <Scene />
              </svg>
            ))}
            {/* 탐지한 목표의 박스: 장면에 붙어 함께 움직인다 */}
            <div
              style={{ left: `${b.x / 16}%`, top: `${b.y / 4}%`, width: `${b.w / 16}%`, height: `${b.h / 4}%` }}
              className={`absolute rounded-[3px] border-2 border-sky bg-sky/10 shadow-[0_0_0_1px_rgba(23,35,49,0.45)] transition-opacity duration-300 ${
                phase ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span
                className={`absolute -left-0.5 flex items-center gap-1 rounded-[3px] bg-blue px-1.5 py-0.5 text-note leading-none font-medium whitespace-nowrap text-white ${
                  inside ? 'top-1 left-1' : '-top-0.5 -translate-y-full rounded-b-none'
                }`}
              >
                <Icon className="size-3.5" strokeWidth={2} />
                {g.targets[stage].name}
              </span>
              <span className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-sky" />
            </div>
          </motion.div>
          {/* 카메라 화면 느낌: 가장자리 어둡게 */}
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,18,28,0.35))]" />
          {/* 방위 눈금 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-5 overflow-hidden bg-ink/35">
            <motion.div style={{ x: tape }} className="absolute inset-y-0 -inset-x-full">
              {Array.from({ length: 31 }, (_, i) => (
                <span
                  key={i}
                  className={`absolute bottom-0 w-px bg-white/70 ${i % 5 ? 'h-1.5' : 'h-3'}`}
                  style={{ left: `${(i / 30) * 100}%` }}
                />
              ))}
            </motion.div>
            <span className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 border-x-[5px] border-b-[6px] border-x-transparent border-b-white" />
          </div>
          <motion.span
            style={{ opacity: edgeL }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-linear-to-r from-sky/80 to-transparent"
          />
          <motion.span
            style={{ opacity: edgeR }}
            className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-linear-to-l from-sky/80 to-transparent"
          />
          {/* 맞춰지면 거리를 음성으로: 스피커 + 소리 파형 */}
          {phase === 3 && (
            <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1.5">
              <Volume2 aria-hidden className="size-4 text-white" strokeWidth={2} />
              <Wave time={time} />
            </span>
          )}
          {/* 고정된 시점: 화면 정중앙 */}
          <span className="absolute top-1/2 left-1/2 h-px w-12 -translate-1/2 bg-white/85 shadow-[0_0_0_1px_rgba(23,35,49,0.35)]" />
          <span className="absolute top-1/2 left-1/2 h-12 w-px -translate-1/2 bg-white/85 shadow-[0_0_0_1px_rgba(23,35,49,0.35)]" />
          <span
            className={`absolute top-1/2 left-1/2 size-4 -translate-1/2 rounded-full border-2 transition-colors duration-300 ${
              close ? 'border-sky ring-4 ring-sky/50' : 'border-white'
            }`}
          />
        </div>
        <Motor time={time} side="R" />
      </div>
    </div>
  )
}

/**
 * 진동 모터: 세기만큼 몸체가 떨리고, 바깥쪽으로 물결이 퍼진다(세질수록 크고 진하게).
 * 시계(time)에서 바로 계산해 3D · 카메라 화면과 어긋나지 않는다
 */
function Motor({ time, side }: { time: MotionValue<number>; side: 'L' | 'R' }) {
  const dir = side === 'L' ? -1 : 1
  const shake = useTransform(time, (t) => Math.sin(t * 95) * guideAt(t)[side] * 2.4)
  const body = useTransform(time, (t) => 0.3 + 0.7 * guideAt(t)[side])
  return (
    <div className="relative flex w-11 flex-col items-center justify-center gap-1.5">
      <div className="relative grid h-16 w-full place-items-center">
        {[0, 1, 2].map((k) => (
          <Ripple key={k} time={time} side={side} k={k} />
        ))}
        <motion.span style={{ x: shake, opacity: body }} className="relative h-10 w-3.5 rounded-full bg-blue" />
      </div>
      <span className="font-mono text-note leading-none text-muted">{side}</span>
      <span className="sr-only">{dir < 0 ? '왼쪽' : '오른쪽'} 진동 모터</span>
    </div>
  )
}

/** 모터 바깥쪽으로 퍼지는 물결 하나 (세 개가 1/3씩 어긋나 이어진다) */
function Ripple({ time, side, k }: { time: MotionValue<number>; side: 'L' | 'R'; k: number }) {
  const dir = side === 'L' ? -1 : 1
  const p = useTransform(time, (t) => (t * 2.4 + k / 3) % 1)
  const x = useTransform(p, (v) => dir * (7 + v * 13))
  const opacity = useTransform(time, (t) => (1 - ((t * 2.4 + k / 3) % 1)) * Math.min(1, guideAt(t)[side] * 1.5))
  const scale = useTransform(time, (t) => 0.7 + ((t * 2.4 + k / 3) % 1) * (0.3 + guideAt(t)[side] * 0.6))
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 10 32"
      style={{ x, opacity, scale, scaleX: dir }}
      className="absolute h-12 w-3 text-blue"
    >
      <path d="M2 2 Q10 16 2 30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </motion.svg>
  )
}

/** 음성 안내 중인 소리 파형 (막대 4개가 엇갈려 오르내린다) */
function Wave({ time }: { time: MotionValue<number> }) {
  return (
    <span aria-hidden className="flex h-4 items-center gap-[3px]">
      {[0, 1, 2, 3].map((k) => (
        <WaveBar key={k} time={time} k={k} />
      ))}
    </span>
  )
}

function WaveBar({ time, k }: { time: MotionValue<number>; k: number }) {
  const scaleY = useTransform(time, (t) => 0.35 + 0.65 * Math.abs(Math.sin(t * 9 + k * 1.3)))
  return <motion.span style={{ scaleY }} className="h-full w-[3px] rounded-full bg-white" />
}
