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
  examType: z.string().optional().describe('El tipo de examen del paciente verificado.'),
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
    }),
  },
  async (input) => {
    const db = getDb();
    const bookingsRef = collection(db, 'bookings');
    
    // Buscamos por nombre (insensible a mayúsculas es difícil en Firestore sin índices complejos, 
    // así que usamos una búsqueda simple por el campo firstName o lastNameFather)
    const q = query(bookingsRef, where('firstName', '>=', input.name), limit(5));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Intentamos con el apellido
      const q2 = query(bookingsRef, where('lastNameFather', '>=', input.name), limit(5));
      const snapshot2 = await getDocs(q2);
      if (snapshot2.empty) return { found: false };
      
      const doc = snapshot2.docs[0].data();
      return {
        found: true,
        patientName: `${doc.firstName} ${doc.lastNameFather}`,
        examType: doc.examType,
        scheduledDate: doc.scheduledDate,
      };
    }

    const doc = snapshot.docs[0].data();
    return {
      found: true,
      patientName: `${doc.firstName} ${doc.lastNameFather}`,
      examType: doc.examType,
      scheduledDate: doc.scheduledDate,
    };
  }
);

export async function patientChat(input: z.infer<typeof PatientChatInputSchema>): Promise<z.infer<typeof PatientChatOutputSchema>> {
  const response = await ai.generate({
    system: `Eres el Asistente Virtual de Preparación de Oralab (Chile).
    
    REGLA CRÍTICA DE SEGURIDAD:
    1. Tu primera misión es pedirle el nombre al paciente para verificar su reserva. 
    2. No entregues NINGUNA instrucción de preparación clínica hasta que hayas usado la herramienta 'findBookingByName' y confirmado que el paciente existe.
    3. Si el paciente NO es encontrado, indícale amablemente que no visualizas su reserva y sugiérele contactar a soporte por WhatsApp (+56 9 3685 0468).
    
    UNA VEZ VERIFICADO:
    - Identifica su 'examType' (Lactulosa, Fructosa, Lactosa).
    - Entrega instrucciones concisas basadas en los protocolos de Oralab:
      * Ayuno de 12 horas.
      * Dieta blanda el día anterior (sin fibra, sin legumbres).
      * 4 semanas sin antibióticos ni probióticos.
    - Responde siempre en ESPAÑOL de forma amable y profesional.`,
    messages: [
      ...input.history.map(m => ({ role: m.role, content: [{ text: m.text }] })),
      { role: 'user', content: [{ text: input.message }] }
    ],
    tools: [findBookingTool],
  });

  return {
    text: response.text,
    isVerified: response.text.toLowerCase().includes('verificado') || response.text.toLowerCase().includes('confirmado'), // Heurística simple
    examType: undefined, // Podría extraerse de la respuesta si fuera necesario
  };
}
