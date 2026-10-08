import { useEffect, useRef } from 'react'
import { useLive } from './fx/loop'

type ViewfinderProps = { state: number; fps: number }

const links = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
]

const pad = (n: number) => String(n).padStart(5, '0')
const easeOut = (n: number) => 1 - (1 - n) ** 3

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

    const text = (value: string, x: number, y: number, color: string, size: number, align: CanvasTextAlign = 'left') => {
      ctx.fillStyle = color
      ctx.font = `500 ${size}px "JetBrains Mono Variable", monospace`
      ctx.textAlign = align
      ctx.fillText(value, x, y)
      ctx.textAlign = 'left'
    }

    const tag = (x: number, y: number, value: string, color: string) => {
      const size = Math.max(8, Math.min(10, height * 0.062))
      ctx.font = `700 ${size}px "JetBrains Mono Variable", monospace`
      const w = ctx.measureText(value).width + 10
      const tx = Math.max(4, Math.min(width - w - 4, x))
      const ty = Math.max(4, y)
      ctx.fillStyle = color
      ctx.fillRect(tx, ty, w, size + 8)
      text(value, tx + 5, ty + size + 1, '#0c151e', size)
    }

    const bracket = (x: number, y: number, dx: number, dy: number) => {
      const s = Math.max(10, Math.min(16, width * 0.045))
      ctx.beginPath()
      ctx.moveTo(x + dx * s, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * s)
      ctx.stroke()
    }

    const drawHand = (time: number, door: { x: number; y: number; w: number; h: number }, stopped: boolean, color: string) => {
      const phase = stopped ? Math.min(1, (time % 6 - 2.4) / 0.7) : 0
      const searching = time % 6
      const scale = Math.max(48, Math.min(height * 0.38, width * 0.22))
      const targetX = door.x + door.w * 0.48 - scale * 0.12
      const targetY = door.y + door.h * 0.52 + scale * 0.79
      const searchX = width * (0.43 + Math.sin(searching * 2.1) * 0.12)
      const searchY = height * (0.94 + Math.cos(searching * 2.8) * 0.035)
      const wristX = searchX + (targetX - searchX) * easeOut(phase)
      const wristY = searchY + (targetY - searchY) * easeOut(phase)
      // 0은 손목, 8은 뻗은 검지 끝. 나머지는 손바닥 쪽으로 말아 둔다.
      const pose = [
        [0, 0], [-0.11, -0.05], [-0.2, -0.14], [-0.25, -0.23], [-0.28, -0.29],
        [0.07, -0.15], [0.1, -0.35], [0.11, -0.56], [0.12, -0.79],
        [0, -0.16], [-0.02, -0.3], [0.03, -0.39], [0.1, -0.39],
        [-0.09, -0.13], [-0.15, -0.24], [-0.12, -0.33], [-0.05, -0.34],
        [-0.16, -0.09], [-0.23, -0.17], [-0.22, -0.25], [-0.15, -0.27],
      ].map(([x, y]) => ({ x: wristX + x * scale, y: wristY + y * scale }))

      ctx.strokeStyle = 'rgba(227, 137, 109, 0.72)'
      ctx.lineWidth = 1.35
      links.forEach(([from, to]) => {
        ctx.beginPath()
        ctx.moveTo(pose[from].x, pose[from].y)
        ctx.lineTo(pose[to].x, pose[to].y)
        ctx.stroke()
      })
      pose.forEach((point, i) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, i === 8 ? 3.2 : 2, 0, Math.PI * 2)
        ctx.fillStyle = i === 8 ? color : '#f1b19e'
        ctx.fill()
      })
      ctx.beginPath()
      ctx.arc(pose[8].x, pose[8].y, 7, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()
      return pose[8]
    }

    const draw = (time: number) => {
      if (!width || !height) return
      const slow = state === 0
      const accent = slow ? '#e3896d' : '#8ec9e8'
      const line = 'rgba(207, 223, 235, 0.62)'
      const cycle = time % 6
      const stopped = cycle >= 2.4 && cycle < 4.7
      const stopX = width * 0.19
      let busX: number
      if (cycle < 2.4) busX = width + 18 - (width + 18 - stopX) * easeOut(cycle / 2.4)
      else if (cycle < 4.7) busX = stopX
      else busX = stopX - ((cycle - 4.7) / 1.3) ** 2 * (stopX + width * 0.72)

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#101b27'
      ctx.fillRect(0, 0, width, height)

      // 멀어지는 도로 선은 고정해 두어, 낮은 처리율에서 버스와 손만 끊겨 보인다.
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
      tag(active.x, active.y - 18, stopped && !slow ? 'door' : 'bus', accent)

      if (slow && stopped) {
        const detectedDoor = { x: door.x - 3, y: door.y - 3, w: door.w + 6, h: door.h + 6 }
        ctx.strokeStyle = '#e3896d'
        ctx.strokeRect(detectedDoor.x, detectedDoor.y, detectedDoor.w, detectedDoor.h)
        tag(detectedDoor.x, Math.max(40, detectedDoor.y - 18), 'door', '#e3896d')
        const fingertip = drawHand(time, detectedDoor, stopped, accent)
        if (fingertip.x > detectedDoor.x && fingertip.x < detectedDoor.x + detectedDoor.w && fingertip.y > detectedDoor.y && fingertip.y < detectedDoor.y + detectedDoor.h) {
          tag(detectedDoor.x - 1, Math.min(height - 22, detectedDoor.y + detectedDoor.h + 4), 'pointing → door', accent)
        }
      } else if (slow) {
        drawHand(time, door, false, accent)
      }

      const mono = Math.max(8, Math.min(10, height * 0.06))
      text(`processed frame #${pad(frame)}`, 10, 15, 'rgba(226, 239, 247, .76)', mono)
      text(`${fps} FPS${slow ? '' : ' · TARGET CLASS ONLY'}`, 10, 15 + mono + 6, accent, mono)
      if (slow) {
        text('Hand Tracking · CPU', width - 10, 15, '#e3896d', mono, 'right')
        text('Object Detection · GPU', width - 10, 15 + mono + 6, '#e3896d', mono, 'right')
      } else {
        const sensorY = height - 14
        text('distance sensor  ▮▮▮▯▯', 10, sensorY, '#8ec9e8', mono)
        text(stopped ? 'right →' : '← left', width - 10, sensorY, '#8ec9e8', mono, 'right')
      }

      ctx.strokeStyle = 'rgba(142, 201, 232, 0.6)'
      ctx.lineWidth = 1
      bracket(7, 7, 1, 1)
      bracket(width - 7, 7, -1, 1)
      bracket(7, height - 7, 1, -1)
      bracket(width - 7, height - 7, -1, -1)
      frame += 1
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
      <figcaption className="mt-1.5 text-[10px] leading-snug text-muted">
        ※ 처리 속도 차이를 보여주기 위한 시뮬레이션 화면입니다 (실제 카메라 영상 아님)
      </figcaption>
    </figure>
  )
}
