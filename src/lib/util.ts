// public/ 파일 경로 → base path(GitHub Pages면 /<repo>/)가 붙은 URL
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const pad = (n: number) => String(n).padStart(2, '0')
