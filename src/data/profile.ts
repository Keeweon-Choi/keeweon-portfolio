// 출처: keeweon-portfolio-context/content/ABOUT.md, FUTURE.md
// 이미지는 public/ 기준 경로. 같은 이름으로 파일만 바꾸면 교체된다.

export const profile = {
  nameKo: '최기원',
  nameEn: 'Keeweon Choi',
  affiliation: '인하대학교 컴퓨터공학과',
  keywords: ['Computer Vision', 'Edge AI', 'Real-world AI Systems'],
  intro:
    '학부 과정에서 Computer Vision과 Edge AI를 중심으로 공부했고, 모델 자체의 성능뿐 아니라 실제 하드웨어와 시스템에서 제대로 동작시키는 과정에 관심을 가져왔습니다.',
  trait: '문제가 생기면 원인을 하나씩 좁혀가며 직접 확인하고 해결하는 편입니다.',
  hobbies: 'bowling · workout · automating annoying things',
  photo: 'images/profile.jpg',
  emblem: 'images/inha-emblem.png',
}

export const future = {
  title: 'From Perception to *Robotics*',
  flow: [
    { label: 'Visual Perception' },
    { label: 'Edge AI' },
    { label: 'Real-time AI Systems' },
    { label: 'Robotics · Physical AI', next: true },
  ],
  sofar: '지금까지의 경험',
  ahead: '앞으로',
  aheadNote: '인식이 판단과 행동으로 이어지는 전체 시스템',
  interestsLabel: '앞으로 공부하고 싶은 방향',
  interests: [
    { title: 'Robust Perception', text: '실제 환경 변화에서도 안정적으로 동작하는 인식' },
    { title: 'Sensor Fusion / 3D Perception', text: '카메라뿐 아니라 여러 센서를 활용한 환경 이해' },
    { title: 'On-device Robotics', text: '제한된 연산 환경에서도 실시간으로 동작하는 perception' },
  ],
  statement:
    '지금까지는 카메라 기반 Perception과 Edge AI를 중심으로 경험했습니다. 앞으로는 이를 로봇 시스템으로 확장해, 여러 센서로 주변 환경을 이해하고 제한된 연산 환경에서도 안정적으로 실시간 동작하는 Perception system을 더 깊게 공부하고 싶습니다.',
}

export const closing = {
  title: '감사합니다.',
  en: 'Thank you',
  note: '질문이나 조언 편하게 부탁드립니다.',
}
