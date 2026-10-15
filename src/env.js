import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	GROQ_API_KEY: {
		description: 'API key para Groq SDK'
	}
});
