import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/course-tracker/' to match your GitHub repo name exactly
// e.g. if your repo is github.com/yourname/my-app, use '/my-app/'
export default defineConfig({
  plugins: [react()],
  base: '/coding-progression/',
})
