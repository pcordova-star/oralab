'use server';
/**
 * @fileOverview Flujo de diagnóstico para el Chatbot de Pacientes.
 * 
 * Este chatbot filtra al paciente por nombre antes de responder dudas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';

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
 * Herramienta para buscar un paciente en Firestore.
 */
const lookupPatient = ai.defineTool(
  {
    name: 'lookupPatient',
    description: 'Busca una reserva en el laboratorio por el nombre del paciente.',
    inputSchema: z.object({
      name: z.string().describe('Nombre o apellido del paciente a buscar.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      examType: z.string().optional(),
      patientName: z.string().optional(),
      status: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const { firestore } = initializeFirebase();
      if (!firestore) return { found: false };

      const bookingsRef = collection(firestore, 'bookings');
      const q = query(bookingsRef);
      const snapshot = await getDocs(q);
      
      const searchLower = input.name.toLowerCase();
      const match = snapshot.docs.find(doc => {
        const data = doc.data();
        const fullName = `${data.firstName || ''} ${data.lastNameFather || ''}`.toLowerCase();
        return fullName.includes(searchLower);
      });

      if (match) {
        const data = match.data();
        return {
          found: true,
          examType: data.examType,
          patientName: `${data.firstName} ${data.lastNameFather}`,
          status: data.status,
        };
      }
      return { found: false };
    } catch (e) {
      console.error("Error en lookupPatient:", e);
      return { found: false };
    }
  }
);

/**
 * Flujo de chat principal.
 */
const patientChatFlow = ai.defineFlow(
  {
    name: 'patientChatFlow',
    inputSchema: PatientChatInputSchema,
    outputSchema: PatientChatOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      system: `Eres el asistente virtual de Oralab, un laboratorio especializado en tests de aire espirado.
      
      REGLA DE SEGURIDAD CRÍTICA:
      1. Solo puedes responder dudas de preparación si has verificado que el paciente tiene una reserva usando la herramienta 'lookupPatient'.
      2. Si el usuario saluda o pregunta algo sin haberse identificado, pide amablemente su nombre completo para revisar el sistema.
      3. Si no encuentras al paciente tras usar la herramienta, indícale que no hay una reserva con ese nombre y sugiérele contactar al WhatsApp +56 9 3685 0468.
      
      PROTOCOLO DE PREPARACIÓN (Una vez verificado):
      - Ayuno: 12 horas estrictas.
      - Dieta: 24h antes dieta blanda (arroz blanco, pollo/pescado plancha). NO fibra, NO legumbres, NO frutas.
      - Restricción Médica: 4 semanas sin antibióticos ni probióticos.
      - Día del examen: No fumar ni hacer ejercicio 2h antes.
      
      Responde siempre en ESPAÑOL de forma profesional y amable.`,
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
      isVerified: response.text.toLowerCase().includes('hola') || response.text.length > 0, // Simplificado para la UI
    };
  }
);

/**
 * Función exportada para el componente cliente.
 */
export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  try {
    return await patientChatFlow(input);
  } catch (error: any) {
    console.error("AI CHAT ERROR:", error);
    return {
      text: `Lo sentimos, tenemos una interrupción temporal en el servicio de IA. Por favor, contacta directamente a nuestro soporte por WhatsApp (+56 9 3685 0468) para asistirte con tu preparación.`,
      isVerified: false
    };
  }
}
