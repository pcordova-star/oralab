
'use server';
/**
 * @fileOverview Chatbot Experto de Oralab.
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

const lookupPatient = ai.defineTool(
  {
    name: 'lookupPatient',
    description: 'Verifica si existe una reserva para el paciente indicado buscando por su nombre o apellido.',
    inputSchema: z.object({
      name: z.string().describe('Nombre o apellido del paciente para buscar.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      examType: z.string().optional(),
      patientName: z.string().optional(),
      scheduledDate: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const { firestore } = initializeFirebase();
      const bookingsRef = collection(firestore, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      if (snapshot.empty) return { found: false };

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
          scheduledDate: data.scheduledDate,
        };
      }
      return { found: false };
    } catch (e) {
      console.error("Tool lookupPatient error:", e);
      return { found: false };
    }
  }
);

export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `Eres el Asistente Virtual Experto de Oralab (Chile).
      
      CONOCIMIENTOS CLAVE:
      1. TRATAMIENTO: Tests de aire espirado (Lactulosa, Fructosa, Lactosa) para SIBO e intolerancias.
      2. TECNOLOGÍA: Sunvou®, mide H2, CH4 y H2S.
      3. PRECIO: $80.000 CLP base. 20% descuento Fonasa/Isapre.
      4. DOMICILIO: Retiro en Apoquindo 3990. Muestra debe volver en MÁXIMO 6 HORAS.
      5. UBICACIÓN: Apoquindo 3990, Of. 605, Las Condes.
      
      Responde siempre en ESPAÑOL de Chile de forma profesional y empática.`,
      tools: [lookupPatient],
      messages: [
        ...input.history.map(m => ({ 
          role: m.role, 
          content: [{ text: m.text }] 
        })),
        { role: 'user', content: [{ text: input.message }] }
      ],
    });

    return {
      text: response.text || "No pude generar una respuesta. ¿Cómo puedo ayudarte?",
      isVerified: true, 
    };
  } catch (error: any) {
    console.error("Genkit Runtime Error:", error);
    return {
      text: "Lo siento, mi sistema de IA está experimentando una breve interrupción técnica. Por favor, asegúrate de haber pegado la API Key correcta en el archivo .env o contáctanos por WhatsApp al +56 9 3685 0468.",
      isVerified: false
    };
  }
}
