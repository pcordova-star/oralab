
'use server';
/**
 * @fileOverview Un flujo de Genkit para asistir a los pacientes con su preparación.
 * 
 * - patientChat - Función principal que maneja la conversación.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, Firestore } from 'firebase/firestore';

// Singleton para Firebase en el servidor para evitar reinicializaciones costosas
let serverApp: FirebaseApp;
let serverDb: Firestore;

function getDb() {
  if (!serverDb) {
    serverApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    serverDb = getFirestore(serverApp);
  }
  return serverDb;
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

// Herramienta de búsqueda optimizada
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
      const db = getDb();
      const bookingsRef = collection(db, 'bookings');
      
      // Traemos una muestra controlada para filtrado flexible (MVP)
      const snapshot = await getDocs(query(bookingsRef, limit(50)));
      
      if (snapshot.empty) {
        return { found: false, message: "No hay ninguna reserva registrada en el sistema actualmente." };
      }

      const searchLower = input.name.toLowerCase().trim();
      if (searchLower.length < 3) {
        return { found: false, message: "Por favor, escribe un nombre más completo para realizar la búsqueda." };
      }
      
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

      return { found: false, message: `No encontré ninguna reserva para "${input.name}".` };
    } catch (e: any) {
      return { found: false, message: "Error interno al consultar la base de datos." };
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
      
      FLUJO DE TRABAJO:
      - Si el usuario da un nombre: Usa la herramienta 'findBookingByName'.
      - Si la herramienta confirma la reserva (found: true): 
        * Saluda por su nombre.
        * Confirma su examen y fecha.
        * Da instrucciones: Ayuno 12h, Dieta blanda el día anterior, Sin antibióticos 4 semanas.
        * IMPORTANTE: Incluye la palabra "VERIFICADO" al final.
      - Si la herramienta NO confirma (found: false):
        * Informa amablemente que no hay reserva con ese nombre.
        * Sugiere contactar a soporte (+56 9 3685 0468) para ver si hay un error en el sistema.
        * NO des instrucciones médicas si no hay reserva.

      Responde siempre en español, de forma profesional y empática.`,
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
      text: "Lo siento, tuve un inconveniente al procesar tu solicitud. Por favor, intenta escribir tu nombre de nuevo en unos segundos o contáctanos directamente por WhatsApp (+56 9 3685 0468) para ayudarte con tu preparación.",
      isVerified: false
    };
  }
}
