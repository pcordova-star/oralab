
'use server';
/**
 * @fileOverview Un flujo de Genkit para asistir a los pacientes con su preparación.
 * 
 * - patientChat - Función principal que maneja la conversación.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

// Inicialización de Firebase optimizada para Server Actions
function getServerDb() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  text: z.string(),
});

const PatientChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('El historial de la conversación.'),
  message: z.string().describe('El nuevo mensaje del usuario.'),
});

const PatientChatOutputSchema = z.object({
  text: z.string().describe('La respuesta del asistente.'),
  isVerified: z.boolean().describe('Si el paciente ya ha sido verificado.'),
});

// Herramienta de búsqueda de reservas
const findBookingTool = ai.defineTool(
  {
    name: 'findBookingByName',
    description: 'Busca una reserva en el sistema de Oralab usando el nombre o apellido del paciente.',
    inputSchema: z.object({
      name: z.string().describe('El nombre o apellido a buscar (mínimo 3 caracteres).'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      patientName: z.string().optional(),
      examType: z.string().optional(),
      scheduledDate: z.string().optional(),
      message: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const searchLower = input.name.toLowerCase().trim();
      if (searchLower.length < 3) {
        return { found: false, message: "Por favor, escribe un nombre más largo para buscar." };
      }

      const db = getServerDb();
      const snapshot = await getDocs(query(collection(db, 'bookings'), limit(100)));
      
      const match = snapshot.docs.find(d => {
        const data = d.data();
        const fullSearchArea = `${data.firstName} ${data.lastNameFather} ${data.lastNameMother}`.toLowerCase();
        return fullSearchArea.includes(searchLower);
      });

      if (match) {
        const data = match.data();
        return {
          found: true,
          patientName: `${data.firstName} ${data.lastNameFather}`,
          examType: data.examType,
          scheduledDate: data.scheduledDate,
        };
      }

      return { found: false, message: "No encontré ninguna reserva con ese nombre en nuestro sistema." };
    } catch (e: any) {
      return { found: false, message: "Hubo un error al consultar la base de datos." };
    }
  }
);

export async function patientChat(input: z.infer<typeof PatientChatInputSchema>): Promise<z.infer<typeof PatientChatOutputSchema>> {
  try {
    const response = await ai.generate({
      system: `Eres el Asistente Virtual de Preparación de Oralab (Chile).
      
      TU MISIÓN:
      1. Saludar y pedir el nombre del paciente para verificar su cita.
      2. Solo después de confirmar que el paciente existe con 'findBookingByName', entrega instrucciones.
      
      ESTRATEGIA:
      - Si el usuario da un nombre: Usa la herramienta 'findBookingByName'.
      - Si la herramienta confirma la reserva (found: true): 
        * Saluda por su nombre.
        * Confirma su examen y fecha.
        * Da instrucciones: Ayuno 12h, Dieta blanda el día anterior, Sin antibióticos 4 semanas.
        * IMPORTANTE: Incluye la palabra "VERIFICADO" al final de tu respuesta.
      - Si la herramienta NO confirma (found: false):
        * Informa amablemente que no hay reserva con ese nombre.
        * Sugiere contactar a soporte (+56 9 3685 0468) para ver si hay un error en el registro.
        * NO des instrucciones médicas si no hay reserva confirmada.

      Responde siempre en español, de forma profesional y amable.`,
      messages: [
        ...input.history.map(m => ({ 
          role: m.role as 'user' | 'model' | 'system', 
          content: [{ text: m.text }] 
        })),
        { role: 'user', content: [{ text: input.message }] }
      ],
      tools: [findBookingTool],
    });

    return {
      text: response.text,
      isVerified: response.text.toUpperCase().includes('VERIFICADO'),
    };
  } catch (error: any) {
    return {
      text: "Lo siento, tuve un inconveniente al procesar tu solicitud. Por favor, intenta de nuevo o contáctanos por WhatsApp (+56 9 3685 0468) para ayudarte con tu preparación.",
      isVerified: false
    };
  }
}
