import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages(프로젝트 사이트)는 https://<user>.github.io/<repo>/ 아래에서 서비스된다.
// CI가 BASE_PATH=/<repo>/ 를 넘겨주고, 로컬 dev/preview와 custom domain은 '/' 그대로 쓴다.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
