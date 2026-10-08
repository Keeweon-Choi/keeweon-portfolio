// 발표 문구의 source of truth: keeweon-portfolio-context/ (CONTEXT.md, content/*.md)
// 문서에 없는 사실은 넣지 않는다. '*강조*' 표기는 파란색 강조로 렌더링된다.
// 내부 수치는 공개하지 않는다 (Edge AI는 normalized, Smart Glass FPS만 공개 가능).
import type { ChapterId } from './sections'

export type Tone = 'muted' | 'blue' | 'warn'

export type JourneyItem = {
  id: string
  project: string
  field: string
  tagline: string
  summary: string
  section?: ChapterId
  current?: boolean
  future?: boolean
}

export const journeyIntro = {
  kicker: '다섯 개의 프로젝트, 하나의 질문',
  question: '모델이 잘 동작해도, *실제 환경*에서는 어떤 문제가 생길까?',
  sub: '프로젝트를 거치며 관심이 모델 자체에서, 실제 환경에서 동작하는 시스템으로 넓어졌습니다.',
}

export const journey: JourneyItem[] = [
  {
    id: 'pill',
    project: 'Pill Identification',
    field: 'Object Detection',
    tagline: '모델을 실제 서비스로 연결하기',
    summary: '이미지에서 알약을 인식하고, 사용자가 결과를 확인할 수 있는 서비스까지 연결해본 프로젝트입니다.',
  },
  {
    id: 'edge-ai',
    project: 'Undergraduate Research',
    field: 'Edge AI',
    tagline: '모델을 제한된 하드웨어에서 빠르게 실행하기',
    summary: 'AI 모델을 제한된 하드웨어에서도 빠르고 안정적으로 실행하는 방법을 연구했습니다.',
    section: 'edge-ai',
  },
  {
    id: 'segmentation',
    project: 'Internship',
    field: 'Semantic Segmentation',
    tagline: '환경을 더 세밀하게 이해하기',
    summary:
      '현장실습에서 실시간 Semantic Segmentation 아키텍처들을 비교하고, 실제 적용 환경에 맞는 모델을 개발했습니다.',
    section: 'segmentation',
  },
  {
    id: 'smart-glass',
    project: 'Smart Glass',
    field: 'Real-time AI System',
    tagline: 'AI와 센서를 실제 사용자 시스템으로 연결하기',
    summary: '시각장애인의 버스 승차부터 하차까지를 돕는 AI 기반 스마트글래스 시스템을 개발했습니다.',
    section: 'smart-glass',
  },
  {
    id: 'neus',
    project: 'NEUS',
    field: 'NLP / LLM',
    tagline: '문제에 맞는 AI 기술로 서비스 만들기',
    summary:
      '같은 사건을 다룬 여러 언론의 보도를 모아 비교하고, 사실과 주장을 나눠 중립 기사로 재구성하는 뉴스 서비스입니다.',
    section: 'neus',
    current: true,
  },
  {
    id: 'next',
    project: 'Next',
    field: 'Robotics / Physical AI',
    tagline: 'Perception 경험을 로봇 시스템으로 확장하기',
    summary: '카메라 기반 Perception과 Edge AI 경험을 로봇 시스템으로 확장해 더 깊게 공부하고 싶습니다.',
    section: 'next',
    future: true,
  },
]

export const pill = {
  point: 'Object Detection을 처음 실제 서비스와 연결해본 경험',
  steps: [
    { label: '문제', text: '이미지에서 알약을 인식하고, 결과를 확인할 수 있는 서비스', tone: 'muted' },
    { label: '시도', text: 'Object Detection 모델을 모바일 기기에서 직접 실행', tone: 'muted' },
    { label: '문제 발생', text: '실제 모바일 환경의 배포 · 실행 제약', tone: 'warn' },
    { label: '해결', text: '서버 추론 + REST API 구조로 바꿔 End-to-End 서비스 완성', tone: 'blue' },
  ] satisfies { label: string; text: string; tone: Tone }[],
  screens: [
    { src: 'images/pill-capture.png', caption: '알약 촬영', alt: '앱에서 알약을 촬영하는 화면' },
    { src: 'images/pill-result.png', caption: '식별 결과', alt: '서버 추론 후 알약 탐지 결과가 표시된 앱 화면' },
  ],
}

