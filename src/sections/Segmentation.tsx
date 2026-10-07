import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Section } from '../components/Section'
import { Em, Label, Tag, TechDetail, Title } from '../components/ui'
import { segmentation as d } from '../data/projects'
import { asset } from '../lib/util'

export function Segmentation() {
  const [det, seg] = d.compare
  return (
    <Section id="segmentation">
      <div className="grid gap-x-16 gap-y-4 lg:grid-cols-12 lg:items-end">
        <Title text={d.title} className="lg:col-span-7" />
        <p className="text-lead text-ink-soft lg:col-span-5">{d.summary}</p>
      </div>

      <div className="mt-[clamp(1.25rem,4.5vh,3rem)] grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* 같은 사진: box vs pixel. 화살표는 이미지 높이 가운데 */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-3 sm:gap-x-5">
            <Shot item={det} />
            <span aria-hidden className="grid size-8 place-items-center rounded-full border border-line-strong bg-canvas text-muted">
              <ArrowRight className="size-4" />
            </span>
            <Shot item={seg} />
            <Caption item={det} />
            <span />
            <Caption item={seg} />
          </div>
          <p className="mt-3 font-mono text-[11px] text-faint">{d.credit}</p>
        </div>

        <div className="space-y-[clamp(0.875rem,2.6vh,1.75rem)] lg:col-span-5">
          <Block label="Problem">{d.problem}</Block>
          <Block label="What I did">
            {d.did}
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {d.criteria.map((c) => (
                <Tag key={c} tone="blue">
                  {c}
                </Tag>
              ))}
            </ul>
            <TechDetail items={d.models} label="비교한 구조" className="mt-3" />
          </Block>
          <Block label="Result">{d.result}</Block>
          <div className="border-l-2 border-sky pl-5">
            <Label>What I learned</Label>
            <p className="mt-1.5 text-lead font-semibold tracking-[-0.01em] text-ink">
              <Em text={d.lesson} />
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

type Item = (typeof d.compare)[number]

function Shot({ item }: { item: Item }) {
  return <img src={asset(item.src)} alt={item.alt} className="aspect-[8/7] max-h-[36vh] w-full rounded-[3px] bg-line object-cover" />
}

function Caption({ item }: { item: Item }) {
  return (
    <div className="self-start">
      <p className="text-note font-medium text-muted">{item.unit}</p>
      <p className="mt-0.5 text-heading font-semibold tracking-[-0.02em] text-ink">{item.name}</p>
      <p className="mt-0.5 text-lead text-ink-soft">“{item.question}”</p>
    </div>
  )
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 text-body text-ink-soft">{children}</div>
    </div>
  )
}
