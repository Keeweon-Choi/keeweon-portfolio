import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Chapter } from '../components/Chapter'
import { Reveal, Words } from '../components/motion'
import { Label } from '../components/ui'
import { journey, journeyIntro, pill, type JourneyItem } from '../data/projects'
import { usePassed } from '../hooks/usePassed'
import { asset, pad } from '../lib/util'

/** 세로 타임라인: 스크롤한 만큼 선이 차오르고(끝에 빛나는 점), 지나간 프로젝트의 점이 켜진다 */
export function Journey() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 55%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  // 선 끝(트랙 높이의 fill%)을 따라가는 점. 시작 전에는 숨긴다
  const headY = useTransform(fill, (v) => `${v * 100}%`)
  const headOpacity = useTransform(fill, [0, 0.015], [0, 1])

  return (
    <Chapter id="journey">
      <Reveal className="max-w-[62rem]">
        <p className="text-note font-medium text-muted">{journeyIntro.kicker}</p>
        <h2 className="mt-3 text-title font-bold tracking-[-0.035em] text-ink">
          <Words text={journeyIntro.question} />
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
        <motion.span
          aria-hidden
          style={{ y: headY, opacity: headOpacity }}
          className="pointer-events-none absolute top-3 bottom-3 left-[11px] w-0.5"
        >
          <span className="absolute top-0 left-1/2 size-3 -translate-1/2 rounded-full bg-blue shadow-[0_0_0_4px_rgba(142,201,232,0.5),0_0_16px_4px_rgba(61,119,168,0.35)]" />
        </motion.span>
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
  const reduce = useReducedMotion()
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
        {/* 지나가는 순간 한 번 퍼지는 고리 */}
        {passed && !reduce && (
          <motion.span
            className="absolute -inset-0.5 rounded-full border-2 border-blue"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}
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
      {/* 실제 앱 화면: 촬영 → 서버 추론 결과 */}
      <div className="mt-6 flex items-center justify-center gap-[clamp(0.75rem,2vw,2rem)] border-t border-line pt-6">
        {pill.screens.map((s, i) => (
          <div key={s.src} className="flex min-w-0 items-center gap-[clamp(0.75rem,2vw,2rem)]">
            {i > 0 && (
              <span className="flex shrink-0 flex-col items-center gap-1 text-blue">
                <ArrowRight aria-hidden className="size-5" />
                <span className="text-[11px] whitespace-nowrap text-muted">서버 추론</span>
              </span>
            )}
            <figure className="min-w-0">
              <img
                src={asset(s.src)}
                alt={s.alt}
                className="h-auto max-h-[clamp(16rem,40vh,26rem)] w-auto max-w-full rounded-[10px] border border-line bg-surface shadow-[0_12px_30px_-18px_rgba(23,35,49,0.35)]"
              />
              <figcaption className="mt-2 text-center text-note text-muted">{s.caption}</figcaption>
            </figure>
          </div>
        ))}
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
