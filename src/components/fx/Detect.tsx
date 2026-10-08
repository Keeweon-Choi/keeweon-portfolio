import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { ease } from '../../lib/util'

const corners = [
  ['-top-2 -left-2 border-t-2 border-l-2', -1, -1],
  ['-top-2 -right-2 border-t-2 border-r-2', 1, -1],
  ['-bottom-2 -left-2 border-b-2 border-l-2', -1, 1],
  ['-bottom-2 -right-2 border-b-2 border-r-2', 1, 1],
] as const

/**
 * 핵심 수치 강조 (샘플 D): 화면에 들어오면 탐지 박스처럼 네 모서리가 대상을 조이며 잡고, label이 있으면 클래스 태그가 붙는다.
 * delay는 숫자가 다 세어진 뒤에 잡히도록 맞춘다. 모션 감소면 처음부터 잡힌 상태.
 */
export function Detect({ children, label, delay = 0 }: { children: ReactNode; label?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className="relative inline-block"
      initial={reduce ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, amount: 0.8 }}
    >
      {children}
      {corners.map(([pos, dx, dy]) => (
        <motion.span
          key={pos}
          aria-hidden
          className={`pointer-events-none absolute size-3 border-blue ${pos}`}
          variants={{ hidden: { opacity: 0, x: dx * 10, y: dy * 10 }, shown: { opacity: 1, x: 0, y: 0 } }}
          transition={{ duration: 0.5, ease, delay }}
        />
      ))}
      {label && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -top-2 left-2 -translate-y-full rounded-[2px] bg-blue px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-[0.04em] whitespace-nowrap text-white"
          variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
          transition={{ duration: 0.3, delay: delay + 0.35 }}
        >
          {label}
        </motion.span>
      )}
    </motion.span>
  )
}
