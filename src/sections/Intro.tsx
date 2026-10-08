import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { profile } from '../data/profile'
import { chapters, type ChapterId } from '../data/sections'
import { asset, ease, pad } from '../lib/util'

/** 로드 직후 위에서부터 차례로 떠오른다 */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay: 0.1 + i * 0.09 },
})

const previews: Partial<Record<ChapterId, { src: string; position?: string }>> = {
  about: { src: 'images/profile.jpg' },
  journey: { src: 'images/pill-result.png' },
  segmentation: { src: 'media/drive-seg-2.jpg', position: 'object-left' },
  'smart-glass': { src: 'images/smartglass-worn.jpg' },
  neus: { src: 'images/neus-compare.jpg' },
}

/** 표지 + 목차 */
export function Intro() {
  const [statementStart = '', statementEmphasis = '', statementEnd = ''] = profile.statement.split('*')

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
          <h1 className="mt-[clamp(1rem,3vh,2rem)] text-display font-bold tracking-[-0.045em] text-ink">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                initial={{ opacity: 0, y: '105%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease, delay: 0.24 }}
                className="block"
              >
                {profile.nameKo}
              </motion.span>
            </span>
            <span className="mt-[0.14em] block overflow-hidden pb-[0.1em] text-title font-light tracking-[-0.02em] text-muted">
              <motion.span
                initial={{ opacity: 0, y: '105%' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease, delay: 0.38 }}
                className="block"
              >
                {profile.nameEn}
              </motion.span>
            </span>
          </h1>
          <motion.p
            {...rise(2)}
            className="mt-[clamp(1.5rem,5vh,3rem)] max-w-[20em] text-heading leading-snug font-semibold tracking-[-0.02em] text-ink"
          >
            {statementStart}
            <em className="relative whitespace-nowrap text-blue not-italic">
              {statementEmphasis}
              <motion.span
                aria-hidden
                className="absolute right-0 -bottom-[0.08em] left-0 h-[2px] origin-left bg-blue"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.65, ease, delay: 1.16 }}
              />
            </em>
            {statementEnd}
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
            {chapters.map((c, i) => {
              const preview = previews[c.id]
              return (
                <motion.li key={c.id} {...rise(3 + i * 0.6)}>
                  <a
                    href={`#${c.id}`}
                    className="group relative grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 overflow-hidden border-b border-line py-[clamp(0.75rem,1.9vh,1.15rem)] sm:px-2"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-sky-wash transition-transform duration-500 group-hover:scale-x-100 group-focus:scale-x-100 group-focus-visible:scale-x-100"
                    />
                    <span className="relative font-mono text-note text-faint transition-colors group-hover:text-blue group-focus:text-blue group-focus-visible:text-blue">
                      {pad(i + 1)}
                    </span>
                    <span className="relative">
                      <span className="flex items-center gap-2 text-node font-semibold tracking-[-0.02em] text-ink">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-note text-muted">{c.toc}</span>
                    </span>
                    {/* 화살표는 항상, 미리보기가 있는 행은 hover/포커스 때 썸네일로 바뀐다 */}
                    <span className="relative grid size-5 place-items-center">
                      <ArrowUpRight
                        aria-hidden
                        className={`size-5 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue group-focus-visible:text-blue ${
                          preview ? 'group-hover:opacity-0 group-focus-visible:opacity-0' : ''
                        }`}
                      />
                      {preview && (
                        <span className="pointer-events-none absolute top-1/2 right-0 h-10 w-16 -translate-y-1/2 translate-x-2 overflow-hidden rounded-[3px] border border-line bg-surface opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                          <img
                            src={asset(preview.src)}
                            alt=""
                            className={`size-full object-cover ${preview.position ?? ''}`}
                          />
                        </span>
                      )}
                    </span>
                  </a>
                </motion.li>
              )
            })}
          </ol>
        </nav>
      </div>
    </section>
  )
}
