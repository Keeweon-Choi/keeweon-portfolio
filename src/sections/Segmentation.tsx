import { ChevronsLeftRight } from 'lucide-react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { Em, Label, Tag, TechDetail, Title } from '../components/ui'
import { segmentation as d } from '../data/projects'
import { asset } from '../lib/util'

export function Segmentation() {
  return (
    <Chapter id="segmentation">
      <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <Title text={d.title} />
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <p className="text-lead text-ink-soft">{d.summary}</p>
        </Reveal>
      </div>

      <div className="mt-[clamp(2.5rem,7vh,4.5rem)] grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <DriveCompare />
          <div className="mt-6 grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
            {d.concept.map((c) => (
              <div key={c.name}>
                <p className="text-note font-medium text-muted">{c.unit}</p>
                <p className="mt-0.5 text-heading leading-tight font-semibold tracking-[-0.02em] text-ink">{c.name}</p>
                <p className="mt-1 text-lead text-ink-soft">“{c.question}”</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] text-faint">{d.credit}</p>
        </Reveal>

        <div className="space-y-[clamp(1.25rem,3.5vh,2rem)] lg:col-span-5">
          <Reveal delay={0.05}>
            <Block label="Problem">{d.problem}</Block>
          </Reveal>
          <Reveal delay={0.1}>
            <Block label="What I did">
              {d.did}
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {d.criteria.map((c) => (
                  <Tag key={c} tone="blue">
                    {c}
                  </Tag>
                ))}
              </ul>
              <TechDetail items={d.models} label="비교한 구조" className="mt-3" />
            </Block>
          </Reveal>
          <Reveal delay={0.15}>
            <Block label="Result">{d.result}</Block>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="border-l-2 border-sky pl-5">
              <Label>What I learned</Label>
              <p className="mt-1.5 text-lead font-semibold tracking-[-0.01em] text-ink">
                <Em text={d.lesson} />
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Chapter>
  )
}

/**
 * 실제 주행 영상 위에서 경계선을 끌어 비교: 왼쪽 = 카메라, 오른쪽 = Semantic Segmentation.
 * 영상 한 파일에 [카메라 | 예측]이 좌우로 붙어 있다. <video>는 왼쪽 절반(카메라)만 보이게 깔고,
 * 같은 <video>의 오른쪽 절반을 매 프레임 canvas에 그려 겹친다 → 두 화면이 절대 어긋나지 않는다.
 */
function DriveCompare() {
  const { scenes, legend, left, right, alt } = d.drive
  const [scene, setScene] = useState(0)
  const [pos, setPos] = useState(50)
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const visible = useInView(wrap, { amount: 0.2 })
  const firstSeen = useInView(wrap, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const sweep = useRef<{ stop: () => void } | null>(null)

  // 화면에 보일 때만 재생 (모션 감소면 첫 프레임에서 멈춤)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (visible && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [visible, reduce, scene])

  // 같은 프레임의 오른쪽 절반(예측)을 canvas에 그린다
  useEffect(() => {
    const v = video.current
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!v || !c || !ctx) return
    const draw = () => {
      if (v.readyState < 2) return
      const w = v.videoWidth / 2
      const h = v.videoHeight
      if (c.width !== w || c.height !== h) {
        c.width = w
        c.height = h
      }
      ctx.drawImage(v, w, 0, w, h, 0, 0, w, h)
    }
    let raf = 0
    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    if (visible) raf = requestAnimationFrame(loop)
    v.addEventListener('loadeddata', draw)
    v.addEventListener('seeked', draw)
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('loadeddata', draw)
      v.removeEventListener('seeked', draw)
    }
  }, [visible, scene])

  // 처음 보이면 경계선이 한 번 왕복해 끌 수 있다는 걸 보여준다
  useEffect(() => {
    if (!firstSeen || reduce) return
    sweep.current = animate(50, [50, 82, 20, 50], { duration: 2.8, ease: 'easeInOut', onUpdate: setPos })
    return () => sweep.current?.stop()
  }, [firstSeen, reduce])

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  return (
    <div>
      <div
        ref={wrap}
        className="relative aspect-[2/1] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[6px] bg-ink select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-blue"
        onPointerDown={(e) => {
          sweep.current?.stop()
          e.currentTarget.setPointerCapture(e.pointerId)
          fromPointer(e)
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
        }}
      >
        <video
          ref={video}
          key={scenes[scene].src}
          src={asset(scenes[scene].src)}
          poster={asset(scenes[scene].poster)}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 size-full object-cover object-left"
        />
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 size-full"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        />
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[11px] text-white">
          {left.tag}
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[11px] text-white">
          {right.tag}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(23,35,49,0.25)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-sm">
            <ChevronsLeftRight className="size-5" />
          </span>
        </span>
        <p className="sr-only">{alt}</p>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => {
            sweep.current?.stop()
            setPos(Number(e.target.value))
          }}
          aria-label="카메라와 Semantic Segmentation 비교 위치"
          className="sr-only"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="group"
          aria-label="주행 장면"
          className="inline-flex rounded-full border border-line-strong bg-surface p-1"
        >
          {scenes.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-pressed={scene === i}
              onClick={() => setScene(i)}
              className={`rounded-full px-3 py-1 text-note font-medium transition-colors ${
                scene === i ? 'bg-ink text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <ul aria-label="클래스 색" className="flex flex-wrap gap-x-3 gap-y-1">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 text-body text-ink-soft">{children}</div>
    </div>
  )
}
