import { ChevronsLeftRight } from 'lucide-react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { Em, Label, Tag, TechDetail, Title } from '../components/ui'
import { segmentation as d } from '../data/projects'
import { asset } from '../lib/util'

export function Segmentation() {
  const [det, seg] = d.compare
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
          <div className="w-[min(100%,calc(56vh*890/777))]">
            <Compare />
            <div className="mt-4 grid grid-cols-2 gap-6">
              <Caption item={det} />
              <Caption item={seg} align="right" />
            </div>
            <p className="mt-3 font-mono text-[11px] text-faint">{d.credit}</p>
          </div>
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
 * 같은 사진을 겹쳐 놓고 경계선을 끌어 비교: 왼쪽 = Object Detection(box), 오른쪽 = Semantic Segmentation(pixel).
 * 처음 화면에 들어오면 경계선이 한 번 왕복해 끌 수 있다는 걸 보여준다. 키보드는 숨은 range input으로.
 */
function Compare() {
  const [det, seg] = d.compare
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const sweep = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    if (!inView || reduce) return
    sweep.current = animate(50, [50, 80, 22, 50], { duration: 2.4, ease: 'easeInOut', onUpdate: setPos })
    return () => sweep.current?.stop()
  }, [inView, reduce])

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={ref}
      className="relative aspect-[890/777] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[4px] bg-line select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-blue"
      onPointerDown={(e) => {
        sweep.current?.stop()
        e.currentTarget.setPointerCapture(e.pointerId)
        fromPointer(e)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
      }}
    >
      <img src={asset(seg.src)} alt={seg.alt} draggable={false} className="absolute inset-0 size-full" />
      <img
        src={asset(det.src)}
        alt={det.alt}
        draggable={false}
        className="absolute inset-0 size-full"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-ink/75 px-2.5 py-1 font-mono text-[11px] text-white">
        box
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 font-mono text-[11px] text-white">
        pixel
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
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => {
          sweep.current?.stop()
          setPos(Number(e.target.value))
        }}
        aria-label="Object Detection과 Semantic Segmentation 비교 위치"
        className="sr-only"
      />
    </div>
  )
}

function Caption({ item, align = 'left' }: { item: (typeof d.compare)[number]; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="text-note font-medium text-muted">{item.unit}</p>
      <p className="mt-0.5 text-heading leading-tight font-semibold tracking-[-0.02em] text-ink">{item.name}</p>
      <p className="mt-1 text-lead text-ink-soft">“{item.question}”</p>
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
