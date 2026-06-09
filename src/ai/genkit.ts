
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Configuración central de Genkit 1.x para Oralab.
 * El plugin googleAI buscará automáticamente la variable GOOGLE_GENAI_API_KEY.
 */
export const ai = genkit({
  plugins: [googleAI()],
});
