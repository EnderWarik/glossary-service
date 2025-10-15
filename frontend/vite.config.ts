import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	server: {
		port: 8080,
		host: true,
		strictPort: true,
		proxy: {
			'/api': {
				target: 'http://backend:8000',
				changeOrigin: true,
				rewrite: (path) => path,
			},
		},
	},
	build: {
		target: 'es2020'
	}
})
