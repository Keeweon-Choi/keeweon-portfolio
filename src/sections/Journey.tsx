import { ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Section } from '../components/Section'
import { Em, Label } from '../components/ui'
import { journey, journeyIntro, pill, type JourneyItem } from '../data/projects'
import type { SectionId } from '../data/sections'
import { asset, pad } from '../lib/util'

type Props = { step: number; onStep: (step: number) => void; onJump: (id: SectionId) => void }

/**
 * step 0: timeline만, step 1: 선택한 프로젝트 설명(기본 Pill).
 * Pill은 별도 섹션 없이 여기서 짧은 case로 보여준다.
 */
export function Journey({ step, onStep, onJump }: Props) {
  const [focusId, setFocusId] = useState('pill')
  // 패널이 닫히면(← 키 포함) 다음 → 키는 다시 Pill부터
  if (step === 0 && focusId !== 'pill') setFocusId('pill')
  const selected = step > 0 ? journey.find((j) => j.id === focusId) : undefined

  const toggle = (id: string) => {
    if (selected?.id === id) return onStep(0)
    setFocusId(id)
    onStep(1)
  }

  return (
    <Section id="journey">
      <p className="text-note font-medium text-muted">{journeyIntro.kicker}</p>
      <h2 className="mt-3 text-title font-bold tracking-[-0.035em]">
        <Em text={journeyIntro.question} />
      </h2>

      <ol className="mt-[clamp(1rem,5vh,4rem)] grid gap-x-0 gap-y-3 sm:grid-cols-2 lg:grid-cols-6">
        {journey.map((j, i) => (
          <Node key={j.id} item={j} index={i} open={selected?.id === j.id} onClick={() => toggle(j.id)} />
        ))}
      </ol>

      <div aria-hidden className="mt-2 hidden items-center gap-3 text-note text-muted lg:flex">
        <span>{journeyIntro.axis.from}</span>
        <span className="h-px flex-1 bg-line-strong" />
        <ArrowRight className="-ml-3 size-3.5 text-line-strong" />
        <span className="text-blue-deep">{journeyIntro.axis.to}</span>
      </div>

      <div className="mt-[clamp(0.75rem,3vh,2.5rem)] min-h-[clamp(9.5rem,21vh,15rem)] border-t border-line pt-[clamp(0.875rem,2.6vh,1.75rem)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected?.id ?? 'hint'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {!selected ? (
              <p className="text-note text-faint">↑ {journeyIntro.hint}</p>
            ) : selected.id === 'pill' ? (
              <PillCase />
            ) : (
              <Summary item={selected} onJump={onJump} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  )
}

function Node({ item, index, open, onClick }: { item: JourneyItem; index: number; open: boolean; onClick: () => void }) {
  const isLast = index === journey.length - 1
  const dashed = journey[index + 1]?.future
  return (
    <li>
      <button type="button" aria-expanded={open} onClick={onClick} className="group block w-full rounded-sm pb-3 text-left">
        <span className={`font-mono text-note ${open ? 'text-blue-deep' : 'text-muted'}`}>
          {item.future ? 'NEXT' : pad(index + 1)}
          {item.current && <span className="ml-2 font-sans text-blue-deep">· 진행 중</span>}
        </span>
        <span aria-hidden className="mt-2.5 flex items-center">
          <span
            className={`size-3.5 shrink-0 rounded-full border-[1.5px] transition-colors ${
              open
                ? 'border-blue bg-blue'
                : item.future
                  ? 'border-dashed border-muted bg-canvas group-hover:bg-sky-pale'
                  : 'border-blue bg-canvas group-hover:bg-sky-pale'
            }`}
          />
          {!isLast && <span className={`ml-2 hidden flex-1 border-t lg:block ${dashed ? 'border-dashed border-faint' : 'border-line-strong'}`} />}
        </span>
        <span className="block pr-5">
          <span
            className={`mt-3 block text-node font-semibold tracking-[-0.02em] transition-colors ${
              open ? 'text-blue' : item.future ? 'text-ink-soft' : 'text-ink group-hover:text-blue-deep'
            }`}
          >
            {item.field}
          </span>
          <span className="mt-1.5 block font-mono text-note text-muted">{item.project}</span>
          <span className="mt-2.5 block text-body text-ink-soft">{item.tagline}</span>
        </span>
      </button>
    </li>
  )
}

function PillCase() {
  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12">
      <div className="lg:col-span-10">
        <p className="text-body text-muted">
          <span className="font-semibold text-ink">Pill Identification</span> — {pill.point}
        </p>
        <ol className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {pill.steps.map((s) => (
            <li key={s.label} className={`border-l-2 pl-4 ${s.tone === 'warn' ? 'border-warn/60' : s.tone === 'blue' ? 'border-blue' : 'border-line-strong'}`}>
              <Label tone={s.tone}>{s.label}</Label>
              <p className="mt-1 text-body text-ink">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-[clamp(0.75rem,2.6vh,1.75rem)] flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-note font-medium text-muted">배운 점</span>
          <span className="text-lead font-semibold tracking-[-0.01em] text-ink">{pill.lesson}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 lg:col-span-2 lg:justify-end">
        {pill.screens.map((s, i) => (
          <div key={s.src} className="flex items-center gap-3">
            {i > 0 && <ArrowRight aria-hidden className="size-4 text-faint" />}
            <figure>
              <img
                src={asset(s.src)}
                alt={s.alt}
                className="h-[clamp(6.5rem,16vh,11rem)] w-auto rounded-[6px] border border-line bg-surface"
              />
              <figcaption className="mt-1.5 text-center text-note text-muted">{s.caption}</figcaption>
            </figure>
          </div>
        ))}
      </div>
    </div>
  )
}

function Summary({ item, onJump }: { item: JourneyItem; onJump: (id: SectionId) => void }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Label>
          {item.project} — {item.field}
        </Label>
        <p className="mt-3 max-w-[38em] text-lead text-ink">{item.summary}</p>
      </div>
      {item.section && (
        <button
          type="button"
          onClick={() => onJump(item.section!)}
          className="inline-flex items-center gap-2 rounded-full border border-blue/40 px-4 py-2 text-body text-blue-deep transition-colors hover:bg-sky-wash"
        >
          자세히 보기 <ArrowRight aria-hidden className="size-4" />
        </button>
      )}
    </div>
  )
}
