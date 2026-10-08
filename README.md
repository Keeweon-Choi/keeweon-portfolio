# Keeweon Choi — Portfolio / Lab Meeting Deck (v0.1)

자기소개 웹 프레젠테이션이자, 개인 포트폴리오로 확장할 코드베이스.
React · Vite · TypeScript · Tailwind CSS v4 · Motion. 외부 API 호출 없음(폰트까지 번들) → 오프라인에서도 동일하게 동작.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # build 결과 확인 (http://localhost:4173)
npm run lint
```

## 둘러보기

스크롤로 읽어 내려가는 한 페이지 사이트다(휠 hijacking 없음).

- **표지 = 목차**: 맨 위 표지 오른쪽의 Contents에서 각 챕터로 이동한다.
- **어디서든 목차로**: 상단 바의 `목차` 버튼, 각 챕터 머리의 `↑ 목차`, 마지막의 `목차로 돌아가기`.
- **상단 바**: 지금 읽는 챕터 표시 + 읽은 만큼 차오르는 진행선. 현재 챕터는 URL hash(`#smart-glass` 등)에 남아 새로고침해도 유지된다.
- **키보드**: `←` / `→` = 이전 / 다음 챕터. `Space` · `PageDown` · 휠은 브라우저 기본 스크롤.
- **인터랙션**: Journey 타임라인(스크롤하면 선이 차오름) · Segmentation 비교 슬라이더(드래그, 키보드 ←/→) · Smart Glass 스크롤 스토리(2–3 FPS → 15+ FPS).
- `prefers-reduced-motion`이면 움직임 없이 바로 최종 상태로 보인다.

## 구조

```
src/
  data/        문구 (sections.ts 순서 = 챕터 순서, projects.ts, profile.ts)
  sections/    챕터별 UI (Intro = 표지+목차, About, Journey, EdgeAI, Segmentation, SmartGlass, Neus, WhatsNext, Closing)
  components/  SiteHeader(상단 바) · Chapter(챕터 머리 + 목차 링크) · motion(Reveal, CountUp) · ui
  hooks/       useChapters(현재 챕터 · hash · ←/→), usePassed(스크롤 지점 통과 여부)
  styles/      Tailwind 테마 토큰 (색 · 폰트 · fluid type)
public/images/ 웹용 이미지 (같은 파일명으로 덮어쓰면 교체)
```

문구의 사실관계 source of truth는 `keeweon-portfolio-context/`(비공개, git 제외)다. 문구를 바꿀 땐 `src/data/`만 고치면 된다.

## 배포 (GitHub Pages)

`.github/workflows/deploy.yml`: main push → `npm ci` → lint → build → Pages 배포. PR은 lint + build만.
base path는 CI가 repo 이름으로 넘겨준다(`BASE_PATH=/<repo>/`). 처음 한 번 repo **Settings → Pages → Source: GitHub Actions**를 켜야 한다.

로컬에서 Pages 경로 그대로 확인:

```bash
BASE_PATH=/keeweon-portfolio/ npm run build && BASE_PATH=/keeweon-portfolio/ npm run preview
# → http://localhost:4173/keeweon-portfolio/
```
