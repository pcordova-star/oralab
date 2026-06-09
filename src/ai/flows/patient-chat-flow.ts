
'use server';
/**
 * @fileOverview Chatbot de Preparación de Pacientes de Oralab.
 * 
 * Este flujo valida al paciente en Firestore antes de entregar instrucciones de preparación.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
 * Herramienta robusta para verificar la existencia de un paciente en Firestore.
 */
const lookupPatient = ai.defineTool(
  {
    name: 'lookupPatient',
    description: 'Verifica si existe una reserva para el paciente indicado.',
    inputSchema: z.object({
      name: z.string().describe('Nombre o apellido del paciente para buscar en la base de datos.'),
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
      
      // Búsqueda flexible por nombre o apellido
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
      console.error("Firestore lookup error:", e);
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal con manejo de errores técnico explícito.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `Eres el Asistente Virtual de Oralab (Chile).
      
      IMPORTANTE:
      1. Tu primera misión es saludar y validar al paciente.
      2. DEBES usar 'lookupPatient' para verificar si el paciente tiene una cita.
      3. Si 'lookupPatient' devuelve 'found: false', indica amablemente que no registramos su cita y que contacte al WhatsApp +56 9 3685 0468.
      4. Si el paciente está validado, entrégale estas instrucciones:
         - Ayuno: 12 horas estrictas.
         - Dieta: El día anterior solo dieta blanda (arroz blanco, pollo/pescado plancha). NO fibra, NO frutas, NO lácteos.
         - Restricción: No haber tomado antibióticos ni probióticos en las últimas 4 semanas.
      
      Responde siempre en ESPAÑOL, de forma muy amable y profesional.`,
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
  } catch (error: any) {
    console.error("Genkit Flow Error:", error);
    return {
      text: "Lo sentimos, tenemos una dificultad técnica temporal para conectar con la IA de Oralab. Por favor, contáctanos por WhatsApp (+56 9 3685 0468) para asistirte personalmente con tu preparación.",
      isVerified: false
    };
  }
}
