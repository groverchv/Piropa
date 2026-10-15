import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import dns from 'node:dns';

if (dns.setDefaultResultOrder) {
	dns.setDefaultResultOrder('ipv4first');
}

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				edge: false,
				split: false
			})
		}),
		basicSsl()
	],
	server: {
		host: true,
		port: 5173
	}
});
