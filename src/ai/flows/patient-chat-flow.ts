'use server';
/**
 * @fileOverview Flujo de diagnóstico para el Chatbot de Pacientes con búsqueda en Firestore.
 * 
 * Este chatbot valida al paciente por nombre antes de responder dudas de preparación.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

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
 * Herramienta para buscar un paciente en Firestore.
 */
const lookupPatient = ai.defineTool(
  {
    name: 'lookupPatient',
    description: 'Busca una reserva en el laboratorio por el nombre del paciente.',
    inputSchema: z.object({
      name: z.string().describe('Nombre o apellido del paciente.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      examType: z.string().optional(),
      patientName: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const { firestore } = initializeFirebase();
      if (!firestore) return { found: false };

      const bookingsRef = collection(firestore, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      const searchLower = input.name.toLowerCase().trim();
      const match = snapshot.docs.find(doc => {
        const data = doc.data();
        const fullName = `${data.firstName || ''} ${data.lastNameFather || ''} ${data.lastNameMother || ''}`.toLowerCase();
        return fullName.includes(searchLower);
      });

      if (match) {
        const data = match.data();
        return {
          found: true,
          examType: data.examType || "Examen de Aire Espirado",
          patientName: `${data.firstName} ${data.lastNameFather}`,
        };
      }
      return { found: false };
    } catch (e) {
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal.
 */
const patientChatFlow = ai.defineFlow(
  {
    name: 'patientChatFlow',
    inputSchema: PatientChatInputSchema,
    outputSchema: PatientChatOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `Eres el asistente virtual de Oralab (Chile). Tu misión es ayudar a los pacientes con su preparación.
      
      PROTOCOLO:
      1. Antes de dar instrucciones, DEBES usar 'lookupPatient' para verificar la reserva.
      2. Si no encuentras al paciente, dile que no registramos su cita y que contacte al WhatsApp +56 9 3685 0468.
      3. Si el paciente está validado, usa estos datos para las instrucciones:
         - Ayuno: 12 horas.
         - Dieta día anterior: Dieta blanda (arroz blanco, pollo/pescado plancha). NO fibra, NO lácteos.
         - Restricción: 4 semanas sin antibióticos ni probióticos.
      
      Responde siempre en ESPAÑOL, de forma amable y profesional.`,
      tools: [lookupPatient],
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
      isVerified: true, 
    };
  }
);

export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    return await patientChatFlow(input);
  } catch (error: any) {
    console.error("Genkit Error:", error);
    return {
      text: `Lo sentimos, tenemos una dificultad técnica temporal para conectar con la IA. Por favor, intenta de nuevo en unos segundos o contáctanos por WhatsApp (+56 9 3685 0468) para asistirte con tu preparación personalmente.`,
      isVerified: false
    };
  }
}