export const edgeAI = {
  question: 'AI 모델을 *제한된 하드웨어*에서도 빠르게 실행할 수 있을까?',
  problem:
    '서버에서는 잘 동작하는 딥러닝 모델도, 임베디드 장치에서는 연산량과 메모리 제약 때문에 실시간 사용이 어려울 수 있습니다.',
  did: [
    { title: '실행 방식 변환', text: '동일한 모델을 여러 실행 방식으로 변환' },
    { title: '연산 정밀도 실험', text: '연산 정밀도를 낮추는 최적화 방법 실험' },
    { title: '실제 장치에서 비교', text: 'Edge device 위에서 처리 속도와 정확도를 함께 비교' },
  ],
  tech: ['ONNX', 'TensorRT', 'FP16', 'INT8'],
  result: {
    caption: 'Result — 처리 속도 (각 모델의 원본 = 1×)',
    // raw 수치 비공개: 모델마다 자기 원본 대비 몇 배인지만. 두 모델끼리는 비교하지 않는다
    baseline: '원본',
    // demo: 모델이 원래 무엇을 하는지 (고양이 · 개 사진). boxes = 사진 안 위치(%)
    models: [
      {
        name: 'ResNet101',
        method: 'TensorRT · INT8 Quantization',
        label: 'INT8',
        value: 3,
        demo: {
          src: 'images/catdog-classify.jpg',
          alt: '고양이 사진 한 장 전체에 cat이라는 라벨 하나를 붙이는 이미지 분류 예시',
          caption: '이미지 분류 — 사진 전체에 라벨 하나',
          tag: 'cat',
          boxes: [] as { label: string; x: number; y: number; w: number; h: number }[],
        },
      },
      {
        name: 'YOLOX-nano',
        method: 'TensorRT · FP16 변환',
        label: 'FP16',
        value: 5,
        demo: {
          src: 'images/catdog-detect.jpg',
          alt: '고양이와 개가 함께 있는 사진에서 각각의 위치를 박스로 찾는 객체 탐지 예시',
          caption: '객체 탐지 — 물체마다 위치(박스)와 라벨',
          tag: '',
          boxes: [
            { label: 'cat', x: 3.1, y: 36.7, w: 52.1, h: 58.3 },
            { label: 'dog', x: 39.6, y: 2.5, w: 57.8, h: 97.5 },
          ],
        },
      },
    ],
    credit: '사진: Arantz · CC BY-SA 3.0 (Wikimedia Commons)',
  },
  lesson: "최적화에서는 *'더 빠른가'*뿐 아니라 *'판단 성능이 유지되는가'*를 함께 봐야 한다.",
  robotics: '로봇이나 임베디드 장치는 연산 자원이 제한되어, 알고리즘뿐 아니라 실제 하드웨어에서의 효율도 중요합니다.',
}

