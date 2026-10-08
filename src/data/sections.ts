// 페이지 순서 = 이 배열 순서. 표지의 목차 · 상단 메뉴 · ←/→ 이동이 모두 이 목록을 쓴다.
const list = [
  { id: 'about', label: 'About Me', toc: '인하대 컴퓨터공학과 · ISTJ · 볼링과 탁구' },
  { id: 'journey', label: 'My Journey', toc: 'Object Detection에서 NLP / LLM까지' },
  { id: 'edge-ai', label: 'Edge AI', kicker: 'Undergraduate Research', toc: 'AI 모델을 제한된 하드웨어에서 빠르게' },
  {
    id: 'segmentation',
    label: 'Segmentation',
    kicker: 'Internship',
    toc: 'Object Detection에서 Scene Understanding으로',
  },
  {
    id: 'smart-glass',
    label: 'Smart Glass',
    kicker: 'Main Project',
    toc: '시각장애인 버스 승하차 보조 · 2–3 → 15+ FPS',
  },
  { id: 'neus', label: 'NEUS', kicker: 'Current Project', toc: '사건 단위로 여러 언론 보도를 비교하는 중립 뉴스 서비스' },
  { id: 'next', label: "What's Next", toc: 'From Perception to Robotics' },
] as const

export type ChapterId = (typeof list)[number]['id']

export const chapters: readonly { id: ChapterId; label: string; kicker?: string; toc: string }[] = list

/** ←/→ 이동 지점: 표지 → 각 챕터 → 마무리 */
export const stops = ['top', ...list.map((c) => c.id), 'thanks'] as const
