import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Out directory for the build
			out: 'build',

			// Enable precompression for smaller files
			precompress: true,

			// Configure the Node.js server
			envPrefix: 'APP_',
			polyfill: true
		}),

		// Add CSRF protection
		csrf: {
			checkOrigin: true
		}
	}
};

export default config;
