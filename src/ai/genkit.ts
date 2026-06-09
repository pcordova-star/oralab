
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Configuración central de Genkit 1.x.
 * Utiliza automáticamente process.env.GOOGLE_GENAI_API_KEY o GEMINI_API_KEY.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
