import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'

const spring = { stiffness: 200, damping: 20, mass: 0.5 }

/**
 * 마우스 위치를 따라 살짝 기운다 (최대 max도, 원근 포함 · 포인터 쪽이 눌리듯 들어간다). 벗어나면 제자리로.
 * 포인터 쪽은 유리에 빛이 비친 듯 은은하게 밝아진다 (샘플 A의 glare).
 * 포인터 좌표는 기울지 않는 바깥 div에서 읽어 떨림이 없다. 터치 · 모션 감소에서는 동작하지 않는다.
 */
export function Tilt({ children, max = 4, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const reduce = useReducedMotion()
  const rotateX = useSpring(0, spring)
  const rotateY = useSpring(0, spring)
  const glare = useRef<HTMLSpanElement>(null)
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotateY.set((px - 0.5) * 2 * max)
    rotateX.set(-(py - 0.5) * 2 * max)
    const g = glare.current
    if (g) {
      g.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.5), transparent 55%)`
      g.style.opacity = '1'
    }
  }
  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
    if (glare.current) glare.current.style.opacity = '0'
  }
  return (
    <div onPointerMove={move} onPointerLeave={reset}>
      <motion.div className={`relative ${className}`} style={{ rotateX, rotateY, transformPerspective: 900 }}>
        {children}
        <span
          ref={glare}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300"
        />
      </motion.div>
    </div>
  )
}