export const segmentation = {
  title: 'Object Detection에서 *Scene Understanding*으로',
  summary: '현장실습에서 실시간 Semantic Segmentation 아키텍처들을 비교하고, 실제 적용 환경에 맞는 모델을 개발했습니다.',
  // 실제 주행 영상(Cityscapes) 위의 실시간 Semantic Segmentation 데모. 영상 = [카메라 | 예측] 좌우로 붙인 한 파일
  drive: {
    scenes: [
      { src: 'media/drive-seg-2.mp4', poster: 'media/drive-seg-2.jpg', label: '도심 · 보행자' },
      { src: 'media/drive-seg-1.mp4', poster: 'media/drive-seg-1.jpg', label: '대로 · 차량' },
    ],
    left: { tag: 'camera' },
    right: { tag: 'segmentation' },
    alt: '자동차 주행 영상과, 같은 영상을 도로 · 인도 · 차량 · 사람 · 건물 · 식생 · 하늘로 나눈 Semantic Segmentation 결과를 경계선으로 비교',
    legend: [
      { label: 'road', color: '#804080' },
      { label: 'sidewalk', color: '#f423e8' },
      { label: 'car', color: '#00008e' },
      { label: 'person', color: '#dc143c' },
      { label: 'building', color: '#464646' },
      { label: 'vegetation', color: '#6b8e23' },
      { label: 'sky', color: '#4682b4' },
    ],
  },
  concept: [
    { name: 'Object Detection', question: '무엇이 어디에 있는가?', unit: 'box 단위' },
    { name: 'Semantic Segmentation', question: '각 영역이 무엇인가?', unit: 'pixel 단위' },
  ],
  credit: 'Video: Cityscapes 주행 장면 · PIDNet 실시간 Semantic Segmentation 데모 (github.com/XuJiacong/PIDNet, MIT)',
  problem:
    '실제 시스템에서는 가장 정확한 모델이 항상 최선은 아니었습니다. 속도, 메모리, 하드웨어 제약을 함께 고려해야 했습니다.',
  did: '실시간 Semantic Segmentation 아키텍처들을 동일 조건에서 구현 · 학습하고 비교했습니다.',
  criteria: ['Accuracy', 'Speed', 'Resource usage'],
  models: ['BiSeNetV2', 'Fast-SCNN', 'STDC', 'PP-LiteSeg', 'DeepLabV3+'],
  result: '정확도와 처리 효율의 균형을 맞춰, 실제 적용 환경에 맞는 모델을 개발했습니다.',
  lesson: '*실제 사용 환경과 요구 조건*을 고려해서 개발해야 한다.',
  robotics: '로봇이 주변을 이해할 때도, 객체를 찾는 것뿐 아니라 공간과 영역을 세밀하게 인식하는 것이 중요합니다.',
}

