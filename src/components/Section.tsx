import type { ReactNode } from 'react'
import { sections, type SectionId } from '../data/sections'
import { pad } from '../lib/util'

type Props = { id: SectionId; children: ReactNode; center?: boolean }

/**
 * 한 화면 = 한 섹션. 위쪽에 잡지식 running head(번호 · 제목)를 단다.
 * 본문은 위에서부터 같은 높이에 시작해 슬라이드를 넘겨도 제목 위치가 흔들리지 않는다 (표지·마무리만 center).
 */
export function Section({ id, children, center = false }: Props) {
  const index = sections.findIndex((s) => s.id === id)
  const { head, aside } = sections[index]
  return (
    <section
      id={id}
      data-section
      tabIndex={-1}
      aria-label={head}
      className="flex min-h-svh flex-col px-gutter pt-[clamp(1rem,3.2vh,2.5rem)] pb-[clamp(4.75rem,10vh,6.5rem)]"
    >
      <header className="mx-auto flex w-full max-w-page items-baseline justify-between gap-6 border-b border-line pb-3 font-mono text-note tracking-[0.12em] text-muted uppercase">
        <p>
          <span className="text-blue-deep">{pad(index + 1)}</span>
          <span className="mx-3 text-faint">/</span>
          {head}
        </p>
        {aside && <p className="hidden text-right sm:block">{aside}</p>}
      </header>
      <div
        className={`mx-auto flex w-full max-w-page flex-1 flex-col pt-[clamp(1.25rem,18vh_-_6.5rem,6rem)] ${center ? 'justify-center' : ''}`}
      >
        {children}
      </div>
    </section>
  )
}
