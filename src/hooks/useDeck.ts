import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { sections, type SectionId } from '../data/sections'

// 발표 모드: 페이지는 평범하게 스크롤되고(휠 hijacking 없음), 키/버튼은 섹션 단위로 이동한다.

const ids = sections.map((s) => s.id)
const last = ids.length - 1
const stepCount = (i: number) => sections[i].steps ?? 1
const node = (i: number) => document.getElementById(ids[i])
const topOf = (i: number) => node(i)?.getBoundingClientRect().top ?? 0

/** 화면 위 40% 선을 넘어선 마지막 섹션 = 현재 섹션 */
function indexFromScroll() {
  const line = window.innerHeight * 0.4
  let index = 0
  for (let i = 0; i <= last; i++) if (topOf(i) <= line) index = i
  return index
}

const indexFromHash = () => Math.max(0, ids.indexOf(decodeURIComponent(location.hash.slice(1)) as SectionId))

const behavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export function useDeck() {
  const [active, setActive] = useState(indexFromHash)
  const [steps, setSteps] = useState<Partial<Record<SectionId, number>>>({})
  const stepsRef = useRef(steps)
  // smooth scroll 도중 연타해도 목표 섹션 기준으로 한 칸씩 움직이도록 기억해 둔다
  const target = useRef<number | null>(null)
  const release = useRef(0)

  const releaseTarget = useCallback(() => {
    target.current = null
    setActive(indexFromScroll())
  }, [])

  const setStep = useCallback((id: SectionId, step: number) => {
    stepsRef.current = { ...stepsRef.current, [id]: step }
    setSteps(stepsRef.current)
  }, [])

  const goTo = useCallback(
    (i: number, step?: number) => {
      i = Math.min(last, Math.max(0, i))
      const el = node(i)
      if (!el) return
      if (step !== undefined) setStep(ids[i], step)
      target.current = i
      // 보통은 scrollend가 먼저 풀어준다. 이 타이머는 scrollend가 없는 브라우저 / 스크롤이 없었던 경우용
      window.clearTimeout(release.current)
      release.current = window.setTimeout(releaseTarget, 1800)
      setActive(i)
      el.scrollIntoView({ behavior: behavior(), block: 'start' })
      // 지나온 섹션의 버튼에 focus가 남아 있으면 이후 Space가 그 버튼을 누르게 되므로 focus를 옮긴다
      const focused = document.activeElement
      if (focused?.closest('[data-section]') && !el.contains(focused)) el.focus({ preventScroll: true })
    },
    [setStep, releaseTarget],
  )

  const goToId = useCallback((id: SectionId) => goTo(ids.indexOf(id), 0), [goTo])

  const next = useCallback(() => {
    const i = target.current ?? indexFromScroll()
    // 휠로 섹션이 눈에 띄게 덜 올라와 있으면 먼저 화면에 맞춘다
    if (target.current === null && topOf(i) > window.innerHeight * 0.08) return goTo(i)
    const step = stepsRef.current[ids[i]] ?? 0
    if (step < stepCount(i) - 1) return setStep(ids[i], step + 1)
    if (i < last) goTo(i + 1, 0)
  }, [goTo, setStep])

  const prev = useCallback(() => {
    const i = target.current ?? indexFromScroll()
    const step = stepsRef.current[ids[i]] ?? 0
    if (step > 0) return setStep(ids[i], step - 1)
    if (i > 0) goTo(i - 1, stepCount(i - 1) - 1) // 뒤로 들어가면 그 섹션의 마지막 단계부터
    else goTo(0)
  }, [goTo, setStep])

  // 새로고침 · 직접 링크(#smart-glass 등) → 해당 섹션에서 시작
  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    const i = indexFromHash()
    if (i === 0) return
    const jump = () => node(i)?.scrollIntoView({ block: 'start' })
    jump()
    document.fonts?.ready.then(() => {
      if (target.current === null && indexFromScroll() === i) jump()
    })
  }, [])

  // 휠/터치 스크롤 → 현재 섹션 표시 갱신
  useEffect(() => {
    let raf = 0
    const sync = () => {
      raf = 0
      if (target.current === null) setActive(indexFromScroll())
    }
    const onScroll = () => {
      raf ||= requestAnimationFrame(sync)
    }
    const onScrollEnd = () => {
      const i = target.current
      if (i === null) return
      // 스크롤 도중 레이아웃이 바뀌었으면(패널 열림 등) 끝에서 한 번 더 맞춘다
      if (Math.abs(topOf(i)) > 2) node(i)?.scrollIntoView({ block: 'start' })
      window.clearTimeout(release.current)
      releaseTarget()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScrollEnd)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [releaseTarget])

  // 현재 섹션을 URL hash에 반영 (새로고침해도 같은 위치)
  useEffect(() => {
    const hash = active === 0 ? '' : `#${ids[active]}`
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search)
  }, [active])

  // 키보드: → / PageDown / Space = 다음, ← / PageUp / Shift+Space = 이전, Home / End
  useEffect(() => {
    let tabbing = false // Tab으로 고른 버튼 위에서는 Space가 원래대로 버튼을 누른다 (접근성)
    const onPointer = () => {
      tabbing = false
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabbing = true
        return
      }
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return
      const el = e.target instanceof HTMLElement ? e.target : null
      if (el?.closest('input, textarea, select, [contenteditable]')) return
      const control = el?.closest<HTMLElement>('button, a, summary')

      let action: () => void
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          action = next
          break
        case 'ArrowLeft':
        case 'PageUp':
          action = prev
          break
        case ' ':
          if (control && tabbing) return
          action = e.shiftKey ? prev : next
          break
        case 'Home':
          action = () => goTo(0)
          break
        case 'End':
          action = () => goTo(last)
          break
        default:
          return
      }
      e.preventDefault()
      if (e.repeat) return // 키를 누르고 있어도 한 칸씩만
      if (e.key === ' ') control?.blur() // 마우스로 눌렀던 버튼이 keyup 때 다시 눌리지 않도록
      action()
    }
    window.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [next, prev, goTo])

  return { active, steps, setStep, goTo, goToId, next, prev }
}
