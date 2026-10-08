import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ease } from '../lib/util'

/**
 * 화면에 들어올 때 한 번 살짝 떠오르는 블록. 글자 단위가 아니라 블록 단위로만 쓴다.
 * prefers-reduced-motion이면 MotionConfig(reducedMotion="user")가 이동을 끄고 opacity만 남긴다.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  as = 'div',
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  /** 목록 안에서는 'li'로 렌더해 ol > li 구조를 지킨다 */
  as?: 'div' | 'li'
  className?: string
}) {
  const Tag = as === 'li' ? motion.li : motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </Tag>
  )
}

/** 화면에 들어오면 from → to로 세는 숫자 */
export function CountUp({
  from,
  to,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  from: number
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(from, to, { duration: 1.3, ease: 'easeOut', onUpdate: setValue })
    return () => controls.stop()
  }, [inView, reduce, from, to])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(reduce ? to : value).toFixed(decimals)}
      {suffix}
    </span>
  )
}
