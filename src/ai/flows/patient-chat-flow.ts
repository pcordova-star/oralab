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

// Herramienta de búsqueda de reservas (Opcional)
const findBookingTool = ai.defineTool(
  {
    name: 'findBookingByName',
    description: 'Busca una reserva en el sistema de Oralab usando el nombre o apellido del paciente.',
    inputSchema: z.object({
      name: z.string().describe('El nombre o apellido a buscar.'),
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
      const db = getServerDb();
      const snapshot = await getDocs(query(collection(db, 'bookings'), limit(50)));
      
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

      return { found: false, message: "No encontré ninguna reserva con ese nombre." };
    } catch (e: any) {
      return { found: false, message: "Error al consultar la base de datos." };
    }
  }
);

export async function patientChat(input: z.infer<typeof PatientChatInputSchema>): Promise<z.infer<typeof PatientChatOutputSchema>> {
  try {
    const response = await ai.generate({
      system: `Eres el Asistente Virtual de Oralab (Chile). 
      
      TU MISIÓN:
      Ayudar a los pacientes con dudas sobre su preparación para tests de aire espirado (SIBO, Lactosa, Fructosa, Lactulosa).
      
      INSTRUCCIONES GENERALES:
      - Ayuno de 12 horas.
      - Dieta blanda el día anterior (sin fibra, sin legumbres, sin lácteos).
      - No fumar ni ejercicio intenso 2h antes.
      - No antibióticos ni probióticos en las últimas 4 semanas.
      
      Si el usuario te da su nombre, puedes usar 'findBookingByName' para confirmar su cita específica, pero si el usuario solo saluda o pregunta algo general, responde de forma amable y profesional inmediatamente.
      
      Responde de forma amable y en español de Chile.`,
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
      isVerified: response.text.toUpperCase().includes('VERIFICADO') || response.text.toLowerCase().includes('reserva confirmada'),
    };
  } catch (error: any) {
    // Si falla la generación de IA, mostramos un error controlado
    return {
      text: "Lo siento, tuve un inconveniente técnico al procesar tu mensaje. Por favor, intenta de nuevo o contáctanos por WhatsApp (+56 9 3685 0468).",
      isVerified: false
    };
  }
}
