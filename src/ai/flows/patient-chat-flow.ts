'use server';
/**
 * @fileOverview Flujo de diagnóstico para el Chatbot de Pacientes con búsqueda en Firestore.
 * 
 * Este chatbot filtra al paciente por nombre antes de responder dudas de preparación.
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
 * Herramienta para buscar un paciente en Firestore desde el servidor.
 */
const lookupPatient = ai.defineTool(
  {
    name: 'lookupPatient',
    description: 'Busca una reserva en el laboratorio por el nombre o apellido del paciente.',
    inputSchema: z.object({
      name: z.string().describe('Nombre o apellido del paciente para buscar en la base de datos.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      examType: z.string().optional(),
      patientName: z.string().optional(),
      status: z.string().optional(),
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
          status: data.status || "confirmado",
        };
      }
      return { found: false };
    } catch (e) {
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal utilizando el modelo estable de Google.
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
      
      PROTOCOLO DE SEGURIDAD:
      1. Antes de dar instrucciones específicas, DEBES buscar al paciente usando la herramienta 'lookupPatient'.
      2. Si el usuario no te ha dado su nombre, pídeselo amablemente para verificar su reserva.
      3. Si 'lookupPatient' no encuentra nada, dile que no registramos su cita y que contacte al WhatsApp +56 9 3685 0468.
      
      GUÍA DE PREPARACIÓN (Solo tras verificar al paciente):
      - Ayuno: 12 horas.
      - Dieta día anterior: Dieta blanda (arroz blanco, pollo/pescado plancha). NO fibra, NO lácteos, NO alcohol.
      - Restricción Médica: 4 semanas sin antibióticos ni probióticos.
      - Examen: El test dura entre 2 y 3 horas soplado en bolsas cada 15-20 minutos.
      
      Responde siempre en ESPAÑOL, de forma empática y profesional.`,
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
    console.error("Genkit Server Error:", error);
    return {
      text: `Hola. En este momento tengo una dificultad técnica para conectar con mi base de conocimientos. Por favor, intenta de nuevo en unos minutos o contáctanos por WhatsApp (+56 9 3685 0468) para asistirte manualmente.`,
      isVerified: false
    };
  }
}
