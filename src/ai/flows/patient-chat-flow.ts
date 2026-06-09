
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
      name: z.string().describe('Nombre o apellido del paciente.'),
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
      // Inicialización robusta para entorno de servidor
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
          examType: data.examType || "Examen General",
          patientName: `${data.firstName} ${data.lastNameFather}`,
          status: data.status || "confirmado",
        };
      }
      return { found: false };
    } catch (e) {
      console.error("Error en lookupPatient:", e);
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal utilizando el modelo estable.
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
      system: `Eres el asistente virtual de Oralab (Chile).
      
      PROTOCOLO DE SEGURIDAD:
      1. Solo puedes dar instrucciones de preparación si has encontrado al paciente con 'lookupPatient'.
      2. Si el usuario no se ha identificado, pide su nombre completo amablemente.
      3. Si tras buscar no encuentras la cita, dile que no hay registros y sugiérele contactar al WhatsApp +56 9 3685 0468.
      
      CONOCIMIENTO DE PREPARACIÓN (Solo tras verificar):
      - Ayuno: 12 horas totales.
      - Dieta 24h antes: Dieta blanda (arroz blanco, pollo/pescado plancha). NO fibra, NO lácteos, NO frutas.
      - Restricción: 4 semanas sin antibióticos ni probióticos.
      
      Responde siempre en ESPAÑOL de forma profesional y amable.`,
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

/**
 * Función exportada para el componente cliente con manejo de errores centralizado.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    return await patientChatFlow(input);
  } catch (error: any) {
    console.error("Genkit Flow Error:", error);
    return {
      text: `Lo sentimos, tenemos una dificultad técnica temporal para conectar con la IA. Por favor, intenta de nuevo o contáctanos por WhatsApp (+56 9 3685 0468).`,
      isVerified: false
    };
  }
}
