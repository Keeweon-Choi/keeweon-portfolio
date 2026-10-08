import { useEffect, useLayoutEffect, useState } from 'react'
import { chapters, stops, type ChapterId } from '../data/sections'

// 페이지는 평범하게 스크롤된다(휠 hijacking 없음). 여기서는
// ① 지금 읽는 챕터 추적(상단 메뉴 표시 + URL hash), ② ←/→ 키로 챕터 단위 이동만 한다.

const HEADER = 56 // sticky header 높이 = 챕터의 scroll-margin-top
const top = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? 0
const behavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

/** 화면 위 35% 선을 넘어선 마지막 챕터. 표지에 있으면 null */
function current(): ChapterId | null {
  const line = window.innerHeight * 0.35
  let id: ChapterId | null = null
  for (const c of chapters) if (top(c.id) <= line) id = c.id
  return id
}

export function useChapters() {
  const [active, setActive] = useState<ChapterId | null>(null)

  // 직접 링크(#smart-glass)·새로고침 → 해당 챕터에서 시작
  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    const id = decodeURIComponent(location.hash.slice(1))
    const el = id && document.getElementById(id)
    if (!el) return
    // CSS의 smooth 스크롤이 첫 진입까지 애니메이션하지 않도록 instant
    el.scrollIntoView({ block: 'start', behavior: 'instant' })
    document.fonts?.ready.then(() => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
  }, [])

  useEffect(() => {
    let raf = 0
    const sync = () => {
      raf = 0
      setActive(current())
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(sync)
    }
    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 읽고 있는 챕터를 URL hash에 남긴다 (새로고침해도 같은 챕터)
  useEffect(() => {
    const hash = active ? `#${active}` : ''
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search)
  }, [active])

  // ←/→ : 이전/다음 챕터 (Space·PageDown·휠은 브라우저 기본 스크롤 그대로)
  useEffect(() => {
    let pending = { i: -1, until: 0 } // smooth scroll 도중 연타해도 한 칸씩
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.isComposing) return
      // 비교 슬라이더(range) 등 입력 요소에서는 화살표가 원래 동작을 한다
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      if (e.repeat) return
      const dir = e.key === 'ArrowRight' ? 1 : -1
      let i: number
      if (performance.now() < pending.until) i = pending.i + dir
      else {
        const tops = stops.map(top)
        i = dir > 0 ? tops.findIndex((t) => t > HEADER + 8) : tops.findLastIndex((t) => t < HEADER - 8)
      }
      if (i < 0 || i >= stops.length) return
      pending = { i, until: performance.now() + 900 }
      document.getElementById(stops[i])?.scrollIntoView({ behavior: behavior(), block: 'start' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return active
}
