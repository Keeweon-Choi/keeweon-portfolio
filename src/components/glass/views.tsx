// 카메라 화면의 장면 그림 (단계마다 하나). 장면은 1600×400이고 카메라에는 가운데 800×400만 보인다.
// 목표 물체는 늘 장면 가운데(x = 800)에 두고, 머리를 돌리면 장면이 좌우로 밀려 물체가 화면 중심으로 온다.
// 사진이 아니라 그림이다 (실제 현장 사진 아님).

const glass = (
  <linearGradient id="cv-glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#2c4157" />
    <stop offset="0.5" stopColor="#4d6984" />
    <stop offset="1" stopColor="#263a4f" />
  </linearGradient>
)

/* ───────────── 바깥: 하늘 · 건물 · 도로 ───────────── */

const buildings: [number, number, number, string][] = [
  [-20, 170, 150, '#a9b8c6'],
  [140, 120, 210, '#9aacbd'],
  [250, 190, 120, '#b4c1cd'],
  [430, 140, 190, '#a2b3c3'],
  [560, 210, 140, '#b8c4cf'],
  [760, 130, 220, '#9dafc0'],
  [880, 180, 160, '#afbdca'],
  [1050, 150, 200, '#a0b1c1'],
  [1190, 220, 130, '#b6c3ce'],
  [1400, 140, 180, '#a6b6c5'],
  [1530, 120, 150, '#b1bfcb'],
]

function Outside({ ground = 270 }: { ground?: number }) {
  return (
    <>
      <defs>
        <linearGradient id="cv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7ddee" />
          <stop offset="1" stopColor="#edf3f8" />
        </linearGradient>
        <pattern id="cv-win" width="26" height="30" patternUnits="userSpaceOnUse">
          <rect x="5" y="7" width="14" height="15" fill="#e3ebf1" />
        </pattern>
      </defs>
      <rect width="1600" height="400" fill="url(#cv-sky)" />
      {buildings.map(([x, w, h, c]) => (
        <g key={x}>
          <rect x={x} y={ground - h} width={w} height={h} fill={c} />
          <rect x={x + 6} y={ground - h + 8} width={w - 12} height={h - 14} fill="url(#cv-win)" opacity="0.55" />
        </g>
      ))}
      {/* 가로수 */}
      {[60, 380, 700, 1010, 1340].map((x) => (
        <g key={x}>
          <rect x={x - 3} y={ground - 46} width="6" height="46" fill="#6b5a48" />
          <circle cx={x} cy={ground - 62} r="30" fill="#7f9f7a" />
          <circle cx={x - 18} cy={ground - 50} r="20" fill="#86a780" />
        </g>
      ))}
      {/* 도로 · 연석 · 보도 */}
      <rect y={ground} width="1600" height={400 - ground} fill="#5d656e" />
      <path d={`M0 ${ground + 34} H1600`} stroke="#ece4c6" strokeWidth="3" strokeDasharray="44 38" />
    </>
  )
}

function Sidewalk({ y }: { y: number }) {
  return (
    <>
      <rect y={y} width="1600" height="8" fill="#c8cdd2" />
      <rect y={y + 8} width="1600" height={400 - y} fill="#d8dbdf" />
      {Array.from({ length: 21 }, (_, i) => (
        <path key={i} d={`M${i * 80 - 20} ${y + 8} L${i * 80 - 60} 400`} stroke="#c7cbd0" strokeWidth="2" />
      ))}
    </>
  )
}

