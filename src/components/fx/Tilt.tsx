import { motion, useReducedMotion, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

const spring = { stiffness: 200, damping: 20, mass: 0.5 }

/**
 * 마우스 위치를 따라 살짝 기운다 (최대 max도, 원근 포함 · 포인터 쪽이 눌리듯 들어간다). 벗어나면 제자리로.
 * 포인터 좌표는 기울지 않는 바깥 div에서 읽어 떨림이 없다. 터치 · 모션 감소에서는 동작하지 않는다.
 */
export function Tilt({ children, max = 4, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const reduce = useReducedMotion()
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max)
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max)
  }
  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
  }
  return (
    <div onPointerMove={move} onPointerLeave={reset}>
      <motion.div className={className} style={{ rotateX, rotateY, transformPerspective: 900 }}>
        {children}
      </motion.div>
    </div>
  )
}
