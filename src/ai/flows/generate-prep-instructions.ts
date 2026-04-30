'use server';
/**
 * @fileOverview A Genkit flow for generating pre-appointment instructions for patients.
 *
 * - generatePrepInstructions - A function that generates customized pre-appointment instructions.
 * - GeneratePrepInstructionsInput - The input type for the generatePrepInstructions function.
 * - GeneratePrepInstructionsOutput - The return type for the generatePrepInstructions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePrepInstructionsInputSchema = z.object({
  examType: z.enum(['SIBO', 'HP']).describe('The type of exam booked (SIBO or HP).'),
});
export type GeneratePrepInstructionsInput = z.infer<typeof GeneratePrepInstructionsInputSchema>;

const GeneratePrepInstructionsOutputSchema = z.object({
  instructions: z.string().describe('Concise pre-appointment instructions for the patient.'),
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
  prompt: `You are an AI assistant for Oralab, a clinical laboratory. Your task is to generate concise and clear pre-appointment instructions for a patient based on the type of exam they have booked.

Here are the standard instructions for each exam type:

**SIBO Exam Instructions:**
1.  **Preparation (24 hours prior):** Avoid antibiotics, laxatives, probiotics, and motility drugs.
2.  **Preparation (12 hours prior):** Fasting is required. Do not eat, drink (except plain water), smoke, or chew gum.
3.  **On the day:** Bring all your current medications. The test involves drinking a special solution and providing breath samples at timed intervals. The total duration is approximately 3 hours.
4.  **Important:** If you have consumed any restricted items, please inform the reception upon arrival as the test may need to be rescheduled.

**Helicobacter pylori (HP) Exam Instructions:**
1.  **Preparation (4 weeks prior):** Do not take antibiotics.
2.  **Preparation (2 weeks prior):** Do not take bismuth-containing medications (e.g., Pepto-Bismol).
3.  **Preparation (1 week prior):** Do not take proton pump inhibitors (PPIs) such as omeprazole, lansoprazole, pantoprazole, rabeprazole, esomeprazole.
4.  **Preparation (24 hours prior):** Do not take H2-blockers (e.g., ranitidine, famotidine).
5.  **Preparation (12 hours prior):** Fasting is required. Do not eat, drink (except plain water), smoke, or chew gum.
6.  **On the day:** The test involves providing a breath sample, drinking a solution, and then providing another breath sample after 15 minutes. The total duration is approximately 30 minutes.
7.  **Important:** If you have consumed any restricted items, please inform the reception upon arrival as the test may need to be rescheduled.

Please generate the instructions for a patient who has booked a {{{examType}}} exam. Ensure the instructions are easy to understand and provide all necessary details for preparation. Output ONLY the instructions text.`,
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
