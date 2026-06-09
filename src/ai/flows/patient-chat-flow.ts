
'use server';
/**
 * @fileOverview Chatbot de Preparación de Pacientes de Oralab.
 * 
 * Este flujo valida al paciente en Firestore antes de entregar instrucciones de preparación.
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
        };
      }
      return { found: false };
    } catch (e) {
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal con identificador de modelo estandarizado para evitar 404.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    const response = await ai.generate({
      // Usamos el nombre base del modelo sin sufijos para máxima compatibilidad
      model: 'googleai/gemini-1.5-flash',
      system: `Eres el Asistente Virtual de Oralab (Chile).
      
      INSTRUCCIONES:
      1. Saluda cordialmente.
      2. Si no sabes quién es el usuario, pregunta su nombre y usa 'lookupPatient'.
      3. Si 'lookupPatient' devuelve 'found: true', confirma su examen y entrega instrucciones.
      4. Instrucciones Generales: 12h ayuno, dieta blanda el día anterior (arroz, pollo/pescado plancha), no fumar ni ejercicio 2h antes, no antibióticos/probióticos 4 semanas antes.
      5. Si 'lookupPatient' devuelve 'found: false', indica amablemente que no hay cita y ofrece ayuda vía WhatsApp (+56 9 3685 0468).
      
      Responde siempre en ESPAÑOL profesional.`,
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
    const errorMessage = error?.message || "Error desconocido";
    console.error("Genkit Error:", error);
    
    return {
      text: `[DIAGNÓSTICO TÉCNICO]: Error de conexión con Gemini. 
      Detalle: ${errorMessage}. 
      Recomendación: Verifica que el modelo 'gemini-1.5-flash' esté habilitado en tu API Key.`,
      isVerified: false
    };
  }
}