export const smartGlass = {
  title: 'AI Model에서 *Real-time System*으로',
  goal: '시각장애인의 버스 승차부터 하차까지를 돕는 AI 기반 스마트글래스 시스템',
  usageLabel: '사용 흐름',
  usage: [
    { label: '버스 확인', en: 'Bus', icon: 'bus' },
    { label: '승차문', en: 'Door', icon: 'door' },
    { label: '카드단말기', en: 'Card reader', icon: 'card' },
    { label: '빈 좌석', en: 'Seat', icon: 'seat' },
    { label: '하차벨', en: 'Stop button', icon: 'bell' },
  ] as const,
  systemLabel: 'System flow',
  system: [
    { stage: '입력', label: 'Camera + Distance Sensor' },
    { stage: '인식', label: 'Visual Perception / OCR' },
    { stage: '판단', label: 'Decision' },
    { stage: '피드백', label: 'Voice + Vibration' },
  ],
  role: 'Vision AI 기반 사용자 모듈 전담',
  roleItems: ['카메라 기반 객체 인식', 'OCR', '거리 센서 연동', '진동 · 음성 피드백', 'Jetson 실시간 처리 파이프라인'],
  roleNote: '버스 · 정류장 간 예약 · 통신 모듈은 다른 팀원 담당',
  overview: {
    src: 'images/smartglass-overview.jpg',
    alt: '시스템 개요: ① 점자 키패드로 버스 예약 ② 기사 알림 ③ 정류장 진입 시 번호 음성 안내 ④ Vision AI 기반 승하차 유도',
    parts: [
      { no: '①', label: '점자 키패드로 버스 예약' },
      { no: '②', label: '기사 알림' },
      { no: '③', label: '정류장 진입 시 번호 음성 안내', mine: true },
      { no: '④', label: 'Vision AI 기반 승하차 유도', mine: true },
    ],
  },
  referencesLabel: '참고했던 기존 보조 기술의 한계',
  // 영상은 각 회사 공식 데모의 몇 초 인용 (출처 표기)
  references: [
    {
      name: '아이폰 감지 모드',
      limit: '문 등 일부 사물만 인식해, 승차부터 하차까지 버스 이용 전 과정을 지원하기 어려움',
      clip: {
        src: 'media/at-iphone-door.mp4',
        poster: 'media/at-iphone-door.jpg',
        alt: '아이폰 돋보기 앱의 감지 모드로 문을 비추자 닫힌 문까지의 거리와 문에 적힌 글자를 읽어 주는 장면',
        credit: 'Apple Newsroom · Door Detection 데모 (2022)',
      },
    },
    {
      name: '독서 보조 스마트글래스 · OrCam MyEye',
      limit: '손가락으로 가리킨 영역을 읽어주는 방식 — 보이지 않는 목표물을 먼저 가리켜야 함',
      clip: {
        src: 'media/at-orcam-point.mp4',
        poster: 'media/at-orcam-point.jpg',
        alt: '안경에 단 OrCam MyEye 앞에서 책의 읽을 부분을 손가락으로 가리키는 장면',
        credit: 'OrCam · MyEye 2 Tutorial – Reading Text',
      },
    },
  ],
  gap: '그래서 탑승 순간에서 끝나지 않고, *승차 – 결제 – 착석 – 하차*를 하나의 안내 흐름으로 설계했습니다.',
  tech: ['Jetson Orin Nano', 'YOLO11', 'EasyOCR', 'MediaPipe Hands', 'HC-SR04P', 'TTS'],
  awards: ['한국ITS학회 2025 추계학술대회 학부논문경진대회 우수상', '탄소중립 INNOVATION ACADEMY 대상'],
  // 종합설계 최종 발표 데모의 실사용 부분 (왼쪽 착용 모습 · 오른쪽 안경 카메라 화면, 영상 속 인물 = 본인)
  demo: {
    label: '실제 사용 영상',
    src: 'media/glass-demo.mp4',
    poster: 'media/glass-demo.jpg',
    alt: '스마트글래스를 쓰고 버스를 타는 실제 시연: 버스 번호, 승차문과 카드단말기, 빈 좌석, 하차벨을 차례로 인식하고 초음파 거리를 함께 표시하는 카메라 화면',
    caption: '안경 카메라 화면과 착용 모습 — 버스 번호 → 승차문 · 카드단말기 → 빈 좌석 → 하차벨 (STEP = 현재 단계, ULTRA = 초음파 거리 · 소리는 영상의 스피커 버튼으로)',
  },
  photos: {
    worn: { src: 'images/smartglass-worn.jpg', alt: '스마트글래스 시제품을 착용한 모습', caption: '시제품 착용' },
    hardware: {
      src: 'images/smartglass-hardware.jpg',
      alt: '안경 프레임에 카메라와 거리 센서를 부착한 시제품',
      caption: 'Camera + Distance Sensor',
      // 4:5로 가운데를 잘라 보여줄 때 기준 위치(%)
      boxes: [
        { label: 'distance sensor', x: 23, y: 17, w: 68, h: 28 },
        { label: 'camera', x: 48, y: 50, w: 18, h: 9 },
      ],
    },
  },
}

export type PipelineNode = { name: string; note?: string; tone?: Tone }

