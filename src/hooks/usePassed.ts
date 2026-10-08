import { useEffect, useState, type RefObject } from 'react'

/** 요소의 윗변이 화면 높이의 ratio 지점을 지났는지 (스크롤 진행에 따라 켜지고, 되돌리면 꺼진다) */
export function usePassed(ref: RefObject<HTMLElement | null>, ratio = 0.55) {
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setPassed(el.getBoundingClientRect().top < window.innerHeight * ratio)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, ratio])
  return passed
}
