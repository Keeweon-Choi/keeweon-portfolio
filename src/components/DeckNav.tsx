import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { sections } from '../data/sections'
import { pad } from '../lib/util'

type Props = { active: number; onPrev: () => void; onNext: () => void; onJump: (i: number) => void }

/** 하단의 아주 작은 발표 chrome: 현재 위치 · 진행 표시 · 이전/다음 */
export function DeckNav({ active, onPrev, onNext, onJump }: Props) {
  const last = sections.length - 1
  return (
    <nav
      aria-label="섹션 이동"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-gutter pb-[clamp(0.75rem,2.2vh,1.5rem)]"
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-4">
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-canvas/90 py-1.5 pr-3 pl-4 font-mono text-note text-muted">
          <p className="tabular-nums" aria-live="polite">
            <span className="text-ink">{pad(active + 1)}</span> / {pad(sections.length)}
            <span className="ml-3 hidden text-ink-soft md:inline">{sections[active].label}</span>
          </p>
          <ol className="hidden items-center lg:flex">
            {sections.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  title={s.label}
                  aria-label={`${pad(i + 1)} ${s.label}`}
                  aria-current={i === active ? 'step' : undefined}
                  className="group flex h-6 items-center rounded-sm px-[3px]"
                >
                  <span
                    className={`block h-[3px] rounded-full transition-all duration-300 group-hover:bg-blue/60 ${
                      i === active ? 'w-6 bg-blue' : i < active ? 'w-3 bg-line-strong' : 'w-3 bg-line'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <NavButton label="이전 (←)" onClick={onPrev} disabled={active === 0}>
            <ArrowLeft className="size-4" />
          </NavButton>
          <NavButton label="다음 (→)" onClick={onNext} disabled={active === last}>
            <ArrowRight className="size-4" />
          </NavButton>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full border border-line-strong bg-canvas/90 text-ink-soft transition-colors hover:border-blue hover:text-blue disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  )
}