// 안경이 실제로 안내하는 방식 (예시 애니메이션). 사용자 시점 = 카메라 화면 정중앙(고정).
// 박스가 중심의 어느 쪽에 있는지 → 그쪽 진동, 중심이 박스에 가까울수록 → 양쪽 진동이 강하게, 거리 → 음성(TTS).
// 거리 기준값 · 진동 세기 수치 · 실제 음성 문장은 넣지 않는다. 목표가 나타나는 좌우(side)는 설명용 예시다.
export const guide = {
  label: 'How it guides',
  heading: '방향은 *좌우 진동*으로, 거리는 *음성*으로',
  text: '사용자의 시점은 카메라 화면의 정중앙에 고정됩니다. 지금 단계의 목표를 찾으면(YOLO 객체 탐지), 박스가 중심의 어느 쪽에 있는지는 진동으로, 거리는 음성으로 알려줍니다.',
  legend: [
    { key: '방향', to: '박스가 있는 쪽 진동', note: '박스가 화면 중심보다 왼쪽이면 왼쪽, 오른쪽이면 오른쪽 모터' },
    { key: '중심에 가까울수록', to: '양쪽 진동이 강하게', note: '시점이 박스 중심에 가까워지면 양쪽이 함께, 맞춰지면 가장 강하게' },
    { key: '거리', to: '음성 (TTS)', note: '카메라와 초음파 거리 센서로 판단한 거리를 음성으로 안내' },
  ],
  // smartGlass.usage와 같은 순서: 단계마다 찾는 목표. box = 카메라 장면(1600×400, components/glass/views)에서의 위치
  targets: [
    { name: '버스', side: 'L', box: { x: 532, y: 160, w: 536, h: 202 } },
    { name: '승차문', side: 'R', box: { x: 735, y: 32, w: 130, h: 340 } },
    { name: '카드단말기', side: 'L', box: { x: 758, y: 166, w: 84, h: 108 } },
    { name: '빈 좌석', side: 'R', box: { x: 740, y: 190, w: 120, h: 150 } },
    { name: '하차벨', side: 'L', box: { x: 780, y: 210, w: 40, h: 44 } },
  ] satisfies { name: string; side: 'L' | 'R'; box: { x: number; y: number; w: number; h: number } }[],
  view: { label: 'Camera view', center: '시점 = 화면 중심' },
  voice: '거리 음성 안내',
  pins: { camera: 'Camera', sensor: 'Distance Sensor', L: 'Vibration L', R: 'Vibration R' },
  hint: 'drag ⟲ 회전',
  alt: '스마트글래스 3D 모형을 착용자 뒤에서 본 모습. 카메라 화면 중심(사용자 시점)보다 목표 박스가 왼쪽에 있으면 왼쪽, 오른쪽에 있으면 오른쪽 진동 모터가 울리고, 머리를 돌려 중심이 박스에 가까워질수록 양쪽 모터가 함께 더 강하게 진동한다. 맞춰지면 거리를 음성으로 안내하는 예시 애니메이션. 드래그해서 돌려볼 수 있다.',
  note: '안내 방식을 보여주는 예시 애니메이션 (목표 위치 · 진동 세기 표현은 예시)',
}

export const redesign = {
  kicker: 'Redesign',
  heading: '2–3 FPS에서 *15 FPS+*로',
  // 고정 패널에 그리는 두 상태 (0: 초기 설계, 1: 재설계)
  states: [
    {
      tab: '초기 설계',
      fps: '2–3',
      lit: 2.5, // 1초 동안 처리한 프레임 시각화 (2–3 FPS)
      input: [{ name: 'Camera' }] as PipelineNode[],
      selector: undefined as PipelineNode | undefined,
      modules: [
        { name: 'Hand Tracking', note: 'CPU · 병목', tone: 'warn' },
        { name: 'Object Detection', note: 'GPU' },
      ] as PipelineNode[],
      group: { label: '손 추적 + 객체 탐지 동시 구동', note: 'CPU–GPU 파이프라인 병목', tone: 'warn' as Tone },
      output: [{ name: 'OCR' }, { name: 'Feedback' }] as PipelineNode[],
    },
    {
      tab: '재설계',
      fps: '15+',
      lit: 15,
      input: [{ name: 'Camera' }, { name: 'Distance Sensor' }] as PipelineNode[],
      selector: { name: '현재 단계', note: '버스 → 승차문 → … → 하차벨', tone: 'blue' } as PipelineNode | undefined,
      modules: [
        { name: 'Object Detection', note: '단계별 필요한 class만' },
        { name: 'OCR', note: '호출 주기 조정' },
        { name: '최근 탐지 결과 유지' },
      ] as PipelineNode[],
      group: { label: '필요한 것만 실행', note: '해상도 · 기준값 조정', tone: 'blue' as Tone },
      output: [{ name: 'Decision', note: 'Vision + 거리 센서' }, { name: 'Voice · Vibration' }] as PipelineNode[],
    },
  ],
  // 스크롤하며 읽는 텍스트 단계. state = 이 단계에서 패널이 보여줄 상태
  story: [
    {
      state: 0,
      label: 'Initial Design',
      tone: 'warn' as Tone,
      title: '손으로 가리킨 대상을 인식하는 구조',
      text: '처음에는 손가락으로 가리킨 영역을 읽어주는 독서 보조 스마트글래스를 참고해, 손 추적으로 사용자가 가리킨 대상을 인식하는 구조를 구현했습니다.',
      listLabel: '실제 시스템에서 생긴 문제',
      list: [
        '손 추적(CPU)과 객체 탐지(GPU)를 함께 구동 → 2–3 FPS',
        '손 추적이 CPU–GPU 파이프라인의 병목',
        '보이지 않는 목표물을 먼저 가리켜야 하는 사용성 문제',
      ],
    },
    {
      state: 1,
      label: 'Redesign',
      tone: 'blue' as Tone,
      title: '현재 상황에서 *꼭 필요한 정보만* 처리하자',
      text: '손 추적을 빼고 객체 탐지 · 거리 센싱 · 진동 피드백 중심으로 다시 설계해, 사용자가 지금 있는 단계에 필요한 것만 처리하도록 했습니다.',
      listLabel: '바꾼 것',
      list: [
        '단계별 필요한 객체만 탐지',
        'OCR 호출 주기 조정',
        '최근 탐지 결과 유지',
        '작은 객체에 맞춰 해상도 · 기준값 조정',
        '거리 센서와 Vision 결과 결합',
      ],
    },
    {
      state: 1,
      label: 'Result',
      tone: 'blue' as Tone,
      title: '2–3 FPS → *15 FPS+*',
      detect: true, // 결과 수치를 탐지 박스로 잡는다
      text: '실제 사용에서 병목을 발견하고 구조를 다시 설계해, 실시간 사용 수준으로 개선했습니다.',
      quote:
        '모델 하나를 개선하는 것보다, *실제 사용 환경을 이해하고 시스템 구조 전체를 다시 설계하는 것*이 더 중요한 경우도 있었다.',
    },
  ],
  fpsLabel: 'FPS',
  stripLabel: '1초 동안 처리하는 프레임',
}

