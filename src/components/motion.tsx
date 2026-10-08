import { animate, motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { ease } from '../lib/util'
import { Em } from './ui'

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

const word: Variants = {
  hidden: { opacity: 0.12, filter: 'blur(6px)' },
  shown: (i: number) => ({
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, delay: 0.15 + i * 0.045, ease: 'easeOut' },
  }),
}

/**
 * 핵심 문장 전용: 화면에 들어오면 단어가 앞에서부터 차례로 또렷해진다 (샘플 C의 text generate).
 * *강조*는 Em과 같은 파란색. 모션 감소면 그냥 글자로.
 */
export function Words({ text }: { text: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <Em text={text} />
  let n = 0
  const words = (part: string) =>
    part.split(/(\s+)/).map((w, i) =>
      /^\s*$/.test(w) ? (
        w
      ) : (
        <motion.span key={i} className="inline-block" variants={word} custom={n++}>
          {w}
        </motion.span>
      ),
    )
  return (
    <motion.span initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.6 }}>
      {text.split('*').map((part, i) =>
        i % 2 ? (
          <em key={i} className={`text-blue not-italic ${part.length <= 16 ? 'whitespace-nowrap' : ''}`}>
            {words(part)}
          </em>
        ) : (
          <Fragment key={i}>{words(part)}</Fragment>
        ),
      )}
    </motion.span>
  )
}
