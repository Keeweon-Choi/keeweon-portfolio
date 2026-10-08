import { ArrowUp } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { chapters, type ChapterId } from '../data/sections'

import { ease, pad } from '../lib/util'

const tones = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
  sky: 'bg-sky-wash',
} as const

type Props = { id: ChapterId; children: ReactNode; tone?: keyof typeof tones }

/** 챕터 = 번호 · 이름 · '목차로' 링크가 붙은 섹션. 높이는 내용만큼 (슬라이드처럼 한 화면에 가두지 않는다) */
export function Chapter({ id, children, tone = 'canvas' }: Props) {
  const index = chapters.findIndex((c) => c.id === id)
  const c = chapters[index]
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className={`scroll-mt-14 px-gutter py-[clamp(4.5rem,13vh,9rem)] ${tones[tone]}`}
    >
      <div className="mx-auto max-w-page">
        <header className="relative flex items-end justify-between gap-6 pb-4">
          <motion.div
            className="flex items-end gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              aria-hidden
              className="text-[clamp(3rem,6vw,5.5rem)] leading-[0.78] font-bold tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_var(--color-blue)]"
            >
              {pad(index + 1)}
            </span>
            <div>
              {c.kicker && <p className="font-mono text-note tracking-[0.12em] text-muted uppercase">{c.kicker}</p>}
              <p id={`${id}-label`} className="text-heading leading-tight font-semibold tracking-[-0.02em] text-ink">
                {c.label}
              </p>
            </div>
          </motion.div>
          <a
            href="#contents"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-note font-medium text-muted transition-colors hover:border-blue hover:text-blue-deep"
          >
            <ArrowUp aria-hidden className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            목차
          </a>
          {/* 헤어라인이 왼쪽에서부터 그려진다 */}
          <motion.span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-line-strong"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease }}
          />
        </header>
        <div className="pt-[clamp(2.5rem,7vh,4.5rem)]">{children}</div>
      </div>
    </section>
  )
}
