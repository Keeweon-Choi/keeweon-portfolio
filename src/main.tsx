import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 폰트는 패키지로 번들 → 발표 당일 인터넷 없이도 동일하게 보인다
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
