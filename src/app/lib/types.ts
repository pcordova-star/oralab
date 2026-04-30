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
}

export const PROTOCOLS: Record<ExamType, ExamProtocol> = {
  SIBO: {
    id: 'SIBO',
    name: 'Sobrecrecimiento Bacteriano (SIBO)',
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
    steps: [
      { name: 'Muestra Basal', waitMinutes: 0, description: 'Tomar muestra de aire basal.' },
      { name: 'Administrar Solución', waitMinutes: 0, description: 'Paciente debe ingerir la cápsula/solución de Urea C13.' },
      { name: 'Esperar 15min', waitMinutes: 15, description: 'El paciente debe esperar sentado y en reposo.' },
      { name: 'Muestra Final', waitMinutes: 0, description: 'Tomar la muestra de aire post-sustrato.' },
    ]
  }
};