/** 시내버스 옆모습 (앞이 왼쪽). 520×162, 바퀴 포함 높이 ≈ 190 */
function Bus() {
  const pane = (x: number, w: number) => (
    <g key={x}>
      <rect x={x} y="26" width={w} height="62" rx="3" fill="url(#cv-glass)" />
      <path d={`M${x + 8} 32 L${x + w * 0.45} 32 L${x + 8} 72 Z`} fill="#ffffff" opacity="0.12" />
    </g>
  )
  const door = (x: number) => (
    <g>
      <rect x={x} y="22" width="54" height="140" rx="3" fill="#1d2b3a" />
      <rect x={x + 4} y="28" width="21" height="128" rx="2" fill="url(#cv-glass)" />
      <rect x={x + 29} y="28" width="21" height="128" rx="2" fill="url(#cv-glass)" />
      <path d={`M${x + 8} 34 L${x + 18} 34 L${x + 8} 90 Z`} fill="#ffffff" opacity="0.14" />
      <path d={`M${x + 33} 34 L${x + 43} 34 L${x + 33} 90 Z`} fill="#ffffff" opacity="0.14" />
    </g>
  )
  return (
    <g>
      <ellipse cx="262" cy="190" rx="270" ry="9" fill="#000" opacity="0.2" />
      <rect width="520" height="166" rx="16" fill="#2f6db5" />
      <rect width="520" height="17" rx="9" fill="#e8edf2" />
      <rect x="4" y="20" width="512" height="74" rx="6" fill="#1b2735" />
      {/* 앞유리 · 행선지 LED */}
      <path d="M6 22 H60 V150 H16 Q6 150 6 138 Z" fill="url(#cv-glass)" />
      <path d="M12 30 L40 30 L12 96 Z" fill="#ffffff" opacity="0.13" />
      <rect x="10" y="3" width="48" height="12" rx="2" fill="#151515" />
      <text x="34" y="13" fontSize="10" fill="#ffb347" textAnchor="middle" fontFamily="monospace" fontWeight="700">
        511
      </text>
      {[124, 194, 360, 430].map((x) => pane(x, 64))}
      {pane(260, 34)}
      {door(66)}
      {door(300)}
      <rect y="118" width="520" height="7" fill="#e8edf2" opacity="0.85" />
      <rect x="4" y="138" width="11" height="8" rx="2" fill="#fff3c2" />
      <rect x="510" y="136" width="8" height="10" rx="2" fill="#d9483b" />
      {/* 바퀴 */}
      {[118, 430].map((x) => (
        <g key={x}>
          <path d={`M${x - 36} 166 A36 36 0 0 1 ${x + 36} 166 Z`} fill="#1d2730" />
          <circle cx={x} cy="168" r="25" fill="#23272c" />
          <circle cx={x} cy="168" r="11" fill="#9aa4ae" />
        </g>
      ))}
    </g>
  )
}

/** 1. 정류장에 들어오는 버스 */
export function Street() {
  return (
    <>
      <defs>{glass}</defs>
      <Outside />
      {/* 정류장 쉘터 · 표지판 */}
      <g>
        <rect x="236" y="186" width="190" height="10" rx="2" fill="#5b6876" />
        <rect x="244" y="196" width="6" height="150" fill="#6c7886" />
        <rect x="412" y="196" width="6" height="150" fill="#6c7886" />
        <rect x="252" y="204" width="158" height="96" fill="#d6e4ee" opacity="0.7" />
        <rect x="262" y="312" width="138" height="8" rx="2" fill="#7b8794" />
        <rect x="468" y="200" width="5" height="146" fill="#6c7886" />
        <circle cx="470" cy="196" r="17" fill="#2b5f8c" />
        <rect x="458" y="190" width="24" height="12" rx="2" fill="#ffffff" opacity="0.9" />
      </g>
      <g transform="translate(540 168)">
        <Bus />
      </g>
      <Sidewalk y={348} />
    </>
  )
}

/** 2. 가까이 다가간 버스 옆면: 앞문이 가운데 */
export function Door() {
  return (
    <>
      <defs>{glass}</defs>
      <Outside ground={250} />
      {/* 앞문(버스 좌표 66–120)이 x = 800에 오도록 2.3배 */}
      <g transform="translate(587 -14) scale(2.3)">
        <Bus />
      </g>
      <Sidewalk y={366} />
      {/* 문 위 승하차 표시등 */}
      <rect x="784" y="34" width="32" height="7" rx="3" fill="#7be08f" />
    </>
  )
}

/* ───────────── 버스 안 ───────────── */

