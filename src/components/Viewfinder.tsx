import { useEffect, useRef } from 'react'
import { useLive } from './fx/loop'

type ViewfinderProps = { state: number; fps: number }
type Point = { x: number; y: number }

const links = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
]

const fingerTones = ['#d6a082', '#8ec9e8', '#e1be8a', '#c4c7df', '#d59b86']
const pad = (n: number) => String(n).padStart(5, '0')
const easeOut = (n: number) => 1 - (1 - Math.max(0, Math.min(1, n))) ** 3

/** 처리 주기만큼만 새 장면을 그려, 병목이 만든 끊김도 화면에서 읽히게 한다. */
export function Viewfinder({ state, fps }: ViewfinderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const live = useLive(ref, 0.2)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let last = -1
    let frame = 0
    let raf = 0

    const fontSize = () => Math.max(10, Math.min(14, height * 0.037))
    const text = (value: string, x: number, y: number, color: string, size = fontSize(), align: CanvasTextAlign = 'left') => {
      ctx.fillStyle = color
      ctx.font = `500 ${size}px "JetBrains Mono Variable", monospace`
      ctx.textAlign = align
      ctx.fillText(value, x, y)
      ctx.textAlign = 'left'
    }

    const tag = (x: number, y: number, value: string, color: string) => {
      const size = fontSize()
      const h = size + 9
      ctx.font = `700 ${size}px "JetBrains Mono Variable", monospace`
      const w = ctx.measureText(value).width + 12
      const tx = Math.max(5, Math.min(width - w - 5, x))
      const ty = Math.max(5, Math.min(height - h - 5, y))
      ctx.fillStyle = color
      ctx.fillRect(tx, ty, w, h)
      text(value, tx + 6, ty + size + 1, '#101b27', size)
      return { w, h }
    }

    const bracket = (x: number, y: number, dx: number, dy: number) => {
      const size = Math.max(11, Math.min(18, width * 0.03))
      ctx.beginPath()
      ctx.moveTo(x + dx * size, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * size)
      ctx.stroke()
    }

    const drawHand = (time: number, door: { x: number; y: number; w: number; h: number }, stopped: boolean) => {
      const cycle = time % 4.8
      const pointing = stopped ? easeOut((cycle - 1.55) / 0.55) : 0
      const search = cycle < 1.55 ? cycle : cycle - 3.8
      const scale = Math.max(112, Math.min(height * 0.53, width * 0.37))
      const target = { x: door.x + door.w * 0.47, y: door.y + door.h * 0.42 }
      // 손목 기준: 검지는 문을 향해 길게 펴고, 나머지 손가락은 손바닥 쪽으로 자연스럽게 접힌다.
      const pose = [
        [0, 0], [-0.2, -0.1], [-0.33, -0.2], [-0.42, -0.29], [-0.47, -0.36],
        [-0.08, -0.27], [-0.12, -0.43], [-0.18, -0.6], [-0.25, -0.75],
        [0.03, -0.34], [-0.02, -0.52], [0.03, -0.62], [0.14, -0.61],
        [0.18, -0.3], [0.15, -0.47], [0.24, -0.55], [0.34, -0.49],
        [0.33, -0.22], [0.37, -0.34], [0.45, -0.39], [0.52, -0.32],
      ]
      const searchWrist = {
        x: width * (0.79 + Math.sin(search * 2.4) * 0.045),
        y: height * (0.99 + Math.cos(search * 2.1) * 0.035),
      }
      const pointWrist = { x: target.x - pose[8][0] * scale, y: target.y - pose[8][1] * scale }
      const wrist = {
        x: searchWrist.x + (pointWrist.x - searchWrist.x) * pointing,
        y: searchWrist.y + (pointWrist.y - searchWrist.y) * pointing,
      }
      const points: Point[] = pose.map(([x, y]) => ({ x: wrist.x + x * scale, y: wrist.y + y * scale }))

      // 낮은 알파의 손 실루엣을 먼저 깔아 실제 카메라의 트래킹 오버레이처럼 보이게 한다.
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.fillStyle = 'rgba(226, 164, 139, 0.23)'
      ctx.beginPath()
      ;[0, 1, 5, 9, 13, 17].forEach((index, i) => {
        const point = points[index]
        if (i) ctx.lineTo(point.x, point.y)
        else ctx.moveTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(226, 164, 139, 0.34)'
      ctx.lineWidth = Math.max(8, Math.min(15, height * 0.04))
      links.forEach(([from, to]) => {
        ctx.beginPath()
        ctx.moveTo(points[from].x, points[from].y)
        ctx.lineTo(points[to].x, points[to].y)
        ctx.stroke()
      })
      ctx.restore()

      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = Math.max(1.8, Math.min(2.4, height * 0.007))
      links.forEach(([from, to]) => {
        const finger = from <= 4 ? 0 : Math.floor((from - 1) / 4)
        ctx.strokeStyle = fingerTones[finger]
        ctx.beginPath()
        ctx.moveTo(points[from].x, points[from].y)
        ctx.lineTo(points[to].x, points[to].y)
        ctx.stroke()
      })
      points.forEach((point, i) => {
        const finger = i <= 4 ? 0 : Math.floor((i - 1) / 4)
        ctx.beginPath()
        ctx.arc(point.x, point.y, i === 8 ? 3.8 : 2.6, 0, Math.PI * 2)
        ctx.fillStyle = fingerTones[finger]
        ctx.fill()
        ctx.strokeStyle = '#172331'
        ctx.lineWidth = 0.7
        ctx.stroke()
      })
      ctx.beginPath()
      ctx.arc(points[8].x, points[8].y, Math.max(8, height * 0.03), 0, Math.PI * 2)
      ctx.strokeStyle = '#8ec9e8'
      ctx.lineWidth = 1.3
      ctx.stroke()
      ctx.restore()

      const handTagX = Math.min(width - 140, Math.max(10, width * 0.08))
      const handTagY = height * 0.78
      tag(handTagX, handTagY, 'hand · 21 landmarks', '#e1be8a')
      return { pointing }
    }

    const draw = (time: number) => {
      if (!width || !height) return
      const slow = state === 0
      const accent = slow ? '#e3896d' : '#8ec9e8'
      const line = 'rgba(207, 223, 235, 0.65)'
      const cycle = time % 4.8
      const stopped = cycle >= 1.55 && cycle < 3.8
      const stopX = width * 0.19
      let busX: number
      if (cycle < 1.55) busX = width + 18 - (width + 18 - stopX) * easeOut(cycle / 1.55)
      else if (cycle < 3.8) busX = stopX
      else busX = stopX - ((cycle - 3.8) / 1) ** 2 * (stopX + width * 0.72)

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#101b27'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(142, 201, 232, 0.17)'
      ctx.lineWidth = 1
      for (let i = 0; i < 5; i += 1) {
        const y = height * 0.72 + i * i * Math.max(1.4, height * 0.009)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.setLineDash([8, 9])
      ctx.beginPath()
      ctx.moveTo(0, height * 0.89)
      ctx.lineTo(width, height * 0.89)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = 'rgba(207, 223, 235, 0.25)'
      ctx.beginPath()
      ctx.moveTo(width * 0.08, height * 0.22)
      ctx.lineTo(width * 0.08, height * 0.7)
      ctx.lineTo(width * 0.14, height * 0.7)
      ctx.stroke()

      const busW = width * 0.58
      const busH = height * 0.39
      const busY = height * 0.75 - busH
      const door = { x: busX + busW * 0.79, y: busY + busH * 0.14, w: busW * 0.13, h: busH * 0.76 }
      ctx.strokeStyle = line
      ctx.lineWidth = Math.max(1.2, Math.min(2, width * 0.006))
      ctx.beginPath()
      ctx.roundRect(busX, busY, busW, busH, 7)
      ctx.stroke()
      for (let i = 0; i < 4; i += 1) {
        ctx.strokeRect(busX + busW * (0.07 + i * 0.17), busY + busH * 0.16, busW * 0.13, busH * 0.29)
      }
      ctx.strokeRect(door.x, door.y, door.w, door.h)
      ctx.beginPath()
      ctx.moveTo(door.x + door.w / 2, door.y)
      ctx.lineTo(door.x + door.w / 2, door.y + door.h)
      ctx.stroke()
      ;[0.2, 0.73].forEach((wheel) => {
        ctx.beginPath()
        ctx.arc(busX + busW * wheel, busY + busH, busH * 0.115, 0, Math.PI * 2)
        ctx.fillStyle = '#101b27'
        ctx.fill()
        ctx.stroke()
      })

      const bus = { x: busX - 4, y: busY - 4, w: busW + 8, h: busH + busH * 0.115 + 8 }
      const active = slow || !stopped ? bus : { x: door.x - 3, y: door.y - 3, w: door.w + 6, h: door.h + 6 }
      ctx.strokeStyle = accent
      ctx.lineWidth = 1.5
      ctx.strokeRect(active.x, active.y, active.w, active.h)
      tag(active.x, active.y - fontSize() - 13, stopped && !slow ? 'door' : 'bus', accent)

      if (slow) {
        const detectedDoor = { x: door.x - 3, y: door.y - 3, w: door.w + 6, h: door.h + 6 }
        if (stopped) {
          ctx.strokeStyle = '#e1be8a'
          ctx.lineWidth = 1.5
          ctx.strokeRect(detectedDoor.x, detectedDoor.y, detectedDoor.w, detectedDoor.h)
          // 버스 태그와 같은 윗변을 피해서 문 태그는 박스 안쪽에 둔다.
          tag(detectedDoor.x + 5, detectedDoor.y + 5, 'door', '#e1be8a')
        }
        const hand = drawHand(time, detectedDoor, stopped)
        if (stopped && hand.pointing > 0.95) {
          tag(detectedDoor.x + 5, detectedDoor.y + detectedDoor.h - fontSize() - 13, 'pointing → door', '#e3896d')
        }
      }

      const mono = fontSize()
      text(`processed frame #${pad(frame)}`, 11, 12 + mono, 'rgba(226, 239, 247, .8)', mono)
      text(`${fps} FPS${slow ? '' : ' · TARGET CLASS ONLY'}`, 11, 18 + mono * 2, accent, mono)
      if (slow) {
        text('Hand Tracking · CPU', width - 11, 12 + mono, '#e3896d', mono, 'right')
        text('Object Detection · GPU', width - 11, 18 + mono * 2, '#e3896d', mono, 'right')
      } else {
        const sensorY = height - 13
        text('distance sensor  ▮▮▮▯▯', 11, sensorY, '#8ec9e8', mono)
        text(stopped ? 'right →' : '← left', width - 11, sensorY, '#8ec9e8', mono, 'right')
      }

      ctx.strokeStyle = 'rgba(142, 201, 232, 0.6)'
      ctx.lineWidth = 1
      bracket(7, 7, 1, 1)
      bracket(width - 7, 7, -1, 1)
      bracket(7, height - 7, 1, -1)
      bracket(width - 7, height - 7, -1, -1)
      frame += 1
    }

    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      last = -1
      draw(3.4)
    }

    const observer = new ResizeObserver(fit)
    observer.observe(canvas)
    fit()
    if (live) {
      const loop = (now: number) => {
        const seconds = now / 1000
        if (last < 0 || seconds - last >= 1 / fps) {
          last = seconds
          draw(seconds)
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [fps, live, state])

  const description = state === 0
    ? '초기 설계의 카메라 시뮬레이션: 손 랜드마크가 버스 문을 가리키며 저속으로 객체를 탐지합니다.'
    : '재설계의 카메라 시뮬레이션: 손 없이 현재 목표인 버스 또는 버스 문을 빠르게 탐지합니다.'

  return (
    <figure ref={ref} className="min-w-0">
      <canvas ref={canvasRef} aria-hidden className="block aspect-video w-full rounded-[6px] bg-ink" />
      <span className="sr-only">{description}</span>
      <figcaption className="mt-1.5 text-[11px] leading-snug text-muted">
        ※ 처리 속도 차이를 보여주기 위한 시뮬레이션 화면입니다 (실제 카메라 영상 아님)
      </figcaption>
    </figure>
  )
}
