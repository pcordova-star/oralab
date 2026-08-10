'use server';
/**
 * @fileOverview Un flujo de Genkit para analizar órdenes médicas mediante visión artificial.
 * Detecta exámenes de aire espirado (Lactulosa, Fructosa, Lactosa) y sugiere la selección.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeMedicalOrderInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Una foto de la orden médica, como data URI en formato Base64. 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMedicalOrderInput = z.infer<typeof AnalyzeMedicalOrderInputSchema>;

const AnalyzeMedicalOrderOutputSchema = z.object({
  detectedExam: z.enum(['Lactulosa', 'Fructosa', 'Lactosa', 'Desconocido']).describe('El examen identificado en la orden.'),
  confidence: z.number().describe('Nivel de confianza de la detección 0-1.'),
  reasoning: z.string().describe('Breve explicación de por qué se eligió ese examen.'),
});
export type AnalyzeMedicalOrderOutput = z.infer<typeof AnalyzeMedicalOrderOutputSchema>;

export async function analyzeMedicalOrder(
  input: AnalyzeMedicalOrderInput
): Promise<AnalyzeMedicalOrderOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      output: { schema: AnalyzeMedicalOrderOutputSchema },
      prompt: [
        { text: `Eres un asistente experto de laboratorio clínico en Oralab, Chile. 
        Tu tarea es leer una fotografía de una orden médica y detectar qué examen de aire espirado se solicita.
        
        CRITERIOS DE BÚSQUEDA:
        1. Lactulosa: Si dice "Lactulosa", "SIBO", "Sobrecrecimiento Bacteriano" o "H2/CH4".
        2. Fructosa: Si dice "Fructosa" o "Intolerancia a la Fructosa".
        3. Lactosa: Si dice "Lactosa" o "Intolerancia a la Lactosa".

        INSTRUCCIONES ADICIONALES:
        - La orden puede estar escrita a mano. 
        - Sé flexible con las abreviaturas.
        - Si no hay claridad total pero hay indicios fuertes, marca una confianza alta (0.8+).
        - Si no se menciona nada de lo anterior, responde 'Desconocido'.` },
        { media: { url: input.photoDataUri } }
      ],
    });

    return response.output || { 
      detectedExam: 'Desconocido', 
      confidence: 0, 
      reasoning: 'No se pudo procesar la respuesta del modelo.' 
    };
  } catch (error) {
    console.error("Error analyzing medical order:", error);
    return {
      detectedExam: 'Desconocido',
      confidence: 0,
      reasoning: "Error técnico al analizar la imagen."
    };
  }
}
