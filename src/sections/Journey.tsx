import { ArrowRight } from 'lucide-react'
import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { Em, Label } from '../components/ui'
import { journey, journeyIntro, pill, type JourneyItem } from '../data/projects'
import { usePassed } from '../hooks/usePassed'
import { asset, pad } from '../lib/util'

/** 세로 타임라인: 스크롤한 만큼 선이 차오르고, 지나간 프로젝트의 점이 켜진다 */
export function Journey() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 55%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <Chapter id="journey">
      <Reveal className="max-w-[62rem]">
        <p className="text-note font-medium text-muted">{journeyIntro.kicker}</p>
        <h2 className="mt-3 text-title font-bold tracking-[-0.035em] text-ink">
          <Em text={journeyIntro.question} />
        </h2>
        <p className="mt-5 text-lead text-ink-soft">{journeyIntro.sub}</p>
      </Reveal>

      <ol ref={listRef} className="relative mt-[clamp(3rem,9vh,5.5rem)]">
        <span aria-hidden className="absolute top-3 bottom-3 left-[11px] w-0.5 rounded-full bg-line" />
        <motion.span
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute top-3 bottom-3 left-[11px] w-0.5 origin-top rounded-full bg-blue"
        />
        {journey.map((j, i) => (
          <Stop key={j.id} item={j} index={i} />
        ))}
      </ol>
    </Chapter>
  )
}

function Stop({ item, index }: { item: JourneyItem; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const passed = usePassed(ref)
  return (
    <li ref={ref} className="relative pb-[clamp(3rem,8vh,5rem)] pl-12 last:pb-0 sm:pl-16">
      <span
        aria-hidden
        className={`absolute top-1 left-0 grid size-6 place-items-center rounded-full border-2 bg-canvas transition-colors duration-500 ${
          item.future ? 'border-dashed' : ''
        } ${passed ? 'border-blue' : 'border-line-strong'}`}
      >
        <span
          className={`size-2.5 rounded-full bg-blue transition-transform duration-500 ${passed ? 'scale-100' : 'scale-0'}`}
        />
      </span>

      <Reveal className="grid gap-x-12 gap-y-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono text-note text-muted">
            {item.future ? 'NEXT' : pad(index + 1)} · {item.project}
            {item.current && <span className="ml-2 font-sans font-medium text-blue-deep">진행 중</span>}
          </p>
          <h3
            className={`mt-2 text-heading leading-tight font-semibold tracking-[-0.02em] transition-colors duration-500 ${
              passed ? 'text-blue' : 'text-ink'
            }`}
          >
            {item.field}
          </h3>
          <p className="mt-2 text-lead text-ink-soft">{item.tagline}</p>
        </div>
        <div className="lg:col-span-8">{item.id === 'pill' ? <PillCase /> : <Summary item={item} />}</div>
      </Reveal>
    </li>
  )
}

/** Pill은 별도 챕터 없이 타임라인 안에서 짧은 case로 */
function PillCase() {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-[clamp(1.25rem,3vh,2rem)]">
      <p className="text-body text-muted">{pill.point}</p>
      <ol className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {pill.steps.map((s) => (
          <li
            key={s.label}
            className={`border-l-2 pl-4 ${s.tone === 'warn' ? 'border-warn/60' : s.tone === 'blue' ? 'border-blue' : 'border-line-strong'}`}
          >
            <Label tone={s.tone}>{s.label}</Label>
            <p className="mt-1 text-body text-ink">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-5">
        <p className="max-w-[22em]">
          <span className="block text-note font-medium text-muted">배운 점</span>
          <span className="mt-1 block text-lead font-semibold tracking-[-0.01em] text-ink">{pill.lesson}</span>
        </p>
        <div className="flex items-center gap-3">
          {pill.screens.map((s, i) => (
            <div key={s.src} className="flex items-center gap-3">
              {i > 0 && <ArrowRight aria-hidden className="size-4 text-faint" />}
              <figure>
                <img
                  src={asset(s.src)}
                  alt={s.alt}
                  className="h-36 w-auto rounded-[6px] border border-line bg-surface"
                />
                <figcaption className="mt-1.5 text-center text-note text-muted">{s.caption}</figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Summary({ item }: { item: JourneyItem }) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-line pt-4 lg:border-t-0 lg:pt-1">
      <p className="max-w-[36em] text-lead text-ink-soft">{item.summary}</p>
      {item.section && (
        <a
          href={`#${item.section}`}
          className="group inline-flex items-center gap-2 rounded-full border border-blue/40 px-4 py-2 text-body font-medium text-blue-deep transition-colors hover:bg-sky-wash"
        >
          자세히 보기
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  )
}
