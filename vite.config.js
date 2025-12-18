import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	root: '.',
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, 'index.html'),
		},
	},
	server: {
		open: true,
		port: 3000,
	},
})