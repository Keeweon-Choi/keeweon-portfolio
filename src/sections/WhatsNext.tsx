import { ArrowRight } from 'lucide-react'
import { Section } from '../components/Section'
import { Label, Title } from '../components/ui'
import { future as d } from '../data/profile'
import { pad } from '../lib/util'

export function WhatsNext() {
  const sofar = d.flow.filter((f) => !f.next)
  const ahead = d.flow.filter((f) => f.next)
  return (
    <Section id="next">
      <Title text={d.title} />

      <div className="mt-[clamp(1.75rem,6vh,4rem)] grid gap-4 lg:grid-cols-[3fr_auto_1fr] lg:items-start">
        <div>
          <ol className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {sofar.map((f, i) => (
              <li key={f.label} className="contents">
                {i > 0 && <ArrowRight aria-hidden className="mx-auto hidden size-4 text-faint sm:block" />}
                <span className="rounded-[3px] border border-line bg-surface px-4 py-3 text-body font-semibold text-ink">{f.label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-line-strong pt-2 text-note font-medium text-muted">{d.sofar}</p>
        </div>
        <ArrowRight aria-hidden className="mx-auto mt-3.5 hidden size-5 text-blue lg:block" />
        <div>
          {ahead.map((f) => (
            <span
              key={f.label}
              className="block rounded-[3px] border border-dashed border-blue bg-sky-wash px-4 py-3 text-body font-semibold text-blue-deep"
            >
              {f.label}
            </span>
          ))}
          <p className="mt-3 border-t border-blue pt-2 text-note font-medium text-blue-deep">
            {d.ahead} — <span className="text-muted">{d.aheadNote}</span>
          </p>
        </div>
      </div>

      <Label className="mt-[clamp(1.75rem,6vh,4rem)]">{d.interestsLabel}</Label>
      <ol className="mt-4 grid gap-x-10 gap-y-6 md:grid-cols-3">
        {d.interests.map((it, i) => (
          <li key={it.title} className="border-t border-line-strong pt-4">
            <span className="font-mono text-note text-blue-deep">{pad(i + 1)}</span>
            <p className="mt-2 text-heading font-semibold tracking-[-0.02em] text-ink">{it.title}</p>
            <p className="mt-1.5 text-body text-muted">{it.text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-[clamp(1.75rem,5vh,3rem)] max-w-[46em] text-lead text-ink-soft">{d.statement}</p>
    </Section>
  )
}
