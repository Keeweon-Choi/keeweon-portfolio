import { motion, type MotionValue } from 'motion/react'
import { flow, flowAt, flowSeconds, useCycle } from './loop'

type Props = { t: MotionValue<number>; i: number; n: number }

/**
 * 커넥터(i → i+1번째 노드)를 지나가는 빛. 부모는 relative.
 * className으로 트랙을 앞 · 뒤 노드 가장자리까지 늘린다(예: '-inset-x-2' = gap-2).
 * 트랙 밖은 잘리므로 빛이 앞 노드에서 나와 다음 노드로 들어가는 것처럼 보인다.
 */
export function Beam({ t, i, n, className = '' }: Props & { className?: string }) {
  const c = flowSeconds(n)
  const s = (flowAt(i) + flow.dwell) / c
  const e = flowAt(i + 1) / c
  const fade = (e - s) * 0.18
  const x = useCycle(t, [s, e], ['0%', '100%'])
  const opacity = useCycle(t, [s, s + fade, e - fade, e], [0, 1, 1, 0])
  return (
    <span aria-hidden className={`pointer-events-none absolute overflow-hidden ${className}`}>
      <motion.span className="absolute inset-0" style={{ x, opacity }}>
        <span className="absolute top-1/2 left-0 h-0.5 w-5 -translate-x-full -translate-y-1/2 rounded-full bg-linear-to-r from-transparent to-blue" />
        <span className="absolute top-1/2 left-0 size-2 -translate-1/2 rounded-full bg-blue shadow-[0_0_8px_3px_var(--color-sky)]" />
      </motion.span>
    </span>
  )
}

/** 빛이 i번째 노드에 닿아 있는 동안 테두리가 밝아진다 (마지막 노드는 조금 더 오래). 부모: relative + rounded */
export function Arrive({ t, i, n }: Props) {
  const c = flowSeconds(n)
  const a = flowAt(i)
  const hold = flow.dwell + (i === n - 1 ? 0.5 : 0)
  const opacity = useCycle(t, [(a - 0.12) / c, a / c, (a + hold) / c, (a + hold + 0.45) / c], [0, 1, 1, 0])
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute -inset-px rounded-[inherit] border border-blue shadow-[0_0_0_3px_rgba(142,201,232,0.45)]"
    />
  )
}
