'use server';
/**
 * @fileOverview Flujo de diagnóstico para el Chatbot de Pacientes.
 * 
 * Este archivo ha sido simplificado para identificar errores de API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  text: z.string(),
});

const PatientChatInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});

const PatientChatOutputSchema = z.object({
  text: z.string(),
  isVerified: z.boolean(),
});

export type PatientChatInput = z.infer<typeof PatientChatInputSchema>;
export type PatientChatOutput = z.infer<typeof PatientChatOutputSchema>;

/**
 * Flujo de chat simplificado para pruebas.
 */
const patientChatFlow = ai.defineFlow(
  {
    name: 'patientChatFlow',
    inputSchema: PatientChatInputSchema,
    outputSchema: PatientChatOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      system: 'Eres un asistente de prueba para Oralab. Responde de forma muy breve.',
      messages: [
        ...input.history.map(m => ({ 
          role: m.role as 'user' | 'model' | 'system', 
          content: [{ text: m.text }] 
        })),
        { role: 'user', content: [{ text: input.message }] }
      ],
    });

    return {
      text: response.text,
      isVerified: false,
    };
  }
);

/**
 * Función exportada para el componente cliente.
 * Incluye un bloque catch que devuelve el error real para diagnóstico.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    return await patientChatFlow(input);
  } catch (error: any) {
    console.error("DEBUG AI ERROR:", error);
    return {
      text: `DEBUG ERROR: ${error.message || 'Error desconocido'}. Verifica que la API Key esté configurada en el panel de Firebase App Hosting.`,
      isVerified: false
    };
  }
}
