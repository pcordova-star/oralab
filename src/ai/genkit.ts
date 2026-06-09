
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Configuración central de Genkit.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