function Cabin() {
  return (
    <>
      <defs>
        <linearGradient id="cv-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe2ef" />
          <stop offset="0.6" stopColor="#dbe7ee" />
          <stop offset="1" stopColor="#b9c6cf" />
        </linearGradient>
      </defs>
      <rect width="1600" height="400" fill="#e6e9ed" />
      {/* 창 밖 (흐릿한 거리) */}
      <rect y="56" width="1600" height="134" fill="url(#cv-out)" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 100 + 20} y={130 - (i % 3) * 22} width="70" height={60 + (i % 3) * 22} fill="#b3c3cf" opacity="0.55" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 200 - 6} y="56" width="12" height="134" fill="#c8ced5" />
      ))}
      <rect y="186" width="1600" height="10" fill="#cfd5db" />
      {/* 천장 · 조명 · 손잡이 봉 */}
      <rect width="1600" height="34" fill="#d2d7dd" />
      <rect y="30" width="1600" height="6" fill="#f8fafc" />
      <rect y="44" width="1600" height="5" rx="2" fill="#b8bfc7" />
      {/* 바닥 */}
      <rect y="338" width="1600" height="62" fill="#7f858c" />
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${i * 42} 338 l-26 62`} stroke="#767c83" strokeWidth="3" />
      ))}
    </>
  )
}

const Pole = ({ x }: { x: number }) => <rect x={x - 7} y="44" width="14" height="296" rx="5" fill="#f0c233" />

const Strap = ({ x }: { x: number }) => (
  <g>
    <rect x={x - 3} y="46" width="6" height="34" fill="#e7e9ec" />
    <circle cx={x} cy="90" r="10" fill="none" stroke="#e7e9ec" strokeWidth="5" />
  </g>
)

const tones = ['#6b7480', '#7d7366', '#5d6b7d', '#7a6f80', '#6a7a6f']

/** 정면에서 본 좌석. who면 승객이 앉아 있다 */
function Seat({ x, who }: { x: number; who?: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="-54" y="196" width="108" height="114" rx="16" fill="#3b5b9a" />
      <rect x="-54" y="196" width="108" height="28" rx="14" fill="#dde2e8" />
      <rect x="-58" y="294" width="116" height="22" rx="9" fill="#33508a" />
      <rect x="-4" y="316" width="8" height="24" fill="#9aa1a9" />
      {who !== undefined && (
        <g fill={tones[who % tones.length]}>
          <circle cx="0" cy="206" r="19" />
          <path d="M-34 300 Q-36 236 0 232 Q36 236 34 300 Z" />
          <rect x="-26" y="296" width="20" height="44" rx="6" />
          <rect x="6" y="296" width="20" height="44" rx="6" />
        </g>
      )}
    </g>
  )
}

/** 3. 앞문 옆 기둥의 교통카드 단말기 */
export function Reader() {
  return (
    <>
      <defs>{glass}</defs>
      <Cabin />
      {/* 운전석 쪽: 앞유리 · 계기판 · 칸막이 */}
      <rect x="60" y="56" width="460" height="214" rx="8" fill="#d9e8f2" />
      <rect x="60" y="250" width="460" height="54" rx="6" fill="#3a424c" />
      <circle cx="300" cy="262" r="40" fill="none" stroke="#2a3038" strokeWidth="10" />
      <rect x="520" y="120" width="110" height="218" rx="6" fill="#55606c" opacity="0.85" />
      {/* 앞문 (안에서 본 유리문 · 계단) */}
      <rect x="1000" y="60" width="190" height="278" rx="4" fill="#2a3a4c" />
      <rect x="1008" y="68" width="83" height="262" rx="3" fill="url(#cv-glass)" />
      <rect x="1099" y="68" width="83" height="262" rx="3" fill="url(#cv-glass)" />
      <rect x="990" y="330" width="210" height="10" fill="#e3b72c" />
      <Pole x={980} />
      <Strap x={700} />
      <Strap x={1300} />
      {/* 카드 단말기 */}
      <Pole x={800} />
      <g>
        <rect x="764" y="172" width="72" height="96" rx="10" fill="#47515c" />
        <rect x="772" y="182" width="56" height="30" rx="4" fill="#79d3a5" />
        <rect x="776" y="186" width="30" height="4" rx="2" fill="#d9f6e6" />
        <circle cx="800" cy="242" r="15" fill="#2e353d" />
        <path d="M792 242 a8 8 0 0 1 16 0 M796 242 a4 4 0 0 1 8 0" fill="none" stroke="#9fb0bf" strokeWidth="2" />
      </g>
      <Seat x={1420} who={1} />
    </>
  )
}

/** 4. 빈 좌석 (가운데만 비었다) */
export function Seats() {
  return (
    <>
      <Cabin />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Strap key={i} x={i * 180 - 20} />
      ))}
      {[160, 320, 480, 640, 800, 960, 1120, 1280, 1440].map((x, i) =>
        x === 800 ? <Seat key={x} x={x} /> : <Seat key={x} x={x} who={i} />,
      )}
      <Pole x={560} />
      <Pole x={1040} />
    </>
  )
}

/** 5. 뒷문 앞 기둥의 하차벨 (작은 목표) */
export function Bell() {
  return (
    <>
      <defs>{glass}</defs>
      <Cabin />
      {[200, 360, 520].map((x, i) => (
        <Seat key={x} x={x} who={i + 2} />
      ))}
      {/* 뒷문 */}
      <rect x="1040" y="60" width="190" height="278" rx="4" fill="#2a3a4c" />
      <rect x="1048" y="68" width="83" height="262" rx="3" fill="url(#cv-glass)" />
      <rect x="1139" y="68" width="83" height="262" rx="3" fill="url(#cv-glass)" />
      <rect x="1030" y="330" width="210" height="10" fill="#e3b72c" />
      <Seat x={1420} who={4} />
      <Strap x={680} />
      <Strap x={940} />
      <Pole x={1010} />
      {/* 하차벨 */}
      <Pole x={800} />
      <rect x="784" y="214" width="32" height="36" rx="6" fill="#3d454e" />
      <rect x="788" y="218" width="24" height="22" rx="4" fill="#d9483b" />
      <text x="800" y="248" fontSize="6.5" fill="#f2f4f6" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">
        STOP
      </text>
    </>
  )
}
