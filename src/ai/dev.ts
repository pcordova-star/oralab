import { config } from 'dotenv';
config();

import '@/ai/flows/generate-prep-instructions.ts';
import '@/ai/flows/patient-chat-flow.ts';
import '@/ai/flows/analyze-medical-order.ts';
