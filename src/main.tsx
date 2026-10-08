import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 폰트는 패키지로 번들 → 발표 당일 인터넷 없이도 동일하게 보인다
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/index.css'
import App from './App.tsx'

// 배포 직후 캐시에 남은 옛 페이지가 이미 지워진 청크(3D 모형)를 부르면 실패한다 → 한 번만 새로 고친다.
// 30초 안에 또 실패하면 그대로 둔다 (무한 새로고침 방지 · 그때는 사진으로 대신)
window.addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('chunk-reload') ?? 0)
    if (Date.now() - last < 30_000) return
    sessionStorage.setItem('chunk-reload', String(Date.now()))
  } catch {
    return
  }
  e.preventDefault()
  location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
