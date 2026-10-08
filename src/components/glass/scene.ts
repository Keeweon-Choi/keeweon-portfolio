// 스마트글래스 3D 모형 (three.js). GlassGuide가 화면 근처에 오면 동적 import → three는 메인 번들과 분리된 청크.
// 좌표: 시선(앞) = -z, 착용자 오른쪽 = +x. 카메라가 착용자 어깨 뒤 · 위에 있어 화면 왼쪽 = 착용자 왼쪽이다.
// 앞쪽은 단계별 장면(흐릿한 파노라마)이 원통 벽처럼 둘러싸고, 카메라 화각만큼이 하늘색으로 표시된다.
// 시계는 GlassGuide가 갖고, 여기서는 받은 자세(Pose)를 그리기만 한다 (드래그 회전은 여기서 처리).
// three/src에서 직접 가져온다: 렌더러(셰이더 포함)를 따로 불러와 500kB 넘는 청크 하나로 뭉치지 않게 하려고.
// addons는 three 전체 빌드를 끌고 와서 쓰지 않는다 → 둥근 상자 대신 상자, 환경광은 studio()로.
import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector3,
  type Material,
  type MeshPhysicalMaterialParameters,
  type Object3D,
} from 'three/src/Three.Core.js'
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'

export type Pin = 'camera' | 'sensor' | 'L' | 'R'
export type Pose = {
  /** 초. 링 · 떨림의 위상 */
  time: number
  /** 머리를 돌린 각도(rad, + = 왼쪽) */
  yaw: number
  /** 좌우 진동 세기 0–1 */
  L: number
  R: number
  /** 초음파 링 0–1 */
  sensor: number
  /** 모션 감소: 흔들림 없이, 링은 퍼지는 중간 모습으로 고정 */
  still: boolean
  /** 지금 단계(앞 장면 파노라마 선택) · 목표가 있는 방향(rad, + = 왼쪽) · 장면 보임 0–1 (단계가 바뀔 때 페이드) */
  stage: number
  aim: number
  world: number
}
export type Options = {
  /** 단계별 앞 장면 이미지 (카메라 화면 장면 1600×400을 흐리게) */
  panos: string[]
  /** 장면 1단위가 몇 rad인지 (카메라 화면 800단위 = 카메라 화각) */
  rpu: number
}
export type GuideScene = { update(pose: Pose): void; dispose(): void }

// 페이지 톤(차콜 · 하늘 · 파랑)에 맞춘 재질 색
const C = {
  frame: 0x2a313b,
  lens: 0xcfe7f4,
  board: 0x2b5f8c,
  metal: 0xe3e8ee,
  mesh: 0x3a414c,
  black: 0x1b2028,
  motor: 0xeef2f6,
  blue: 0x3d77a8,
  sky: 0x8ec9e8,
}
const motorAt = { x: 2.14, y: 0.1, z: 0.42 } // 안경알 바로 옆: 다리가 접히는 경첩 뒤 바깥쪽(관자놀이)

const physical = (color: number, extra: MeshPhysicalMaterialParameters = {}) =>
  new MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15, ...extra })

/** 퍼져 나가며 옅어지는 링 3개 (진동 · 초음파) */
const rings = (radius: number) =>
  Array.from(
    { length: 3 },
    () =>
      new Mesh(
        new TorusGeometry(radius, 0.014, 8, 72),
        new MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
      ),
  )

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/** 메시 · 선의 geometry · material을 모두 해제 */
const free = (root: Object3D) =>
  root.traverse((o) => {
    if (o instanceof Mesh || o instanceof LineSegments) {
      o.geometry.dispose()
      ;(o.material as Material).dispose()
    }
  })

