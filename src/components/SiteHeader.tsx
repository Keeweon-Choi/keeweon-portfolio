import { TableOfContents } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useState } from 'react'
import { chapters, type ChapterId } from '../data/sections'
import { profile } from '../data/profile'
import { pad } from '../lib/util'

/** 상단 고정 바: 이름 · 챕터 메뉴(현재 위치 표시) · 목차 버튼 · 읽은 만큼 차오르는 진행선 */
export function SiteHeader({ active }: { active: ChapterId | null }) {
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 })
  const [scrolled, setScrolled] = useState(false)
  const index = chapters.findIndex((c) => c.id === active)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled((wasScrolled) => {
      const nextScrolled = latest > 40
      return wasScrolled === nextScrolled ? wasScrolled : nextScrolled
    })
  })

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line bg-canvas px-gutter transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_5px_18px_rgb(23_35_49_/_0.08)]' : 'shadow-none'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-page items-center gap-6">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2.5 rounded-sm text-body font-semibold tracking-[-0.01em] text-ink"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-blue font-mono text-[12px] font-bold text-white"
          >
            KC
          </span>
          {profile.nameKo}
          <span className="hidden font-normal text-muted sm:inline">{profile.nameEn}</span>
        </a>

        <nav aria-label="챕터" className="ml-auto hidden xl:block">
          <ol className="flex items-center">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  aria-current={active === c.id ? 'location' : undefined}
                  className={`relative block rounded-sm px-3 py-2 text-note font-medium transition-colors ${
                    active === c.id ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span className="mr-1.5 font-mono text-faint">{pad(i + 1)}</span>
                  {c.label}
                  {active === c.id && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[9px] h-[2px] bg-blue"
                    />
                  )}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 좁은 화면: 메뉴 대신 지금 챕터만 */}
        <p className="ml-auto truncate font-mono text-note text-muted xl:hidden">
          {index >= 0 && `${pad(index + 1)} · ${chapters[index].label}`}
        </p>

        <a
          href="#contents"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-note font-medium text-ink-soft transition-colors hover:border-blue hover:text-blue-deep"
        >
          <TableOfContents aria-hidden className="size-4" />
          목차
        </a>
      </div>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-blue"
      />
    </header>
  )
}
