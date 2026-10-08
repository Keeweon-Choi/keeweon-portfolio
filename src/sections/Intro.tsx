import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Em } from '../components/ui'
import { profile } from '../data/profile'
import { chapters } from '../data/sections'
import { asset, ease, pad } from '../lib/util'

/** 로드 직후 위에서부터 차례로 떠오른다 */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay: 0.1 + i * 0.09 },
})

/** 표지 + 목차 */
export function Intro() {
  return (
    <section id="top" aria-label="표지와 목차" className="relative scroll-mt-14 overflow-hidden px-gutter">
      {/* 은은한 모눈 — 왼쪽 위에서 퍼지다 사라진다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_20%_30%,black_10%,transparent_65%)] opacity-70"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-page items-center gap-x-16 gap-y-14 py-[clamp(3rem,9vh,6rem)] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <motion.p {...rise(0)} className="flex items-center gap-3 text-lead text-ink-soft">
            <img src={asset(profile.emblem)} alt="" className="size-[1.6em]" />
            {profile.affiliation}
          </motion.p>
          <motion.h1
            {...rise(1)}
            className="mt-[clamp(1rem,3vh,2rem)] text-display font-bold tracking-[-0.045em] text-ink"
          >
            {profile.nameKo}
            <span className="mt-[0.14em] block text-title font-light tracking-[-0.02em] text-muted">
              {profile.nameEn}
            </span>
          </motion.h1>
          <motion.p
            {...rise(2)}
            className="mt-[clamp(1.5rem,5vh,3rem)] max-w-[20em] text-heading leading-snug font-semibold tracking-[-0.02em] text-ink"
          >
            <Em text={profile.statement} />
          </motion.p>
          <motion.ul {...rise(3)} className="mt-6 flex flex-wrap gap-2">
            {profile.keywords.map((k) => (
              <li
                key={k}
                className="rounded-full border border-blue/40 bg-surface px-4 py-1.5 text-body font-medium text-blue-deep"
              >
                {k}
              </li>
            ))}
          </motion.ul>
          <motion.a
            {...rise(4)}
            href="#about"
            className="mt-[clamp(2rem,7vh,4rem)] inline-flex items-center gap-2 rounded-sm font-mono text-note tracking-[0.12em] text-muted uppercase transition-colors hover:text-blue-deep"
          >
            Scroll
            <motion.span
              aria-hidden
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="size-4" />
            </motion.span>
          </motion.a>
        </div>

        <nav id="contents" aria-label="목차" className="scroll-mt-20 lg:col-span-6">
          <motion.div {...rise(2)} className="flex items-baseline justify-between border-b-2 border-ink pb-3">
            <p className="font-mono text-note font-semibold tracking-[0.16em] text-ink uppercase">Contents</p>
            <p className="font-mono text-note text-muted">{pad(chapters.length)} chapters</p>
          </motion.div>
          <ol>
            {chapters.map((c, i) => (
              <motion.li key={c.id} {...rise(3 + i * 0.6)}>
                <a
                  href={`#${c.id}`}
                  className="group grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 border-b border-line py-[clamp(0.75rem,1.9vh,1.15rem)] transition-colors hover:bg-sky-wash sm:px-2"
                >
                  <span className="font-mono text-note text-faint transition-colors group-hover:text-blue">
                    {pad(i + 1)}
                  </span>
                  <span>
                    <span className="flex items-center gap-2 text-node font-semibold tracking-[-0.02em] text-ink">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-note text-muted">{c.toc}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue"
                  />
                </a>
              </motion.li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}