/** 반사용 작은 스튜디오: 옅은 회색 방 + 밝은 패널 → 금속 · 코팅 재질에 비칠 환경광 */
function studio() {
  const s = new Scene()
  s.add(new Mesh(new BoxGeometry(16, 10, 16), new MeshBasicMaterial({ color: 0x8d99a6, side: BackSide })))
  // [x, y, z, 크기 x, y, z, 밝기]
  for (const [x, y, z, sx, sy, sz, k] of [
    [0, 4.9, 0, 8, 0.1, 8, 3],
    [-7.9, 1, 2, 0.1, 4, 6, 2],
    [7.9, 2, -3, 0.1, 3, 5, 1.5],
    [0, 1, 7.9, 6, 3, 0.1, 1.2],
  ]) {
    const mat = new MeshBasicMaterial()
    mat.color.setScalar(k)
    const panel = new Mesh(new BoxGeometry(sx, sy, sz), mat)
    panel.position.set(x, y, z)
    s.add(panel)
  }
  return s
}

/** 바닥에 깔리는 부드러운 그림자 */
function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  // CPU 쪽 캔버스로 그려야 텍스처로 올릴 때 GPU에서 다시 읽지 않는다 (GPU stall 경고 방지)
  const g = c.getContext('2d', { willReadFrequently: true })
  if (g) {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    r.addColorStop(0, 'rgba(23,35,49,0.2)')
    r.addColorStop(1, 'rgba(23,35,49,0)')
    g.fillStyle = r
    g.fillRect(0, 0, 128, 128)
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export async function mount(
  canvas: HTMLCanvasElement,
  pins: Record<Pin, HTMLElement>,
  opts: Options,
): Promise<GuideScene> {
  // three가 오류를 찍고 던지기 전에 먼저 확인 → GlassGuide가 사진으로 대신한다
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true })
  if (!gl) throw new Error('WebGL2 unavailable')
  const { WebGLRenderer } = await import('three/src/renderers/WebGLRenderer.js')
  const renderer = new WebGLRenderer({ canvas, context: gl })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.toneMapping = NeutralToneMapping

  const scene = new Scene()
  const pm = new PMREMGenerator(renderer)
  const room = studio()
  const env = pm.fromScene(room, 0.04).texture
  pm.dispose()
  free(room)
  scene.environment = env
  scene.add(new HemisphereLight(0xffffff, 0xc3cfdb, 1.1))
  const key = new DirectionalLight(0xffffff, 1.6)
  key.position.set(-3, 6, 5)
  scene.add(key)

  const look = new Vector3(0, 0.2, -3) // 안경 너머 앞쪽
  const eye = new Vector3(0, 3.6, 11.6) // look 기준: 착용자 어깨 뒤 · 조금 위에서 앞을 본다
  const camera = new PerspectiveCamera(40, 1, 0.1, 100)
  const root = new Group() // 드래그로 돌리는 보는 각도
  const head = new Group() // 머리를 돌리는 방향 (목 축이 회전 중심)
  const model = new Group()
  model.position.z = -1.6 // 안경테가 목 축보다 앞에 있다
  head.add(model)
  root.add(head)
  scene.add(root)

  /* ── 안경: 테 · 렌즈 · 다리 · 진동 모터 ── */
  const frameMat = physical(C.frame, { metalness: 0.4 })
  const lensMat = physical(C.lens, {
    roughness: 0.05,
    transparent: true,
    opacity: 0.4,
    side: DoubleSide,
    depthWrite: false,
  })
  type Motor = { mesh: Mesh; mat: MeshPhysicalMaterial; ripples: Mesh[]; level: number; phase: number }
  const motors: Motor[] = []
  for (const s of [-1, 1]) {
    const rim = new Mesh(new TorusGeometry(0.78, 0.075, 20, 90), frameMat)
    rim.scale.set(1.25, 0.8, 1)
    rim.position.set(s * 1.04, 0, 0)
    rim.rotation.y = -s * 0.14 // 바깥쪽이 귀 방향으로 살짝 감긴다
    const lens = new Mesh(new CircleGeometry(0.77, 64), lensMat)
    lens.scale.copy(rim.scale)
    lens.position.copy(rim.position)
    lens.rotation.copy(rim.rotation)
    const hinge = new Mesh(new BoxGeometry(0.16, 0.2, 0.26), frameMat)
    hinge.position.set(s * 2.0, 0.1, 0.1)
    const temple = new Mesh(new BoxGeometry(0.09, 0.14, 2.7), frameMat)
    temple.position.set(s * 2.0, 0.1, 1.4)
    const tip = new Mesh(new BoxGeometry(0.09, 0.14, 0.72), frameMat)
    tip.position.set(s * 2.0, -0.04, 3.08)
    tip.rotation.x = 0.4 // 귀에 걸려 내려가는 끝
    const mat = physical(C.motor, { metalness: 0.2, emissive: C.sky, emissiveIntensity: 0 })
    const mesh = new Mesh(new CapsuleGeometry(0.11, 0.3, 6, 20), mat)
    mesh.rotation.x = Math.PI / 2
    mesh.position.set(s * motorAt.x, motorAt.y, motorAt.z)
    const ripples = rings(0.2)
    for (const r of ripples) {
      r.rotation.x = Math.PI / 2 // 관자놀이 둘레로 퍼지는 물결
      r.position.copy(mesh.position)
    }
    model.add(rim, lens, hinge, temple, tip, mesh, ...ripples)
    motors.push({ mesh, mat, ripples, level: 0, phase: 0 })
  }
  const bridge = new Mesh(new TorusGeometry(0.2, 0.06, 16, 40, Math.PI), frameMat)
  bridge.position.set(0, 0.1, -0.02)

  /* ── 초음파 거리 센서(파란 기판 + 금속 원통 2개 + 핀 커넥터) · 카메라 모듈 ── */
  const board = new Mesh(
    new BoxGeometry(1.55, 0.62, 0.08),
    physical(C.board, { roughness: 0.5, clearcoat: 0.4 }),
  )
  board.position.set(0, 0.66, -0.16)
  const metal = physical(C.metal, { metalness: 1, roughness: 0.25, side: DoubleSide })
  const meshMat = new MeshStandardMaterial({ color: C.mesh, roughness: 0.95 })
  for (const s of [-1, 1]) {
    const can = new Mesh(new CylinderGeometry(0.26, 0.26, 0.28, 48, 1, true), metal)
    can.rotation.x = Math.PI / 2
    can.position.set(s * 0.43, 0.66, -0.34)
    const face = new Mesh(new CircleGeometry(0.25, 48), meshMat)
    face.rotation.y = Math.PI // 앞(-z)을 본다
    face.position.set(s * 0.43, 0.66, -0.46)
    model.add(can, face)
  }
  const header = new Mesh(new BoxGeometry(0.34, 0.16, 0.07), physical(C.black, { roughness: 0.5 }))
  header.position.set(0, 1.04, -0.16)
  const cam = new Mesh(new BoxGeometry(0.36, 0.28, 0.14), physical(C.black, { roughness: 0.45 }))
  cam.position.set(0, -0.14, -0.12)
  const camLens = new Mesh(
    new CylinderGeometry(0.075, 0.075, 0.07, 32),
    physical(0x22304a, { metalness: 0.4, roughness: 0.05 }),
  )
  camLens.rotation.x = Math.PI / 2
  camLens.position.set(0, -0.14, -0.22)
  const pulses = rings(0.34) // 센서 앞으로 나아가는 초음파
  const tex = shadowTexture()
  const shadow = new Mesh(
    new PlaneGeometry(7, 6),
    new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(0, -1, 1.3)
  model.add(bridge, board, header, cam, camLens, ...pulses, shadow)

  /* ── 앞에 보이는 장면: 머리 축을 둘러싼 원통 벽 (머리를 돌려도 장면은 그대로, 단계마다 바뀐다) ── */
  const R = 9
  const arc = 1600 * opts.rpu // 장면 폭 → 각도
  const fov = 800 * opts.rpu // 카메라 화면 폭 → 화각
  const H = 400 * opts.rpu * R
  const loader = new TextureLoader()
  const panoTex = opts.panos.map((url) => {
    const t = loader.load(url, () => draw())
    t.colorSpace = SRGBColorSpace
    t.repeat.x = -1 // 원통 안쪽에서 보므로 좌우를 뒤집는다 → 장면 오른쪽 = 착용자 오른쪽
    t.offset.x = 1
    return t
  })
  const panoMat = new MeshBasicMaterial({
    map: panoTex[0],
    side: BackSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  })
  const pano = new Mesh(new CylinderGeometry(R, R, H, 96, 1, true, Math.PI - arc / 2, arc), panoMat)
  pano.renderOrder = -2
  root.add(pano)

  // 카메라 화각: 지금 카메라 화면에 들어오는 벽의 범위 (머리와 함께 돈다)
  const wall = (th: number, y: number) => new Vector3((R - 0.06) * Math.sin(th), y, (R - 0.06) * Math.cos(th))
  const [a0, a1] = [Math.PI - fov / 2, Math.PI + fov / 2]
  const band = new Mesh(
    new CylinderGeometry(R - 0.06, R - 0.06, H, 48, 1, true, a0, fov),
    new MeshBasicMaterial({ color: C.sky, side: BackSide, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false }),
  )
  band.renderOrder = -1
  const edge: Vector3[] = []
  for (const y of [H / 2, -H / 2])
    for (let i = 0; i < 32; i++) edge.push(wall(a0 + (fov * i) / 32, y), wall(a0 + (fov * (i + 1)) / 32, y))
  for (const th of [a0, a1]) edge.push(wall(th, H / 2), wall(th, -H / 2))
  // 렌즈에서 화각 네 모서리로 뻗는 선 (렌즈 = 모형의 camLens 자리, 머리 좌표)
  const lensAt = new Vector3(0, -0.14, -0.22 + model.position.z)
  const rays = [a0, a1].flatMap((th) => [H / 2, -H / 2].flatMap((y) => [lensAt, wall(th, y)]))
  const line = (pts: Vector3[], opacity: number) =>
    new LineSegments(
      new BufferGeometry().setFromPoints(pts),
      new LineBasicMaterial({ color: C.blue, transparent: true, opacity, depthWrite: false, toneMapped: false }),
    )
  head.add(band, line(edge, 0.7), line(rays, 0.35))

  // HTML 라벨이 붙는 3D 지점 (모형 기준)
  const at: Record<Pin, Vector3> = {
    camera: new Vector3(0, -0.32, -0.16),
    sensor: new Vector3(0.8, 0.92, -0.2),
    L: new Vector3(-motorAt.x, 0.26, motorAt.z),
    R: new Vector3(motorAt.x, 0.26, motorAt.z),
  }

  /* ── 그리기 ── */
  let pose: Pose = { time: 0, yaw: 0, L: 0, R: 0, sensor: 0, still: true, stage: 0, aim: 0, world: 1 }
  let last = 0
  let sensorLevel = 0
  let sensorPhase = 0
  let w = 0
  let h = 0
  let view = 0 // 드래그로 돌린 양 (좌우)
  let vel = 0
  let pitch = 0 // 위아래 (마우스만: 터치의 세로 드래그는 페이지 스크롤)
  let drag: { x: number; y: number } | null = null

  const v = new Vector3()
  const ease = (from: number, to: number, dt: number) => from + (to - from) * (1 - Math.exp(-dt * 8))
  /** 링 하나: 진행도 p(0–1)에 따라 커지며 옅어진다 */
  const ring = (r: Mesh, p: number, opacity: number, grow: number) => {
    r.visible = opacity > 0.005
    ;(r.material as MeshBasicMaterial).opacity = (1 - p) * opacity
    r.scale.setScalar(1 + p * grow)
  }

  function draw() {
    if (!w || !h) return
    const p = pose
    const dt = p.still ? 0 : Math.min(Math.max(p.time - last, 0), 0.05)
    last = p.time
    if (dt > 0 && drag === null) {
      view += vel
      vel *= 0.9
      view = Math.atan2(Math.sin(view), Math.cos(view)) * 0.985 // 놓으면 천천히 뒤에서 보는 각도로 돌아온다
      pitch *= 0.985
    } else if (dt > 0) vel *= 0.8 // 잡은 채 멈추면 관성도 줄어든다
    root.rotation.set(pitch, view, 0)
    root.position.y = p.still ? 0 : Math.sin(p.time * 1.1) * 0.04
    head.rotation.y = p.yaw
    pano.rotation.y = p.aim // 목표(장면 가운데)가 있는 방향
    panoMat.map = panoTex[p.stage] ?? panoTex[0]
    panoMat.opacity = 0.92 * p.world

    motors.forEach((m, i) => {
      const s = i ? 1 : -1
      const target = i ? p.R : p.L
      m.level = p.still ? target : ease(m.level, target, dt)
      // 세질수록 물결이 크고 빠르다
      m.phase = (m.phase + dt / lerp(1.1, 0.5, m.level)) % 1
      const j = p.still ? 0 : 0.02 * m.level // 진동: 아주 작게 떨린다
      m.mesh.position.set(s * motorAt.x + Math.sin(p.time * 83) * j, motorAt.y + Math.sin(p.time * 71 + 1) * j, motorAt.z)
      m.mat.emissiveIntensity = 0.7 * m.level
      m.ripples.forEach((r, k) =>
        ring(r, p.still ? (k + 0.35) / 3 : (m.phase + k / 3) % 1, Math.min(1, m.level * 1.6) * 0.85, lerp(1.4, 3.2, m.level)),
      )
    })
    sensorLevel = p.still ? p.sensor : ease(sensorLevel, p.sensor, dt)
    sensorPhase = (sensorPhase + dt / 1.3) % 1
    pulses.forEach((r, k) => {
      const q = p.still ? (k + 0.35) / 3 : (sensorPhase + k / 3) % 1
      ring(r, q, 0.7 * sensorLevel * (1 - q), 0.6) // 멀어질수록 빨리 옅어져 무대 위쪽에서 잘리지 않게
      r.position.set(0, 0.66, -0.5 - q * 1.1)
    })

    renderer.render(scene, camera)

    for (const k of Object.keys(at) as Pin[]) {
      v.copy(at[k])
      model.localToWorld(v)
      v.project(camera)
      pins[k].style.transform = `translate(${(((v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - v.y) / 2) * h).toFixed(1)}px)`
    }
  }

  const resize = () => {
    w = canvas.clientWidth
    h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const k = Math.max(1, 1 / camera.aspect) // 세로로 긴 화면이면 뒤로 물러나 안경 전체가 들어오게
    camera.position.copy(eye).multiplyScalar(k).add(look)
    camera.lookAt(look)
    camera.updateProjectionMatrix()
    draw()
  }
  // 셰이더를 미리 컴파일 (처음엔 안 보이는 링까지) → 처음 울릴 때 멈칫하지 않게
  renderer.compile(scene, camera)
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // 드래그로 돌려 보기: 좌우는 모두, 위아래는 마우스만 (터치의 세로는 touch-action: pan-y로 페이지 스크롤)
  const down = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY }
    vel = 0
    canvas.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    if (drag === null) return
    vel = (e.clientX - drag.x) * 0.01
    view += vel
    if (e.pointerType === 'mouse') pitch = Math.min(0.5, Math.max(-0.2, pitch + (e.clientY - drag.y) * 0.006))
    drag = { x: e.clientX, y: e.clientY }
    draw()
  }
  const up = () => {
    drag = null
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)

  return {
    update(p) {
      pose = p
      draw()
    },
    dispose() {
      ro.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      free(scene)
      tex.dispose()
      for (const t of panoTex) t.dispose()
      env.dispose()
      renderer.dispose()
    },
  }
}
