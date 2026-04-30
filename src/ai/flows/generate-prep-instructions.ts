'use server';
/**
 * @fileOverview Un flujo de Genkit para generar instrucciones de preparación pre-cita para pacientes.
 *
 * - generatePrepInstructions - Función que genera instrucciones personalizadas.
 * - GeneratePrepInstructionsInput - Tipo de entrada para la función.
 * - GeneratePrepInstructionsOutput - Tipo de retorno para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePrepInstructionsInputSchema = z.object({
  examType: z.enum(['SIBO', 'HP']).describe('El tipo de examen reservado (SIBO o HP).'),
});
export type GeneratePrepInstructionsInput = z.infer<typeof GeneratePrepInstructionsInputSchema>;

const GeneratePrepInstructionsOutputSchema = z.object({
  instructions: z.string().describe('Instrucciones concisas de preparación para el paciente.'),
});
export type GeneratePrepInstructionsOutput = z.infer<typeof GeneratePrepInstructionsOutputSchema>;

export async function generatePrepInstructions(
  input: GeneratePrepInstructionsInput
): Promise<GeneratePrepInstructionsOutput> {
  return generatePrepInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrepInstructionsPrompt',
  input: { schema: GeneratePrepInstructionsInputSchema },
  output: { schema: GeneratePrepInstructionsOutputSchema },
  prompt: `Eres un asistente de IA para Oralab, un laboratorio clínico especializado en Chile. Tu tarea es generar instrucciones claras y concisas para un paciente que ha reservado un examen.

Debes responder ÚNICAMENTE en ESPAÑOL.

Aquí están las instrucciones estándar para cada tipo de examen:

**Instrucciones para Examen SIBO:**
1. **Preparación (24 horas antes):** Evitar antibióticos, laxantes, probióticos y medicamentos que afecten la motilidad intestinal.
2. **Preparación (12 horas antes):** Ayuno obligatorio. No comer, beber (excepto agua pura sin gas), fumar ni masticar chicle.
3. **El día del examen:** Traer una lista de sus medicamentos actuales. El test consiste en soplar en bolsas especiales, beber una solución de sustrato y volver a soplar en intervalos de tiempo. La duración total es de aproximadamente 3 horas.
4. **Importante:** Si ha consumido algún elemento restringido, informe a la recepción al llegar, ya que es posible que deba reprogramar su cita.

**Instrucciones para Examen Helicobacter pylori (HP):**
1. **Preparación (4 semanas antes):** No haber tomado antibióticos.
2. **Preparación (2 semanas antes):** No haber tomado medicamentos que contengan bismuto (ej. Pepto-Bismol).
3. **Preparación (1 semana antes):** No haber tomado inhibidores de la bomba de protones (PPI) como omeprazol, lansoprazol, pantoprazol, esomeprazol.
4. **Preparación (24 horas antes):** No tomar bloqueadores H2 (ej. famotidina).
5. **Preparación (12 horas antes):** Ayuno obligatorio. No comer, beber (excepto agua pura sin gas), fumar ni masticar chicle.
6. **El día del examen:** El test consiste en soplar una muestra basal, beber una solución de Urea C13 y soplar nuevamente tras 15 minutos. La duración total es de aproximadamente 30 minutos.
7. **Importante:** Si ha consumido algún elemento restringido, informe a la recepción al llegar para evaluar si el examen puede realizarse.

Genera las instrucciones para un paciente que se realizará un examen de tipo {{{examType}}}. Usa un tono amable pero profesional. Entrega el texto listo para ser copiado y entregado al paciente.`,
});

const generatePrepInstructionsFlow = ai.defineFlow(
  {
    name: 'generatePrepInstructionsFlow',
    inputSchema: GeneratePrepInstructionsInputSchema,
    outputSchema: GeneratePrepInstructionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
