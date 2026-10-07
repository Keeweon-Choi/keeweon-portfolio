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

## 발표 조작

| 키 | 동작 |
| --- | --- |
| `→` `PageDown` `Space` | 다음 (섹션 안에 단계가 있으면 단계 먼저: Journey → Pill 상세, Redesign → 15+ FPS) |
| `←` `PageUp` `Shift+Space` | 이전 |
| `Home` / `End` | 처음 / 마지막 |

마우스 휠은 평범하게 스크롤된다. 하단 바의 진행 표시를 눌러 섹션으로 바로 이동할 수 있고, 현재 섹션은 URL hash(`#smart-glass` 등)에 남아 새로고침해도 유지된다.

## 구조

```
src/
  data/        발표 문구 (sections.ts 순서 = 발표 순서, projects.ts, profile.ts)
  sections/    섹션별 UI
  components/  Section(running head), DeckNav(하단 진행 표시), ui(공통 조각)
  hooks/       useDeck — 키보드/버튼 섹션 이동 · 단계 · hash
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
