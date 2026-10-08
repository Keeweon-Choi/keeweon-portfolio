import {
  cancelFrame,
  frame,
  transform,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type TransformOptions,
} from 'motion/react'
import { useEffect, type RefObject } from 'react'

/** 화면에 보이고 모션 감소 설정이 아닐 때만 true → 반복 효과의 on/off 스위치 */
export function useLive(ref: RefObject<Element | null>, amount = 0.3) {
  const inView = useInView(ref, { amount })
  const reduce = useReducedMotion()
  return inView && !reduce
}

/**
 * live인 동안 흐르는 시계. 값 = 지난 시간 / seconds (한 바퀴마다 1씩 는다).
 * live가 꺼지면(화면 밖 · 모션 감소) 멈추고 0으로 돌아간다. 리렌더 없이 style만 바뀐다.
 */
export function useLoop(live: boolean, seconds: number) {
  const t = useMotionValue(0)
  useEffect(() => {
    if (!live) return
    let start = -1
    const tick = ({ timestamp }: { timestamp: number }) => {
      if (start < 0) start = timestamp
      t.set((timestamp - start) / 1000 / seconds)
    }
    frame.update(tick, true)
    return () => {
      cancelFrame(tick)
      t.set(0)
    }
  }, [live, seconds, t])
  return t
}

/** 시계의 한 바퀴(0–1) 안에서 input → output 보간. 매 바퀴 반복된다 */
export function useCycle<T>(t: MotionValue<number>, input: number[], output: T[], options?: TransformOptions<T>) {
  const f = transform(input, output, options)
  return useTransform(t, (v) => f(v % 1))
}

// 노드 → 노드 흐름 한 바퀴(초): lead 뒤 첫 노드 → 노드마다 dwell 머물고 hop 동안 다음 노드로 → 끝나면 rest
export const flow = { lead: 0.2, dwell: 0.35, hop: 0.55, rest: 1.3 }
export const flowSeconds = (n: number) => flow.lead + (n - 1) * (flow.dwell + flow.hop) + flow.dwell + flow.rest
/** i번째 노드에 빛이 닿는 시각(초) */
export const flowAt = (i: number) => flow.lead + i * (flow.dwell + flow.hop)

/** n개 노드를 차례로 지나는 흐름의 시계 — 보이는 동안만 돈다 (Beam · Arrive에 넘긴다) */
export function useFlow(ref: RefObject<Element | null>, n: number) {
  return useLoop(useLive(ref, 0.5), flowSeconds(n))
}
