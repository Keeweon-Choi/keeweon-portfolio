import { ArrowRight } from 'lucide-react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Section } from '../components/Section'
import { Em, Label } from '../components/ui'
import { redesign as d, type PipelineNode, type Tone } from '../data/projects'

type Props = { step: number; onStep: (step: number) => void }

/** Smart Glass 메인 인터랙션: → 키(또는 토글)로 초기 설계 2–3 FPS → 재설계 15+ FPS */
export function Redesign({ step, onStep }: Props) {
  const s = d.states[step]
  const fade = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
  }

  return (
    <Section id="redesign">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label="설계 단계" className="inline-flex rounded-full border border-line-strong bg-surface p-1">
          {d.states.map((state, i) => (
            <button
              key={state.tab}
              type="button"
              aria-pressed={step === i}
              onClick={() => onStep(i)}
              className={`rounded-full px-4 py-1.5 text-note font-medium transition-colors ${
                step === i ? (i ? 'bg-blue text-white' : 'bg-ink text-white') : 'text-muted hover:text-ink'
              }`}
            >
              {state.tab} <span className="ml-1 font-mono opacity-80">{state.fps} FPS</span>
            </button>
          ))}
        </div>
        <span className="text-note text-faint">{step === 0 ? '→ 다음: 재설계' : ''}</span>
      </div>

      <div className="mt-[clamp(1rem,3.5vh,2.25rem)] grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} {...fade}>
              <Label tone={step ? 'blue' : 'warn'}>{s.kicker}</Label>
              <h2 className="mt-2 text-title font-bold tracking-[-0.035em] text-ink">
                <Em text={s.title} />
              </h2>
              <Pipeline state={s} />
              <Label className="mt-[clamp(1.25rem,4vh,2.5rem)]">{s.notesLabel}</Label>
              <ul className={`mt-3 grid gap-x-8 gap-y-2 ${step ? 'sm:grid-cols-2' : ''}`}>
                {s.notes.map((n) => (
                  <li key={n} className="flex items-start gap-3 text-body text-ink">
                    <span aria-hidden className={`mt-[0.6em] size-1.5 shrink-0 rounded-full ${step ? 'bg-blue' : 'bg-warn'}`} />
                    {n}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-[clamp(1.5rem,5vh,3rem)] lg:col-span-4">
          <FpsMeter step={step} />
          <AnimatePresence initial={false}>
            {step === 1 && (
              <motion.blockquote {...fade} transition={{ ...fade.transition, delay: 0.35 }} className="border-l-2 border-sky pl-5">
                <Label>What I learned</Label>
                <p className="mt-2 text-lead font-semibold tracking-[-0.01em] text-ink">
                  <Em text={d.lesson} />
                </p>
              </motion.blockquote>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  )
}

type State = (typeof d.states)[number]

const box: Record<Tone, string> = {
  muted: 'border-line bg-surface',
  blue: 'border-blue/50 bg-sky-wash',
  warn: 'border-warn/50 bg-warn-pale',
}

function Pipeline({ state }: { state: State }) {
  const { group } = state
  return (
    <div className="mt-[clamp(1rem,3.5vh,2rem)] grid items-center gap-2 sm:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1fr)_auto_minmax(0,1.5fr)_auto_minmax(0,1fr)]">
      <Stack nodes={state.input} />
      <Arrow />
      <Node node={state.selector} />
      <Arrow />
      <div className={`rounded-[4px] border border-dashed p-2 ${group.tone === 'warn' ? 'border-warn/60' : 'border-blue/60'}`}>
        <p className={`px-1 pb-1.5 text-note font-medium ${group.tone === 'warn' ? 'text-warn' : 'text-blue-deep'}`}>{group.label}</p>
        <Stack nodes={state.modules} />
        <p className={`px-1 pt-1.5 text-note ${group.tone === 'warn' ? 'text-warn' : 'text-muted'}`}>
          {group.tone === 'warn' ? '⚠ ' : ''}
          {group.note}
        </p>
      </div>
      <Arrow />
      <Stack nodes={state.output} />
    </div>
  )
}

function Stack({ nodes }: { nodes: PipelineNode[] }) {
  return (
    <div className="grid gap-1.5">
      {nodes.map((n) => (
        <Node key={n.name} node={n} />
      ))}
    </div>
  )
}

function Node({ node }: { node: PipelineNode }) {
  return (
    <div className={`rounded-[3px] border px-3 py-2 ${box[node.tone ?? 'muted']}`}>
      <p className="text-body leading-snug font-semibold text-ink">{node.name}</p>
      {node.note && (
        <p className={`mt-0.5 text-note leading-snug ${node.tone === 'warn' ? 'text-warn' : node.tone === 'blue' ? 'text-blue-deep' : 'text-muted'}`}>
          {node.note}
        </p>
      )}
    </div>
  )
}

function Arrow() {
  return <ArrowRight aria-hidden className="mx-auto size-4 rotate-90 text-faint sm:rotate-0" />
}

/** FPS 숫자 count-up + 1초 동안 처리하는 프레임 strip */
function FpsMeter({ step }: { step: number }) {
  const s = d.states[step]
  const reduce = useReducedMotion()
  const [counting, setCounting] = useState<number | null>(null)
  const prevStep = useRef(step)

  useEffect(() => {
    if (prevStep.current === step) return
    prevStep.current = step
    if (reduce) return
    const [from, to] = step ? [3, 15] : [15, 3]
    const controls = animate(from, to, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setCounting(Math.round(v)),
      onComplete: () => setCounting(null),
    })
    return () => {
      controls.stop()
      setCounting(null)
    }
  }, [step, reduce])

  const slots = d.states[1].lit
  return (
    <div>
      <Label>{d.fpsLabel}</Label>
      <p
        className={`mt-1 text-[length:var(--text-display)] leading-none font-light tracking-[-0.04em] tabular-nums transition-colors duration-500 ${
          step ? 'text-blue' : 'text-warn'
        }`}
        aria-live="polite"
      >
        {counting ?? s.fps}
      </p>
      <div aria-hidden className="mt-5 flex gap-1">
        {Array.from({ length: slots }, (_, i) => {
          const fill = Math.min(1, Math.max(0, s.lit - i))
          return (
            <span
              key={i}
              className={`h-7 flex-1 rounded-[2px] transition-colors duration-300 ${
                fill === 1 ? (step ? 'bg-blue' : 'bg-warn') : fill > 0 ? 'bg-warn/40' : 'bg-line'
              }`}
              style={{ transitionDelay: `${step ? i * 35 : 0}ms` }}
            />
          )
        })}
      </div>
      <p className="mt-2 text-note text-muted">{d.stripLabel}</p>
    </div>
  )
}
