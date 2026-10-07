import { Section } from '../components/Section'
import { closing, profile } from '../data/profile'

export function Thanks() {
  return (
    <Section id="thanks" center>
      <div className="grid gap-y-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="font-mono text-note tracking-[0.12em] text-muted uppercase">{closing.en}</p>
          <h2 className="mt-4 text-display font-bold tracking-[-0.045em] text-ink">{closing.title}</h2>
          <p className="mt-[clamp(1rem,3vh,2rem)] text-lead text-ink-soft">{closing.note}</p>
        </div>
        <div className="border-t border-line pt-4 text-note text-muted lg:col-span-4">
          <p className="text-ink">
            {profile.nameKo} · {profile.nameEn}
          </p>
          <p className="mt-1">{profile.keywords.join(' · ')}</p>
        </div>
      </div>
    </Section>
  )
}
