// 발표 순서 = 이 배열 순서. steps가 있는 섹션은 → 키가 섹션 안에서 먼저 한 단계씩 진행된다.
const list = [
  { id: 'about', label: 'About', head: 'About Me' },
  { id: 'journey', label: 'Journey', head: 'My Journey', steps: 2 },
  { id: 'edge-ai', label: 'Edge AI', head: 'Undergraduate Research', aside: 'Edge AI' },
  { id: 'segmentation', label: 'Segmentation', head: 'Internship', aside: 'Semantic Segmentation' },
  { id: 'smart-glass', label: 'Smart Glass', head: 'Smart Glass', aside: 'Main Project' },
  { id: 'redesign', label: 'Redesign', head: 'Smart Glass · Redesign', aside: 'Real-time AI System', steps: 2 },
  { id: 'neus', label: 'NEUS', head: 'Current Project', aside: 'NLP / LLM' },
  { id: 'next', label: "What's Next", head: "What's Next", aside: 'Robotics · Physical AI' },
  { id: 'thanks', label: 'Q&A', head: 'Q & A' },
] as const

export type SectionId = (typeof list)[number]['id']

export const sections: readonly { id: SectionId; label: string; head: string; aside?: string; steps?: number }[] = list
