import { Section } from '../components/Section'
import { profile } from '../data/profile'
import { asset } from '../lib/util'

export function Hero() {
  return (
    <Section id="about" center>
      <div className="grid items-end gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="flex items-center gap-3 text-lead text-ink-soft">
            <img src={asset(profile.emblem)} alt="" className="size-[1.75em]" />
            {profile.affiliation}
          </p>
          <h1 className="mt-[clamp(1rem,3vh,2rem)] text-display font-bold tracking-[-0.045em]">
            {profile.nameKo}
            <span className="mt-[0.18em] block text-title font-light tracking-[-0.02em] text-muted">{profile.nameEn}</span>
          </h1>
          <ul className="mt-[clamp(1.25rem,4vh,2.5rem)] flex flex-wrap gap-2">
            {profile.keywords.map((k) => (
              <li key={k} className="rounded-full border border-blue/40 bg-surface px-4 py-1.5 text-body font-medium text-blue-deep">
                {k}
              </li>
            ))}
          </ul>
          <p className="mt-[clamp(1.5rem,5vh,3rem)] max-w-[36em] text-lead text-ink">{profile.intro}</p>
          <p className="mt-4 flex max-w-[40em] gap-3 text-body text-muted">
            <span aria-hidden className="mt-[0.8em] h-px w-6 shrink-0 bg-line-strong" />
            {profile.trait}
          </p>
        </div>

        <figure className="w-[min(100%,20rem)] lg:col-span-4 lg:ml-auto lg:w-[min(100%,calc(46vh*0.75))]">
          <img
            src={asset(profile.photo)}
            alt={`${profile.nameKo} 프로필 사진`}
            className="aspect-[3/4] w-full rounded-[3px] bg-sky-pale object-cover"
          />
          <figcaption className="mt-4 border-t border-line pt-3 font-mono text-note text-muted">
            <span className="text-faint">off-duty — </span>
            {profile.hobbies}
          </figcaption>
        </figure>
      </div>
    </Section>
  )
}
