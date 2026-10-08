import { motion, useMotionValue } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

/**
 * hover하면 포인터를 따라다니는 부드러운 빛(radial) + 살짝 떠오르는 카드.
 * hover는 움직이지 않는 바깥 div가 받는다 → 떠오른 카드 가장자리에서 깜빡이지 않는다.
 * 빛 · 그림자는 transform/opacity만 움직인다. className = 카드 테두리 · 배경 · 여백 (모서리는 6px 고정).
 */
export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }
  return (
    <div className="group relative h-full">
      <span
        aria-hidden
        className="absolute inset-0 rounded-[6px] opacity-0 shadow-[0_22px_40px_-22px_rgba(23,35,49,0.35)] transition-[opacity,translate] duration-300 group-hover:opacity-100 motion-safe:group-hover:-translate-y-1"
      />
      <div
        onPointerMove={move}
        className={`relative h-full overflow-hidden rounded-[6px] transition-[translate,border-color] duration-300 motion-safe:group-hover:-translate-y-1 ${className}`}
      >
        <motion.span
          aria-hidden
          style={{ x, y }}
          className="pointer-events-none absolute top-0 left-0 size-[26rem] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-sky-pale),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}
