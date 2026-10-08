const keywords = [
  'Computer Vision',
  'Edge AI',
  'Semantic Segmentation',
  'Real-time AI Systems',
  'Perception',
  'NLP / LLM',
  'Robotics',
  'Physical AI',
]

function KeywordLine({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center gap-[clamp(1rem,2.5vw,2.5rem)] pr-[clamp(1rem,2.5vw,2.5rem)]">
      {keywords.map((keyword, i) => (
        <span key={keyword} className="flex items-center gap-[clamp(1rem,2.5vw,2.5rem)] whitespace-nowrap">
          <span
            className={`text-[clamp(2rem,5vw,5rem)] leading-none font-bold tracking-[-0.055em] ${
              i % 2 === 0
                ? 'text-blue-deep'
                : 'text-transparent [-webkit-text-stroke:1.25px_var(--color-blue)]'
            }`}
          >
            {keyword}
          </span>
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-sky" />
        </span>
      ))}
    </div>
  )
}

/** 관심 분야를 한 줄로 이어 보여주는 밴드. CSS reduced-motion에서 정지한다. */
export function Marquee() {
  return (
    <section aria-label="관심 분야" className="marquee overflow-hidden border-y border-line bg-surface py-[clamp(1.25rem,3.5vh,2.5rem)]">
      <p className="sr-only">{keywords.join(' · ')}</p>
      <div aria-hidden className="marquee-track flex w-max">
        <KeywordLine hidden />
        <KeywordLine hidden />
      </div>
    </section>
  )
}
