import { ArrowDown, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { Em, Label, Tag, Title } from '../components/ui'
import { neus as d } from '../data/projects'
import { asset, pad } from '../lib/util'

export function Neus() {
  return (
    <Chapter id="neus" tone="surface">
      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="flex items-center gap-2 text-note font-medium text-blue-deep">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue/50 [animation-duration:2.4s]" />
                <span className="relative size-2 rounded-full bg-blue" />
              </span>
              {d.status}
            </p>
            <Title text={d.title} className="mt-3" />
            <p className="mt-[clamp(1rem,3vh,1.75rem)] max-w-[34em] text-lead text-ink-soft">{d.intro}</p>
            <p className="mt-4 inline-block border-l-2 border-ink pl-3 text-body font-medium text-ink-soft">
              “{d.tagline}”
            </p>
          </Reveal>

          {/* Vision 중심 경험 → NLP / LLM으로 확장 */}
          <Reveal delay={0.1} className="mt-[clamp(2.5rem,7vh,4rem)]">
            <div className="grid items-center gap-5 rounded-[6px] border border-line bg-canvas p-5 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <Label>{`${d.shift.beforeLabel} · ${d.shift.beforeNote}`}</Label>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {d.shift.before.map((b) => (
                    <Tag key={b}>{b}</Tag>
                  ))}
                </ul>
              </div>
              <ArrowRight aria-hidden className="hidden size-5 text-blue sm:block" />
              <div>
                <Label tone="blue">{d.shift.nowLabel}</Label>
                <p className="mt-1 text-heading font-semibold tracking-[-0.02em] whitespace-nowrap text-blue">
                  {d.shift.now}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <ol className="lg:col-span-5">
          {d.flow.map((f, i) => (
            <Reveal as="li" key={f.label} delay={0.1 + i * 0.12} y={16}>
              {i > 0 && <ArrowDown aria-hidden className="my-2 ml-1 size-4 text-faint" />}
              <div className="grid grid-cols-[2.5rem_1fr] items-baseline border-t border-line pt-3">
                <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
                <div>
                  <p className="text-heading font-semibold tracking-[-0.02em] text-ink">{f.label}</p>
                  <p className="mt-0.5 text-body font-medium text-ink">{f.text}</p>
                  <p className="mt-0.5 text-body text-muted">{f.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      <Screens />

      <Reveal className="mt-[clamp(3rem,9vh,5rem)]">
        <p className="max-w-[40em] border-l-2 border-sky pl-6 text-lead font-semibold tracking-[-0.01em] text-ink">
          <Em text={d.message} />
        </p>
      </Reveal>
    </Chapter>
  )
}

/** 실제 서비스 화면 3장: 스크롤해 들어오면 가운데로 겹쳐 있던 화면이 양옆으로 펼쳐진다 (md 이상) */
function Screens() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 60%'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 })
  const k = reduce ? 0 : 1
  // 왼쪽 · 오른쪽 화면은 가운데 뒤에 겹쳐 있다가 제자리로 (가운데는 고정)
  const leftX = useTransform(p, [0, 1], [`${55 * k}%`, '0%'])
  const rightX = useTransform(p, [0, 1], [`${-55 * k}%`, '0%'])
  const leftR = useTransform(p, [0, 1], [`${7 * k}deg`, '-2deg'])
  const rightR = useTransform(p, [0, 1], [`${-7 * k}deg`, '2deg'])
  const fan: (Record<string, MotionValue<string> | string> | undefined)[] = [
    { '--fan-x': leftX, '--fan-r': leftR },
    undefined,
    { '--fan-x': rightX, '--fan-r': rightR },
  ]
  const order = [1, 0, 2] // 가운데 = 언론사별 비교 화면
  return (
    <div ref={ref} className="mt-[clamp(3.5rem,10vh,6rem)]">
      <Label>실제 화면 · {d.url}</Label>
      <div className="mt-5 grid gap-6 md:grid-cols-3 md:items-center md:gap-4">
        {order.map((si, col) => {
          const s = d.screens[si]
          const center = col === 1
          return (
            <motion.figure
              key={s.src}
              style={fan[col]}
              className={`group hover:z-20 ${center ? 'relative z-10 md:scale-[1.08]' : 'md:translate-x-(--fan-x) md:rotate-(--fan-r)'}`}
            >
              {/* hover: 화면이 살짝 떠오르고 그림자가 깊어진다. 부채꼴 transform과 겹치지 않게 안쪽 div에서 */}
              <div className="relative isolate transition-transform duration-300 ease-out after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[10px] after:opacity-0 after:shadow-[0_36px_60px_-30px_rgba(23,35,49,0.5)] after:transition-opacity after:duration-300 group-hover:after:opacity-100 motion-safe:group-hover:-translate-y-2">
                <BrowserFrame src={s.src} alt={s.alt} url={d.url} />
              </div>
              <figcaption className="mt-2 text-center text-note text-muted">{s.caption}</figcaption>
            </motion.figure>
          )
        })}
      </div>
    </div>
  )
}

function BrowserFrame({ src, alt, url }: { src: string; alt: string; url: string }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface shadow-[0_2px_4px_rgba(23,35,49,0.05),0_24px_48px_-24px_rgba(23,35,49,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-canvas px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} aria-hidden className="size-2 rounded-full bg-line-strong" />
        ))}
        <span className="ml-2 truncate rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">{url}</span>
      </div>
      <img src={asset(src)} alt={alt} loading="lazy" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}
