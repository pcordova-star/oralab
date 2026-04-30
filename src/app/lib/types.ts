export type ExamType = 'SIBO' | 'HP';

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in_progress' | 'completed';

export interface Patient {
  id: string;
  name: string;
  rut: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  examType: ExamType;
  datetime: string;
  status: AppointmentStatus;
}

export interface ProtocolStep {
  name: string;
  waitMinutes: number;
  description: string;
}

export interface ExamProtocol {
  id: ExamType;
  name: string;
  steps: ProtocolStep[];
  instructions: string;
}

export const PROTOCOLS: Record<ExamType, ExamProtocol> = {
  SIBO: {
    id: 'SIBO',
    name: 'Sobrecrecimiento Bacteriano (SIBO)',
    instructions: `**Instrucciones para Examen SIBO:**
1. **Preparación (24 horas antes):** Evitar antibióticos, laxantes, probióticos y medicamentos que afecten la motilidad intestinal.
2. **Preparación (12 horas antes):** Ayuno obligatorio. No comer, beber (excepto agua pura sin gas), fumar ni masticar chicle.
3. **El día del examen:** Traer una lista de sus medicamentos actuales. El test consiste en soplar en bolsas especiales, beber una solución de sustrato y volver a soplar en intervalos de tiempo. La duración total es de aproximadamente 3 horas.
4. **Importante:** Si ha consumido algún elemento restringido, informe a la recepción al llegar, ya que es posible que deba reprogramar su cita.`,
    steps: [
      { name: 'Muestra Basal', waitMinutes: 0, description: 'Tomar la primera muestra de aire antes de ingerir solución.' },
      { name: 'Esperar 15min', waitMinutes: 15, description: 'Período de reposo después de ingerir el sustrato.' },
      { name: 'Muestra 1', waitMinutes: 0, description: 'Tomar la segunda muestra de aire.' },
      { name: 'Esperar 15min', waitMinutes: 15, description: 'Período de reposo.' },
      { name: 'Muestra 2', waitMinutes: 0, description: 'Tomar la tercera muestra de aire.' },
      { name: 'Esperar 15min', waitMinutes: 15, description: 'Período de reposo.' },
      { name: 'Muestra 3', waitMinutes: 0, description: 'Tomar la cuarta y última muestra de aire.' },
    ]
  },
  HP: {
    id: 'HP',
    name: 'Helicobacter Pylori (HP)',
    instructions: `**Instrucciones para Examen Helicobacter pylori (HP):**
1. **Preparación (4 semanas antes):** No haber tomado antibióticos.
2. **Preparación (2 semanas antes):** No haber tomado medicamentos que contengan bismuto (ej. Pepto-Bismol).
3. **Preparación (1 semana antes):** No haber tomado inhibidores de la bomba de protones (PPI) como omeprazol, lansoprazol, pantoprazol, esomeprazol.
4. **Preparación (24 horas antes):** No tomar bloqueadores H2 (ej. famotidina).
5. **Preparación (12 horas antes):** Ayuno obligatorio. No comer, beber (excepto agua pura sin gas), fumar ni masticar chicle.
6. **El día del examen:** El test consiste en soplar una muestra basal, beber una solución de Urea C13 y soplar nuevamente tras 15 minutos. La duración total es de aproximadamente 30 minutos.`,
    steps: [
      { name: 'Muestra Basal', waitMinutes: 0, description: 'Tomar muestra de aire basal.' },
      { name: 'Administrar Solución', waitMinutes: 0, description: 'Paciente debe ingerir la cápsula/solución de Urea C13.' },
      { name: 'Esperar 15min', waitMinutes: 15, description: 'El paciente debe esperar sentado y en reposo.' },
      { name: 'Muestra Final', waitMinutes: 0, description: 'Tomar la muestra de aire post-sustrato.' },
    ]
  }
};
