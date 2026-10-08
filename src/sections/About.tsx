import { motion } from 'motion/react'
import { Chapter } from '../components/Chapter'
import { Reveal } from '../components/motion'
import { profile } from '../data/profile'
import { asset, ease } from '../lib/util'

// 카메라 뷰파인더 모서리: 사진이 화면에 들어오면 바깥에서 모서리로 모인다
const corners = [
  'top-0 left-0 border-t-2 border-l-2 origin-top-left',
  'top-0 right-0 border-t-2 border-r-2 origin-top-right',
  'bottom-0 left-0 border-b-2 border-l-2 origin-bottom-left',
  'bottom-0 right-0 border-b-2 border-r-2 origin-bottom-right',
]

export function About() {
  return (
    <Chapter id="about" tone="surface">
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <figure className="mx-auto w-[min(100%,22rem)] lg:mx-0">
            <div className="relative p-3">
              <img
                src={asset(profile.photo)}
                alt={`${profile.nameKo} 프로필 사진`}
                className="aspect-[3/4] w-full rounded-[3px] bg-sky-pale object-cover"
              />
              {corners.map((c) => (
                <motion.span
                  key={c}
                  aria-hidden
                  className={`absolute size-7 border-blue ${c}`}
                  initial={{ opacity: 0, scale: 1.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.8, ease, delay: 0.2 }}
                />
              ))}
            </div>
            <figcaption className="mt-1 flex justify-between px-3 font-mono text-note text-muted">
              <span>{profile.nameEn}</span>
              <span className="text-faint">CV · Edge AI</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-8">
          <Reveal>
            <p className="max-w-[34em] text-node leading-relaxed font-medium tracking-[-0.015em] text-ink">
              {profile.intro}
            </p>
          </Reveal>

          <dl className="mt-[clamp(2rem,6vh,3.5rem)] border-t border-line-strong">
            {profile.facts.map((f, i) => (
              <Reveal
                key={f.label}
                delay={i * 0.06}
                y={12}
                className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-6 border-b border-line py-[clamp(0.85rem,2vh,1.25rem)] sm:grid-cols-[7rem_1fr]"
              >
                <dt className="text-note font-medium tracking-[0.02em] text-muted">{f.label}</dt>
                <dd>
                  <span className="text-lead font-semibold text-ink">{f.value}</span>
                  {f.note && <span className="mt-0.5 block text-body text-muted">{f.note}</span>}
                </dd>
              </Reveal>
            ))}
          </dl>

          {/* 취미 사진: 같은 크기로 나란히 */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            {profile.hobbyPhotos.map((h, i) => (
              <Reveal key={h.src} delay={0.15 + i * 0.12}>
                <figure className="group overflow-hidden rounded-[4px] border border-line bg-surface">
                  <div className="overflow-hidden">
                    <img
                      src={asset(h.src)}
                      alt={h.alt}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <figcaption className="border-t border-line bg-canvas px-3 py-2 text-note font-medium text-muted">
                    취미 · {h.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Chapter>
  )
}