export const neus = {
  status: '진행 중',
  title: 'Current Project — *NEUS*',
  intro:
    '같은 사건을 다룬 여러 언론사의 보도를 모아 비교하고, 사실과 주장을 나눠 출처가 남는 중립 기사로 재구성하는 뉴스 서비스입니다.',
  tagline: '같은 사건, 다른 보도 · 사실과 주장을 나눠 봅니다',
  role: 'AI 엔진 1인 전담',
  shift: {
    beforeLabel: '지금까지',
    before: ['Object Detection', 'Edge AI', 'Semantic Segmentation', 'Real-time AI System'],
    beforeNote: 'Computer Vision 중심',
    nowLabel: 'NEUS',
    now: 'NLP / LLM',
  },
  flow: [
    {
      label: 'Problem',
      text: '같은 사건도 매체마다 다르게 전한다',
      detail: '무엇이 공통 사실이고 무엇이 주장 · 평가인지 구분하기 어렵다',
    },
    {
      label: 'NLP / LLM',
      text: '원문 수집 → 표현 판정 → 중립 재작성',
      detail: '원문 문장 추출형 생성 + 규칙 기반 검증, 문장마다 근거 기사를 표시',
    },
    {
      label: 'Product',
      text: '사건별 언론사 비교 · 중립 기사',
      detail: '공통 사실 · 표현이 갈리는 지점 · 원문 대조를 한 화면에',
    },
  ],
  screens: [
    {
      src: 'images/neus-compare.jpg',
      alt: 'NEUS 언론사별 비교 화면: 분석 기사 19건, 언론사 18곳, 공통 사실 22개, 원문 대조 통과',
      caption: '언론사별 비교',
    },
    { src: 'images/neus-about.jpg', alt: 'NEUS 소개 화면: 같은 사건, 다른 보도', caption: 'NEUS란?' },
    {
      src: 'images/neus-article.jpg',
      alt: 'NEUS 중립 기사 화면: 세 줄 요약과 문장별 보도 언론사 수',
      caption: '중립 기사',
    },
  ],
  url: 'dev.neus.day',
  message:
    '특정 AI 분야에 한정되지 않고, *문제를 정의하고 필요한 기술을 선택해 실제 제품으로 구현하는 경험*을 넓히고 있습니다.',
}
