import { Armchair, ArrowRight, BellRing, Bus, CreditCard, DoorOpen } from 'lucide-react'
import { Section } from '../components/Section'
import { Figure, Label, Title } from '../components/ui'
import { smartGlass as d } from '../data/projects'

const icons = { bus: Bus, door: DoorOpen, card: CreditCard, seat: Armchair, bell: BellRing }

export function SmartGlass() {
  return (
    <Section id="smart-glass">
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Title text={d.title} />
          <p className="mt-[clamp(0.75rem,2.5vh,1.5rem)] text-lead text-ink-soft">{d.goal}</p>

          <Label className="mt-[clamp(1.25rem,5vh,3rem)]">{d.usageLabel}</Label>
          <ol className="relative mt-3 grid grid-cols-5 gap-2">
            <span aria-hidden className="absolute top-[1.375rem] right-[10%] left-[10%] border-t border-dashed border-line-strong" />
            {d.usage.map((u) => {
              const Icon = icons[u.icon]
              return (
                <li key={u.label} className="relative flex flex-col items-center text-center">
                  <span className="grid size-11 place-items-center rounded-full border border-line-strong bg-canvas text-blue">
                    <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                  </span>
                  <span className="mt-2.5 text-body font-semibold text-ink">{u.label}</span>
                  <span className="font-mono text-note text-muted short:hidden">{u.en}</span>
                </li>
              )
            })}
          </ol>

          <Label className="mt-[clamp(1.25rem,5vh,3rem)]">{d.systemLabel}</Label>
          <ol className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-stretch">
            {d.system.map((s, i) => (
              <li key={s.label} className="contents">
                {i > 0 && (
                  <span aria-hidden className="hidden place-items-center text-faint sm:grid">
                    <ArrowRight className="size-4" />
                  </span>
                )}
                <span className="rounded-[3px] border border-line bg-surface px-3.5 py-3 short:py-2">
                  <span className="block text-note font-medium text-muted">{s.stage}</span>
                  <span className="mt-0.5 block text-body leading-snug font-semibold text-ink">{s.label}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-3 border-t-2 border-blue pt-3">
            <p className="text-body text-ink">
              <span className="mr-3 font-mono text-note tracking-[0.1em] text-blue-deep uppercase">My Role</span>
              <span className="font-semibold">{d.role}</span>
            </p>
            <p className="mt-1 text-note text-muted">{d.roleItems.join(' · ')}</p>
            <p className="mt-1 text-note text-faint">※ {d.roleNote}</p>
          </div>
        </div>

        {/* 착용 사진(세로) + 하드웨어 클로즈업(가로)을 겹치지 않게 비대칭 배치 */}
        <div className="grid grid-cols-[2fr_3fr] items-end gap-3 lg:col-span-5">
          <Figure {...d.photos.hardware} imgClassName="aspect-[4/3]" />
          <Figure {...d.photos.worn} imgClassName="aspect-[777/1143] max-h-[58vh]" />
        </div>
      </div>
    </Section>
  )
}
