// 출처: keeweon-portfolio-context/content/ABOUT.md, FUTURE.md + 사용자가 직접 준 About 정보(2026-10-08)
// 이미지는 public/ 기준 경로. 같은 이름으로 파일만 바꾸면 교체된다.

export const profile = {
  nameKo: '최기원',
  nameEn: 'Keeweon Choi',
  affiliation: '인하대학교 컴퓨터공학과',
  statement: '*현실에서 동작하는 AI*로, 사람들이 겪는 문제를 해결하고 싶습니다.',
  keywords: ['Computer Vision', 'Edge AI', 'Real-world AI Systems'],
  intro:
    '학부 과정에서 Computer Vision과 Edge AI를 중심으로 공부했고, 모델 자체의 성능뿐 아니라 실제 하드웨어와 시스템에서 제대로 동작시키는 과정에 관심을 가져왔습니다.',
  facts: [
    { label: '이름', value: '최기원 · Keeweon Choi' },
    { label: '생년월일', value: '2000.07.19' },
    { label: '학력', value: '인하대학교 컴퓨터공학과 졸업', note: '2026.08.21' },
    { label: 'MBTI', value: 'ISTJ' },
    { label: '취미', value: '볼링 · 탁구' },
  ],
  photo: 'images/profile.jpg',
  emblem: 'images/inha-emblem.png',
  hobbyPhotos: [
    { src: 'images/bowling.jpg', alt: '볼링장 점수판', caption: '볼링' },
    { src: 'images/tabletennis.jpg', alt: '제41회 전국대학동호인연맹배 탁구대회 단체 사진', caption: '탁구' },
  ],
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
  // clip: 공개 라이선스 시연 영상 몇 초 (출처 표기)
  interests: [
    {
      title: 'Robust Perception',
      text: '실제 환경 변화에서도 안정적으로 동작하는 인식',
      clip: {
        src: 'media/interest-robust.mp4',
        poster: 'media/interest-robust.jpg',
        alt: '짙은 안개 속 교차로를 스테레오 · 게이티드 · 열화상 카메라로 함께 보는 장면',
        credit: 'SeeingThroughFog (Princeton · MIT)',
        fit: 'object-cover object-top',
      },
    },
    {
      title: 'Sensor Fusion / 3D Perception',
      text: '카메라뿐 아니라 여러 센서를 활용한 환경 이해',
      clip: {
        src: 'media/interest-fusion.mp4',
        poster: 'media/interest-fusion.jpg',
        alt: '여섯 대의 카메라와 LiDAR를 합쳐 위에서 본 지도(BEV)에 주변 물체와 도로를 그리는 장면',
        credit: 'BEVFusion (MIT HAN Lab · Apache-2.0)',
        fit: 'object-contain',
      },
    },
    {
      title: 'On-device Robotics',
      text: '제한된 연산 환경에서도 실시간으로 동작하는 perception',
      clip: {
        src: 'media/interest-ondevice.mp4',
        poster: 'media/interest-ondevice.jpg',
        alt: '스마트폰을 두뇌로 쓰는 작은 로봇 자동차가 트랙을 스스로 따라 달리는 장면',
        credit: 'OpenBot (Intel · MIT)',
        fit: 'object-cover',
      },
    },
  ],
  statement:
    '지금까지는 카메라 기반 Perception과 Edge AI를 중심으로 경험했습니다. 앞으로는 이를 로봇 시스템으로 확장해, 여러 센서로 주변 환경을 이해하고 제한된 연산 환경에서도 안정적으로 실시간 동작하는 Perception system을 더 깊게 공부하고 싶습니다.',
}

export const closing = {
  title: '감사합니다.',
  en: 'Thank you',
}
