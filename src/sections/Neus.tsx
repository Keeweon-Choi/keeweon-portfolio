import { ArrowDown, ArrowRight } from 'lucide-react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { Em, Figure, Label, Tag, Title } from '../components/ui'
import { neus as d } from '../data/projects'
import { pad } from '../lib/util'

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
            <ul className="mt-5 flex flex-wrap gap-2">
              {d.team.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </ul>
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

        <div className="lg:col-span-5">
          {d.image && <Figure src={d.image} alt="NEUS" className="mb-8" />}
          <ol>
            {d.flow.map((f, i) => (
              <Reveal as="li" key={f.label} delay={0.1 + i * 0.12} y={16}>
                {i > 0 && <ArrowDown aria-hidden className="my-2 ml-1 size-4 text-faint" />}
                <div className="grid grid-cols-[2.5rem_1fr] items-baseline border-t border-line pt-3">
                  <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
                  <div>
                    <p className="text-heading font-semibold tracking-[-0.02em] text-ink">{f.label}</p>
                    <p className="text-body text-muted">{f.text}</p>
                    {f.detail && <p className="mt-1 text-body text-ink-soft">{f.detail}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
          {d.facts.length > 0 && (
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
              {d.facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-note font-medium text-muted">{k}</dt>
                  <dd className="text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <Reveal className="mt-[clamp(3rem,9vh,5rem)]">
        <p className="max-w-[40em] border-l-2 border-sky pl-6 text-lead font-semibold tracking-[-0.01em] text-ink">
          <Em text={d.message} />
        </p>
      </Reveal>
    </Chapter>
  )
}
