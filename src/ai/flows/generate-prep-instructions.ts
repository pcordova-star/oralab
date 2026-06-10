'use server';
/**
 * @fileOverview Un flujo de Genkit para generar instrucciones de preparación pre-cita para pacientes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePrepInstructionsInputSchema = z.object({
  examType: z.enum(['Lactulosa', 'Fructosa', 'Lactosa', 'SIBO', 'HP']).describe('El tipo de examen reservado.'),
});
export type GeneratePrepInstructionsInput = z.infer<typeof GeneratePrepInstructionsInputSchema>;

const GeneratePrepInstructionsOutputSchema = z.object({
  instructions: z.string().describe('Instrucciones concisas de preparación para el paciente.'),
});
export type GeneratePrepInstructionsOutput = z.infer<typeof GeneratePrepInstructionsOutputSchema>;

export async function generatePrepInstructions(
  input: GeneratePrepInstructionsInput
): Promise<GeneratePrepInstructionsOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Eres un asistente de IA para Oralab, un laboratorio clínico especializado en Chile. Tu tarea es generar instrucciones claras y concisas para un paciente que ha reservado un examen de tipo ${input.examType}.

      Debes responder ÚNICAMENTE en ESPAÑOL.

      Consideraciones para el examen ${input.examType}:
      1. Todos los tests de aire espirado (Lactosa, Fructosa, Lactulosa) requieren:
         - Ayuno de 12 horas.
         - Dieta blanda el día anterior (sin fibra, sin legumbres).
         - No fumar ni realizar ejercicio intenso 2 horas antes.
         - No haber tomado antibióticos ni probióticos en las últimas 4 semanas.

      Genera un texto amable, directo y profesional enumerando los pasos clave.`,
    });

    return {
      instructions: response.text || "Error al generar instrucciones. Por favor contacte a soporte.",
    };
  } catch (error) {
    console.error("Error generating instructions:", error);
    return {
      instructions: "Ayuno de 12 horas y dieta blanda el día anterior. Para más detalles consulte con recepción.",
    };
  }
}