'use server';
/**
 * @fileOverview Chatbot Experto de Oralab mejorado para Genkit 1.x.
 * Incluye depuración detallada para diagnosticar problemas de API Key o Facturación.
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
      return { found: false };
    }
  }
);

export async function patientChat(input: PatientChatInput): Promise<PatientChatOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    return {
      text: "Hola, detecto que la API Key en el archivo .env no es válida o está incompleta. Por favor revisa que sea la clave correcta de Google AI Studio.",
      isVerified: false
    };
  }

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
      
      Instrucción: Responde siempre en ESPAÑOL de Chile de forma profesional y empática.`,
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
      text: response.text || "No pude generar una respuesta. ¿En qué más puedo ayudarte?",
      isVerified: true, 
    };
  } catch (error: any) {
    // Registro detallado en la terminal del desarrollador
    console.error("--- DIAGNÓSTICO DE ERROR DE IA ---");
    console.error("Mensaje:", error.message);
    
    let userFriendlyMsg = "Lo siento, mi sistema de IA está experimentando una breve interrupción técnica.";
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('403')) {
      userFriendlyMsg = "La API Key configurada no tiene permisos suficientes o es inválida. Por favor, verifica la facturación en Google Cloud Console.";
      console.error("PROBLEMA: La clave API no es válida para este servicio.");
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      userFriendlyMsg = "He agotado mi cuota de consultas. Por favor, intenta de nuevo en unos minutos o verifica tu plan prepago.";
      console.error("PROBLEMA: Límite de cuota excedido.");
    } else {
      console.error("DETALLE TÉCNICO:", error);
    }

    return {
      text: userFriendlyMsg,
      isVerified: false
    };
  }
}
