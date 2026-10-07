import { ArrowDown } from 'lucide-react'
import { Section } from '../components/Section'
import { Em, Figure, Label, Tag, Title } from '../components/ui'
import { neus as d } from '../data/projects'
import { pad } from '../lib/util'

export function Neus() {
  return (
    <Section id="neus">
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-2 text-note font-medium text-blue-deep">
            <span aria-hidden className="size-2 rounded-full bg-blue" />
            {d.status}
          </p>
          <Title text={d.title} className="mt-3" />
          <p className="mt-[clamp(1rem,3vh,1.75rem)] max-w-[34em] text-lead text-ink-soft">{d.intro}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {d.team.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </ul>

          <div className="mt-[clamp(1.75rem,6vh,3.5rem)] grid gap-6 border-t border-line pt-6 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div>
              <Label>{`${d.shift.beforeLabel} · ${d.shift.beforeNote}`}</Label>
              <p className="mt-2 text-body text-muted">{d.shift.before.join(' · ')}</p>
            </div>
            <span aria-hidden className="hidden pb-1 text-faint sm:block">
              →
            </span>
            <div>
              <Label tone="blue">{d.shift.nowLabel}</Label>
              <p className="mt-1 text-heading font-semibold tracking-[-0.02em] whitespace-nowrap text-blue">{d.shift.now}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          {d.image && <Figure src={d.image} alt="NEUS" className="mb-8" />}
          <ol>
            {d.flow.map((f, i) => (
              <li key={f.label}>
                {i > 0 && <ArrowDown aria-hidden className="my-2 ml-1 size-4 text-faint" />}
                <div className="grid grid-cols-[2.5rem_1fr] items-baseline border-t border-line pt-3">
                  <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
                  <div>
                    <p className="text-heading font-semibold tracking-[-0.02em] text-ink">{f.label}</p>
                    <p className="text-body text-muted">{f.text}</p>
                    {f.detail && <p className="mt-1 text-body text-ink-soft">{f.detail}</p>}
                  </div>
                </div>
              </li>
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

      <p className="mt-[clamp(1.75rem,6vh,3.5rem)] max-w-[40em] border-l-2 border-sky pl-6 text-lead font-semibold tracking-[-0.01em] text-ink">
        <Em text={d.message} />
      </p>
    </Section>
  )
}
