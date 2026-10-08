import { ArrowUp } from 'lucide-react'
import { Reveal } from '../components/motion'
import { closing, profile } from '../data/profile'

export function Closing() {
  return (
    <section id="thanks" aria-label={closing.en} className="scroll-mt-14 bg-blue-deep px-gutter text-white">
      <div className="mx-auto max-w-page py-[clamp(5rem,16vh,10rem)]">
        <div className="grid items-end gap-x-16 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <p className="font-mono text-note tracking-[0.14em] text-white/80 uppercase">{closing.en}</p>
            <h2 className="mt-4 text-display font-bold tracking-[-0.045em]">{closing.title}</h2>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-4">
            <a
              href="#contents"
              className="group inline-flex items-center gap-2 rounded-full border border-white/50 px-5 py-2.5 text-body font-medium transition-colors hover:bg-white hover:text-blue-deep"
            >
              <ArrowUp aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5" />
              목차로 돌아가기
            </a>
          </Reveal>
        </div>
        <footer className="mt-[clamp(4rem,12vh,7rem)] flex flex-wrap justify-between gap-4 border-t border-white/25 pt-5 text-note text-white/80">
          <p>
            {profile.nameKo} · {profile.nameEn}
          </p>
          <p>{profile.keywords.join(' · ')}</p>
        </footer>
      </div>
    </section>
  )
}
