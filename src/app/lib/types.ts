
export type ExamType = 'Lactulosa' | 'Fructosa' | 'Lactosa' | 'SIBO' | 'HP';

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
  type: 'breath' | 'ingest' | 'wait';
  durationMinutes: number;
  description: string;
}

export interface ExamProtocol {
  id: ExamType;
  name: string;
  instructions: string;
  steps: ProtocolStep[];
}

export const PROTOCOLS: Record<string, ExamProtocol> = {
  Lactulosa: {
    id: 'Lactulosa',
    name: 'Test de Lactulosa (SIBO/IMO)',
    instructions: 'Este test evalúa el sobrecrecimiento bacteriano. Siga los tiempos estrictamente.',
    steps: [
      { name: 'Muestra Basal (T-0)', type: 'breath', durationMinutes: 0, description: 'Sople en el primer tubo antes de ingerir nada.' },
      { name: 'Ingesta de Lactulosa', type: 'ingest', durationMinutes: 5, description: 'Beba la solución de lactulosa lentamente durante 5 minutos.' },
      { name: 'Espera Muestra 1', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto. No coma ni beba.' },
      { name: 'Muestra 2 (T-20)', type: 'breath', durationMinutes: 0, description: 'Sople en el segundo tubo.' },
      { name: 'Espera Muestra 2', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto.' },
      { name: 'Muestra 3 (T-40)', type: 'breath', durationMinutes: 0, description: 'Sople en el tercer tubo.' },
      { name: 'Espera Muestra 3', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto.' },
      { name: 'Muestra 4 (T-60)', type: 'breath', durationMinutes: 0, description: 'Sople en el cuarto tubo.' },
      { name: 'Espera Muestra 4', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto.' },
      { name: 'Muestra 5 (T-80)', type: 'breath', durationMinutes: 0, description: 'Sople en el quinto tubo.' },
      { name: 'Espera Muestra 5', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto.' },
      { name: 'Muestra 6 (T-100)', type: 'breath', durationMinutes: 0, description: 'Sople en el sexto tubo.' },
      { name: 'Espera Muestra 6', type: 'wait', durationMinutes: 20, description: 'Reposo absoluto.' },
      { name: 'Muestra 7 (T-120)', type: 'breath', durationMinutes: 0, description: 'Sople en el último tubo.' },
    ]
  },
  Fructosa: {
    id: 'Fructosa',
    name: 'Test de Fructosa',
    instructions: 'Evalúa malabsorción de fructosa. Las tomas son cada 30 minutos.',
    steps: [
      { name: 'Muestra Basal (T-0)', type: 'breath', durationMinutes: 0, description: 'Sople en el primer tubo.' },
      { name: 'Ingesta de Fructosa', type: 'ingest', durationMinutes: 5, description: 'Beba la solución de fructosa.' },
      { name: 'Espera Muestra 1', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 2 (T-30)', type: 'breath', durationMinutes: 0, description: 'Sople en el segundo tubo.' },
      { name: 'Espera Muestra 2', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 3 (T-60)', type: 'breath', durationMinutes: 0, description: 'Sople en el tercer tubo.' },
      { name: 'Espera Muestra 3', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 4 (T-90)', type: 'breath', durationMinutes: 0, description: 'Sople en el cuarto tubo.' },
      { name: 'Espera Muestra 4', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 5 (T-120)', type: 'breath', durationMinutes: 0, description: 'Sople en el último tubo.' },
    ]
  },
  Lactosa: {
    id: 'Lactosa',
    name: 'Test de Lactosa',
    instructions: 'Evalúa intolerancia a la lactosa. Las tomas son cada 30 minutos.',
    steps: [
      { name: 'Muestra Basal (T-0)', type: 'breath', durationMinutes: 0, description: 'Sople en el primer tubo.' },
      { name: 'Ingesta de Lactosa', type: 'ingest', durationMinutes: 5, description: 'Beba la solución de lactosa.' },
      { name: 'Espera Muestra 1', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 2 (T-30)', type: 'breath', durationMinutes: 0, description: 'Sople en el segundo tubo.' },
      { name: 'Espera Muestra 2', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 3 (T-60)', type: 'breath', durationMinutes: 0, description: 'Sople en el tercer tubo.' },
      { name: 'Espera Muestra 3', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 4 (T-90)', type: 'breath', durationMinutes: 0, description: 'Sople en el cuarto tubo.' },
      { name: 'Espera Muestra 4', type: 'wait', durationMinutes: 30, description: 'Reposo.' },
      { name: 'Muestra 5 (T-120)', type: 'breath', durationMinutes: 0, description: 'Sople en el último tubo.' },
    ]
  }
};
