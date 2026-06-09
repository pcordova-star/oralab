'use server';
/**
 * @fileOverview Un flujo de Genkit para asistir a los pacientes con su preparación.
 * 
 * - patientChat - Función principal que maneja la conversación.
 * - findBookingTool - Herramienta para buscar reservas en Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

// Inicialización de Firebase para el entorno de servidor (Genkit)
// Usamos una aproximación más robusta para Server Actions
function getDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
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

// Herramienta para que la IA busque en la base de datos
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
      error: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const db = getDb();
      const bookingsRef = collection(db, 'bookings');
      
      // Búsqueda simple por nombre. Nota: Firestore requiere coincidencia exacta o rangos.
      // Aquí intentamos buscar documentos donde el nombre empiece por el texto ingresado
      const q = query(bookingsRef, where('firstName', '>=', input.name), limit(5));
      const snapshot = await getDocs(q);
      
      let foundDoc = null;
      
      if (!snapshot.empty) {
        // Verificamos si realmente coincide el inicio del nombre (case-insensitive manual simple)
        const match = snapshot.docs.find(d => 
          d.data().firstName?.toLowerCase().includes(input.name.toLowerCase()) ||
          d.data().lastNameFather?.toLowerCase().includes(input.name.toLowerCase())
        );
        if (match) foundDoc = match.data();
      }

      if (!foundDoc) {
        // Re-intento por apellido
        const q2 = query(bookingsRef, where('lastNameFather', '>=', input.name), limit(5));
        const snapshot2 = await getDocs(q2);
        if (!snapshot2.empty) {
          const match = snapshot2.docs.find(d => 
            d.data().lastNameFather?.toLowerCase().includes(input.name.toLowerCase())
          );
          if (match) foundDoc = match.data();
        }
      }

      if (foundDoc) {
        return {
          found: true,
          patientName: `${foundDoc.firstName} ${foundDoc.lastNameFather}`,
          examType: foundDoc.examType,
          scheduledDate: foundDoc.scheduledDate,
        };
      }

      return { found: false };
    } catch (e: any) {
      console.error("Error in findBookingByName tool:", e);
      return { found: false, error: e.message };
    }
  }
);

export async function patientChat(input: z.infer<typeof PatientChatInputSchema>): Promise<z.infer<typeof PatientChatOutputSchema>> {
  try {
    const response = await ai.generate({
      system: `Eres el Asistente Virtual de Preparación de Oralab (Chile).
      
      TU MISIÓN:
      1. Saludar amablemente.
      2. Si no conoces el nombre del paciente, PÍDELO para verificar la reserva.
      3. Usa la herramienta 'findBookingByName' con el nombre proporcionado.
      
      ESCENARIOS DE RESPUESTA:
      - SI ENCUENTRAS LA RESERVA: 
        * Saluda por su nombre: "Hola [Nombre], he confirmado tu reserva para un [examType] el día [scheduledDate]".
        * Entrega las instrucciones clínicas pertinentes: Ayuno 12h, Dieta blanda el día anterior, 4 semanas sin antibióticos.
        * Menciona la palabra "VERIFICADO" o "CONFIRMADO" en tu respuesta.
      
      - SI NO ENCUENTRAS LA RESERVA:
        * Dile amablemente: "No he podido encontrar una reserva bajo el nombre '[nombre]'. Por favor, asegúrate de escribirlo tal cual lo registraste o contacta a nuestro soporte vía WhatsApp al +56 9 3685 0468 para ayudarte directamente."
      
      - REGLA DE ORO: No des instrucciones médicas detalladas hasta no confirmar que el paciente existe en el sistema.`,
      messages: [
        ...input.history.map(m => ({ role: m.role, content: [{ text: m.text }] })),
        { role: 'user', content: [{ text: input.message }] }
      ],
      tools: [findBookingTool],
    });

    const responseText = response.text;
    const isVerified = responseText.toLowerCase().includes('verificado') || responseText.toLowerCase().includes('confirmado');

    return {
      text: responseText,
      isVerified: isVerified,
    };
  } catch (error: any) {
    console.error("Error in patientChat flow:", error);
    return {
      text: "Lo siento, tuve un inconveniente al procesar tu solicitud. Por favor, intenta de nuevo en unos momentos o contáctanos directamente por WhatsApp (+56 9 3685 0468).",
      isVerified: false
    };
  }
}
