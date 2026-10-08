import { useEffect, useRef } from 'react'
import { useLive } from './fx/loop'

type ViewfinderProps = { state: number; fps: number }
type Point = { x: number; y: number }
type Box = { x: number; y: number; w: number; h: number }

const links = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
]

const fingerTones = ['#d6a082', '#8ec9e8', '#e1be8a', '#c4c7df', '#d59b86']
const pad = (n: number) => String(n).padStart(5, '0')
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n))
const easeOut = (n: number) => 1 - (1 - clamp(n)) ** 3

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

    const fontSize = () => Math.max(width < 420 ? 8 : 11, Math.min(14, height * 0.037))
    const text = (value: string, x: number, y: number, color: string, size = fontSize(), align: CanvasTextAlign = 'left') => {
      ctx.fillStyle = color
      ctx.font = '500 ' + size + 'px "JetBrains Mono Variable", monospace'
      ctx.textAlign = align
      ctx.fillText(value, x, y)
      ctx.textAlign = 'left'
    }

    const tag = (x: number, y: number, value: string, color: string) => {
      const size = fontSize()
      const h = size + 9
      ctx.font = '700 ' + size + 'px "JetBrains Mono Variable", monospace'
      const w = ctx.measureText(value).width + 12
      const tx = clamp(x, 5, width - w - 5)
      const ty = clamp(y, 5, height - h - 5)
      ctx.fillStyle = color
      ctx.fillRect(tx, ty, w, h)
      text(value, tx + 6, ty + size + 1, '#101b27', size)
    }

    const bracket = (x: number, y: number, dx: number, dy: number) => {
      const size = Math.max(11, Math.min(18, width * 0.03))
      ctx.beginPath()
      ctx.moveTo(x + dx * size, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * size)
      ctx.stroke()
    }

    const centerOf = (box: Box): Point => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 })

    const drawGuide = (from: Point, target: Point, color: string) => {
      ctx.save()
      ctx.setLineDash([4, 5])
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.75
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(target.x, target.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(target.x, target.y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }

    // ref와 박스의 실제 픽셀 좌표만으로 진동을 결정한다. 애니메이션 시간표에는 의존하지 않는다.
    const motorState = (reference: Point, box: Box) => {
      const target = centerOf(box)
      const dx = target.x - reference.x
      const dy = target.y - reference.y
      const normalized = Math.hypot(dx, dy) / Math.max(1, Math.max(box.w, box.h))
      const aligned = normalized <= 0.9
      const approach = 1 - clamp(normalized / 2.5)
      const strength = aligned
        ? 0.45 + 0.55 * (1 - normalized / 0.9)
        : 0.22 + 0.58 * approach
      return {
        left: aligned || dx < 0 ? strength : 0,
        right: aligned || dx >= 0 ? strength : 0,
      }
    }

    const drawMotor = (label: 'L' | 'R', x: number, y: number, direction: -1 | 1, strength: number, color: string, time: number) => {
      const lit = strength > 0
      const alpha = lit ? 0.36 + strength * 0.64 : 0.22
      const pulse = lit ? 1 + strength * (0.07 + 0.09 * (0.5 + 0.5 * Math.sin(time * 14))) : 1
      const size = Math.max(10, fontSize() * 0.93)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = lit ? color : 'rgba(207, 223, 235, 0.65)'
      ctx.fillStyle = lit ? color : 'rgba(207, 223, 235, 0.65)'
      ctx.lineWidth = 1.25 + strength * 0.7
      text(label, x, y + 4, lit ? color : 'rgba(207, 223, 235, 0.65)', size, label === 'R' ? 'right' : 'left')
      const bodyX = x + (label === 'L' ? 17 : -31)
      ctx.strokeRect(bodyX, y - 7 * pulse, 14 * pulse, 13 * pulse)
      ctx.beginPath()
      ctx.moveTo(bodyX + 14 * pulse, y - 3 * pulse)
      ctx.lineTo(bodyX + 18 * pulse, y - 3 * pulse)
      ctx.moveTo(bodyX + 14 * pulse, y + 2 * pulse)
      ctx.lineTo(bodyX + 18 * pulse, y + 2 * pulse)
      ctx.stroke()
      const arcs = strength > 0.78 ? 3 : strength > 0.58 ? 2 : strength > 0 ? 1 : 0
      for (let i = 0; i < arcs; i += 1) {
        const offset = (i + 1) * 5 * direction
        const arcX = direction < 0 ? bodyX - 2 + offset : bodyX + 16 * pulse + offset
        ctx.beginPath()
        ctx.arc(arcX, y - 0.5, 4 + i * 2, direction < 0 ? -Math.PI / 2 : Math.PI / 2, direction < 0 ? Math.PI / 2 : Math.PI * 1.5)
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawMotorHud = (reference: Point, targetBox: Box, color: string, sensor: boolean, time: number) => {
      const motors = motorState(reference, targetBox)
      const baseY = height - 25
      if (sensor) text('distance → voice  ▮▮▮▯▯', 11, height - 47, '#8ec9e8', fontSize())
      text('vibration', width / 2, height - 45, 'rgba(207, 223, 235, 0.72)', fontSize(), 'center')
      drawMotor('L', 12, baseY, -1, motors.left, color, time)
      drawMotor('R', width - 13, baseY, 1, motors.right, color, time)
    }

    const drawReticle = (reference: Point) => {
      ctx.save()
      ctx.strokeStyle = '#8ec9e8'
      ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.arc(reference.x, reference.y, Math.max(8, height * 0.026), 0, Math.PI * 2)
      ctx.moveTo(reference.x - 13, reference.y)
      ctx.lineTo(reference.x + 13, reference.y)
      ctx.moveTo(reference.x, reference.y - 13)
      ctx.lineTo(reference.x, reference.y + 13)
      ctx.stroke()
      ctx.restore()
      text('viewpoint', reference.x + 15, reference.y + 18, '#8ec9e8', fontSize())
    }

    const drawHand = (time: number, door: Box, stopped: boolean) => {
      const cycle = time % 4.8
      const scale = Math.max(112, Math.min(height * 0.53, width * 0.37))
      // 검지만 일직선으로 뻗고, 세 손가락의 끝은 다시 손바닥 쪽으로 감기는 자세다.
      const pose = [
        [0, 0], [-0.14, -0.06], [-0.27, -0.1], [-0.36, -0.15], [-0.42, -0.19],
        [-0.08, -0.24], [-0.1, -0.51], [-0.12, -0.79], [-0.14, -1.07],
        [0.09, -0.23], [0.1, -0.4], [0.2, -0.44], [0.24, -0.28],
        [0.23, -0.15], [0.32, -0.29], [0.37, -0.17], [0.28, -0.06],
        [0.32, -0.05], [0.44, -0.13], [0.48, 0], [0.37, 0.07],
      ]
      const searchWrist = (at: number) => ({
        x: width * (0.93 + Math.sin(at * 2.4) * 0.025),
        y: height * (0.99 + Math.cos(at * 2.1) * 0.035),
      })
      const searchTip = (at: number) => {
        const wrist = searchWrist(at)
        return { x: wrist.x + pose[8][0] * scale, y: wrist.y + pose[8][1] * scale }
      }
      const target = centerOf(door)
      const start = searchTip(1.55)
      const q = clamp((cycle - 1.55) / 1.72)
      // 끝에서 조금 지나쳤다가 돌아오므로, 좌우 모터가 실제로 한 번 반전된다.
      const travel = easeOut(q) + Math.sin(Math.PI * q) * 0.15
      const desiredTip = {
        x: start.x + (target.x - start.x) * travel,
        y: start.y + (target.y - start.y) * travel - Math.sin(Math.PI * q) * door.h * 0.12,
      }
      const wrist = stopped
        ? { x: desiredTip.x - pose[8][0] * scale, y: desiredTip.y - pose[8][1] * scale }
        : searchWrist(cycle)
      const points: Point[] = pose.map(([x, y]) => ({ x: wrist.x + x * scale, y: wrist.y + y * scale }))

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

      return points[8]
    }

    const draw = (time: number) => {
      if (!width || !height) return
      const slow = state === 0
      const accent = slow ? '#e3896d' : '#8ec9e8'
      const line = 'rgba(207, 223, 235, 0.65)'
      const cycle = time % (slow ? 4.8 : 5.4)
      const stopped = slow ? cycle >= 1.55 && cycle < 3.8 : cycle >= 1.35 && cycle < 4.35
      const stopX = width * 0.18
      const busW = width * 0.58
      const busH = height * 0.39
      const busY = height * 0.75 - busH
      let busLocalX: number
      if (cycle < (slow ? 1.55 : 1.35)) {
        const arrive = slow ? 1.55 : 1.35
        busLocalX = width + 18 - (width + 18 - stopX) * easeOut(cycle / arrive)
      } else if (cycle < (slow ? 3.8 : 4.35)) busLocalX = stopX
      else busLocalX = stopX - ((cycle - (slow ? 3.8 : 4.35)) / 1) ** 2 * (stopX + width * 0.72)

      const localDoorCenter = busLocalX + busW * 0.855
      const turn = slow ? 0 : easeOut((cycle - 1.35) / 2.1)
      const scenePan = -Math.max(0, localDoorCenter - width / 2) * turn
      const busX = busLocalX + scenePan
      const door: Box = { x: busX + busW * 0.79, y: busY + busH * 0.14, w: busW * 0.13, h: busH * 0.76 }
      const detectedDoor: Box = { x: door.x - 3, y: door.y - 3, w: door.w + 6, h: door.h + 6 }

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
      ctx.moveTo(width * 0.08 + scenePan, height * 0.22)
      ctx.lineTo(width * 0.08 + scenePan, height * 0.7)
      ctx.lineTo(width * 0.14 + scenePan, height * 0.7)
      ctx.stroke()

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

      const bus: Box = { x: busX - 4, y: busY - 4, w: busW + 8, h: busH + busH * 0.115 + 8 }
      const active = slow && !stopped ? bus : detectedDoor
      ctx.strokeStyle = accent
      ctx.lineWidth = 1.5
      ctx.strokeRect(active.x, active.y, active.w, active.h)
      tag(active.x, active.y - fontSize() - 13, active === bus ? 'bus' : 'door', accent)
      if (slow && !stopped) {
        ctx.strokeStyle = 'rgba(225, 190, 138, 0.9)'
        ctx.lineWidth = 1.2
        ctx.strokeRect(detectedDoor.x, detectedDoor.y, detectedDoor.w, detectedDoor.h)
      }

      let reference: Point
      if (slow) {
        reference = drawHand(time, detectedDoor, stopped)
        drawGuide(reference, centerOf(detectedDoor), '#e1be8a')
      } else {
        reference = { x: width / 2, y: height / 2 }
        drawGuide(reference, centerOf(detectedDoor), '#8ec9e8')
        drawReticle(reference)
      }

      const mono = fontSize()
      text('processed frame #' + pad(frame), 11, 12 + mono, 'rgba(226, 239, 247, .8)', mono)
      text(String(fps) + ' FPS' + (slow ? '' : ' · TARGET CLASS ONLY'), 11, 18 + mono * 2, accent, mono)
      if (slow) {
        text('Hand Tracking · CPU', width - 11, 12 + mono, '#e3896d', mono, 'right')
        text('Object Detection · GPU', width - 11, 18 + mono * 2, '#e3896d', mono, 'right')
      }
      drawMotorHud(reference, detectedDoor, accent, !slow, time)

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
      // 모션 감소에서는 정지 프레임에도 한쪽 모터의 안내가 남는다.
      draw(state === 0 ? 1.2 : 1.5)
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
    ? '초기 설계의 카메라 시뮬레이션: 검지 끝을 기준으로 문 중심이 왼쪽이면 왼쪽, 오른쪽이면 오른쪽 진동 모터가 안내하며, 가까워지면 양쪽 모터가 더 강하게 진동합니다.'
    : '재설계의 카메라 시뮬레이션: 프레임 중앙의 고정 시점을 기준으로 문 중심이 왼쪽이면 왼쪽, 오른쪽이면 오른쪽 진동 모터가 안내하며, 정렬될수록 양쪽 모터가 더 강하게 진동합니다.'

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
