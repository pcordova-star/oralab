
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

// Inicialización de Firebase segura para Server Actions
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

// Herramienta de búsqueda flexible
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
      
      // Traemos una muestra de documentos recientes para filtrado flexible en memoria (ideal para MVP)
      const snapshot = await getDocs(query(bookingsRef, limit(100)));
      
      if (snapshot.empty) {
        return { found: false, message: "No hay reservas registradas en la base de datos actualmente." };
      }

      const searchLower = input.name.toLowerCase();
      
      // Búsqueda por coincidencia parcial en nombre o apellidos
      const match = snapshot.docs.find(d => {
        const data = d.data();
        const firstName = (data.firstName || "").toLowerCase();
        const lastNameFather = (data.lastNameFather || "").toLowerCase();
        const lastNameMother = (data.lastNameMother || "").toLowerCase();
        
        return firstName.includes(searchLower) || 
               lastNameFather.includes(searchLower) || 
               lastNameMother.includes(searchLower);
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

      return { found: false, message: `No se encontró ninguna reserva bajo el nombre "${input.name}".` };
    } catch (e: any) {
      console.error("Error en findBookingByName:", e);
      return { found: false, message: "Hubo un error al conectar con la base de datos de pacientes." };
    }
  }
);

export async function patientChat(input: z.infer<typeof PatientChatInputSchema>): Promise<z.infer<typeof PatientChatOutputSchema>> {
  try {
    const response = await ai.generate({
      system: `Eres el Asistente Virtual de Preparación de Oralab (Chile).
      
      TU MISIÓN:
      1. Saludar amablemente.
      2. Solicitar el nombre si no ha sido proporcionado para verificar la reserva.
      3. Usar la herramienta 'findBookingByName' para validar que el paciente existe.
      
      LÓGICA DE RESPUESTA:
      - SI SE ENCUENTRA LA RESERVA: 
        * Saluda: "Hola [Nombre], he confirmado tu reserva para un [examType] el día [scheduledDate]".
        * Entrega instrucciones: Ayuno 12h, Dieta blanda el día anterior, 4 semanas sin antibióticos.
        * OBLIGATORIO: Incluye la palabra "VERIFICADO" en tu respuesta final.
      
      - SI NO SE ENCUENTRA LA RESERVA:
        * Informa amablemente que no hay resultados para ese nombre en el sistema.
        * Sugiere verificar la ortografía o contactar a soporte (+56 9 3685 0468).
        * NO entregues instrucciones médicas si no hay reserva.
        
      Mantén siempre un tono profesional, amable y empático.`,
      messages: [
        ...input.history.map(m => ({ 
          role: m.role === 'model' ? 'model' : (m.role === 'system' ? 'system' : 'user'), 
          content: [{ text: m.text }] 
        })),
        { role: 'user', content: [{ text: input.message }] }
      ],
      tools: [findBookingTool],
    });

    const responseText = response.text;
    // Verificamos si la IA incluyó la palabra clave de éxito
    const isVerified = responseText.toUpperCase().includes('VERIFICADO');

    return {
      text: responseText,
      isVerified,
    };
  } catch (error: any) {
    console.error("Error en flujo patientChat:", error);
    return {
      text: "En este momento tengo dificultades técnicas para conectar con mi cerebro de IA o con la base de datos. Por favor, intenta escribir tu nombre nuevamente en unos segundos o contáctanos por WhatsApp al +56 9 3685 0468 para asistirte manualmente con tu preparación.",
      isVerified: false
    };
  }
}
