import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { asset } from '../lib/util'

/** 짧은 시연 영상 반복. 보이는 동안만 재생 (모션 감소면 포스터 한 장) */
export function Clip({ src, poster, alt, fit = 'object-cover' }: { src: string; poster: string; alt: string; fit?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const visible = useInView(ref, { amount: 0.4 })
  const reduce = useReducedMotion()
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (visible && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [visible, reduce])
  return (
    <video
      ref={ref}
      src={asset(src)}
      poster={asset(poster)}
      muted
      loop
      playsInline
      preload="auto"
      aria-label={alt}
      className={`block aspect-video w-full bg-ink ${fit}`}
    />
  )
}
