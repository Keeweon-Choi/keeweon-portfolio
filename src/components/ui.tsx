import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tone } from '../data/projects'
import { asset } from '../lib/util'

const toneText: Record<Tone, string> = { muted: 'text-muted', blue: 'text-blue-deep', warn: 'text-warn' }

// mono 폰트는 공백이 고정폭이라 한국어가 듬성듬성해 보인다 → 한글 라벨은 sans로
const hasHangul = (v: ReactNode) => typeof v === 'string' && /[가-힣]/.test(v)
const labelFont = (v: ReactNode) => (hasHangul(v) ? 'font-medium tracking-[0.02em]' : 'font-mono tracking-[0.1em] uppercase')

/** 데이터 문자열의 *강조* 구간을 파란색으로. 짧은 강조구는 중간에서 줄바꿈하지 않는다 ("Real-|time" 방지) */
export function Em({ text }: { text: string }) {
  return text.split('*').map((part, i) =>
    i % 2 ? (
      <em key={i} className={`text-blue not-italic ${part.length <= 16 ? 'whitespace-nowrap' : ''}`}>
        {part}
      </em>
    ) : (
      part
    ),
  )
}

/** 작은 라벨: 영문은 mono uppercase (PROBLEM …), 한글은 sans */
export function Label({ children, tone = 'muted', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <p className={`text-note ${labelFont(children)} ${toneText[tone]} ${className}`}>{children}</p>
}

export function Title({ text, className = '' }: { text: string; className?: string }) {
  return (
    <h2 className={`text-title font-bold tracking-[-0.035em] text-ink ${className}`}>
      <Em text={text} />
    </h2>
  )
}

export function Tag({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  const style = tone === 'blue' ? 'border-blue/40 text-blue-deep bg-surface' : 'border-line-strong text-ink-soft'
  return <li className={`rounded-full border px-3 py-1 text-note whitespace-nowrap ${style}`}>{children}</li>
}

/** 발표 중엔 접어두는 기술 상세 (모델명 · 프레임워크) */
export function TechDetail({ items, label = '기술 상세', className = '' }: { items: string[]; label?: string; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="inline-flex items-center gap-2 rounded-sm text-note text-muted transition-colors hover:text-ink">
        <Plus aria-hidden className="size-3.5 transition-transform group-open:rotate-45" />
        {label}
      </summary>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {items.map((t) => (
          <li key={t} className="rounded-sm border border-line bg-surface px-2 py-0.5 font-mono text-note text-ink-soft">
            {t}
          </li>
        ))}
      </ul>
    </details>
  )
}

/** 이미지 + mono 캡션. src는 public/ 기준 경로 */
export function Figure({
  src,
  alt,
  caption,
  className = '',
  imgClassName = '',
}: {
  src: string
  alt: string
  caption?: string
  className?: string
  imgClassName?: string
}) {
  return (
    <figure className={className}>
      <img src={asset(src)} alt={alt} className={`block w-full rounded-[3px] bg-line object-cover ${imgClassName}`} />
      {caption && <figcaption className={`mt-2 text-note text-muted ${hasHangul(caption) ? '' : 'font-mono'}`}>{caption}</figcaption>}
    </figure>
  )
}
