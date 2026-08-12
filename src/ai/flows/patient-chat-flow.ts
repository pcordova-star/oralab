'use server';
/**
 * @fileOverview Chatbot Experto de Oralab.
 * 
 * Este flujo maneja consultas generales de usuarios curiosos y validación de pacientes.
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
 * Herramienta para verificar la existencia de un paciente en Firestore.
 */
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
      if (!firestore) return { found: false };

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
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal con conocimiento experto de Oralab.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `Eres el Asistente Virtual Experto de Oralab (Chile). Tu misión es ayudar a pacientes y personas interesadas.
      
      CONOCIMIENTOS CLAVE:
      1. TRATAMIENTO: Realizamos tests de aire espirado (Lactulosa, Fructosa, Lactosa) para detectar SIBO e intolerancias.
      2. TECNOLOGÍA: Usamos tecnología Sunvou®, la más avanzada del mundo, que mide Hidrógeno (H2), Metano (CH4) y Sulfuro (H2S).
      3. PRECIO: El valor base es $80.000 CLP.
      4. DESCUENTO: Ofrecemos 20% de descuento ($16.000 menos) para pacientes de Fonasa e Isapre.
      5. TEST EN CASA: El kit se retira en Apoquindo 3990. Tras soplar, el paciente tiene máximo 6 HORAS para que la muestra llegue al laboratorio.
      6. UBICACIÓN: Apoquindo 3990, Of. 605, Las Condes, Santiago.
      
      INSTRUCCIONES DE COMPORTAMIENTO:
      - Sé profesional, clínico pero muy empático.
      - Si alguien pregunta qué es SIBO, explícalo de forma sencilla.
      - Si preguntan por su reserva, usa la herramienta 'lookupPatient'.
      - Si 'lookupPatient' falla, ofrece ayuda por WhatsApp (+56 9 3685 0468).
      - Menciona siempre el límite de 6 horas para los tests a domicilio, es una alerta de seguridad crítica.
      
      Responde siempre en ESPAÑOL de Chile.`,
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
    console.error("Genkit Error:", error);
    return {
      text: "Lo siento, mi sistema de IA está experimentando una breve interrupción. Por favor, contáctanos directamente por WhatsApp al +56 9 3685 0468 para ayudarte de inmediato.",
      isVerified: false
    };
  }
}
