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
          className="group flex shrink-0 items-center gap-2.5 rounded-sm text-body font-semibold tracking-[-0.01em] text-ink"
        >
          {/* 로고: 탐지 박스(네 모서리)가 렌즈를 잡은 모양 — Computer Vision. hover면 모서리가 조여든다 */}
          <svg aria-hidden viewBox="0 0 32 32" className="size-7 shrink-0">
            <defs>
              <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3d77a8" />
                <stop offset="1" stopColor="#2b5f8c" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
            <path
              d="M8 12.5V8h4.5M19.5 8H24v4.5M24 19.5V24h-4.5M12.5 24H8v-4.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="origin-center transition-transform duration-300 ease-out group-hover:scale-[0.84]"
            />
            <circle cx="16" cy="16" r="3.4" fill="#8ec9e8" className="origin-center transition-transform duration-300 group-hover:scale-125" />
            <circle cx="17.2" cy="14.8" r="1" fill="#fff" />
          </svg>
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
