"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  CheckCircle2, 
  Download, 
  Home, 
  Building2, 
  Loader2, 
  Truck, 
  Wallet, 
  ReceiptText,
  FileUp,
  ScanSearch,
  CircleDollarSign,
  Info,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { jsPDF } from "jspdf";
import { analyzeMedicalOrder } from "@/ai/flows/analyze-medical-order";

const regions = [
  "Metropolitana de Santiago", "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
  "Valparaíso", "O'Higgins", "Maule", "Ñuble", 
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

const communesByRegion: Record<string, string[]> = {
  "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
};

const DELIVERY_PRICES: Record<string, number> = {
  "Las Condes": 8000, "Vitacura": 8000, "Providencia": 8000, "Lo Barnechea": 8000,
  "La Reina": 10000, "Ñuñoa": 10000, "Santiago": 10000, "Recoleta": 10000, "Independencia": 10000, "Huechuraba": 10000,
  "Peñalolén": 13000, "Macul": 13000, "San Joaquín": 13000, "Estación Central": 13000, "Quinta Normal": 13000, "Conchalí": 13000, "Cerrillos": 13000,
  "La Florida": 16000, "San Miguel": 16000, "Lo Prado": 16000, "Pedro Aguirre Cerda": 16000, "Cerro Navia": 16000, "Renca": 16000, "Quilicura": 16000, "Pudahuel": 16000,
  "Maipú": 20000, "El Bosque": 20000, "La Cisterna": 20000, "Lo Espejo": 20000, "La Granja": 20000, "San Ramón": 20000, "La Pintana": 20000, "Puente Alto": 20000, "San Bernardo": 20000,
  "Colina": 25000, "Lampa": 25000, "Padre Hurtado": 25000, "Peñaflor": 25000, "Calera de Tango": 25000, "Buin": 25000, "Talagante": 25000,
  "Isla de Maipo": 30000, "El Monte": 30000, "Melipilla": 30000, "Curacaví": 30000, "María Pinto": 30000, "Pirque": 30000, "San José de Maipo": 30000, "Alhué": 30000, "Paine": 30000, "San Pedro": 30000, "Tiltil": 30000
};

const BASE_FEE = 80000;
const DISCOUNT_RATE = 0.20;

const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];

const bookingSchema = z.object({
  examType: z.enum(["Lactulosa", "Fructosa", "Lactosa"], { required_error: "Seleccione tipo de examen" }),
  modality: z.enum(["presential", "home_kit"], { required_error: "Seleccione modalidad" }),
  scheduledDate: z.date({ required_error: "Seleccione una fecha" }),
  scheduledTime: z.string().min(1, "Seleccione una hora"),
  firstName: z.string().min(2, "Requerido"),
  lastNameFather: z.string().min(2, "Requerido"),
  lastNameMother: z.string().min(2, "Requerido"),
  email: z.string().email("Email inválido").min(1, "Requerido"),
  phone: z.string().length(8, "Deben ser 8 dígitos"),
  address: z.string().min(5, "Dirección requerida"),
  weight: z.string().min(1, "Indique peso"),
  prevision: z.enum(["fonasa", "isapre", "particular"], { required_error: "Indique su previsión" }),
  country: z.string().min(1, "Seleccione país"),
  region: z.string().min(1, "Seleccione región"),
  commune: z.string().min(1, "Seleccione comuna"),
  sex: z.enum(["not_specified", "male", "female"], {
    required_error: "Seleccione una opción",
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const OPERATIONS_START_DATE = new Date(2025, 2, 1);

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastBookingValues, setLastBookingValues] = useState<BookingFormValues | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      examType: "Lactulosa",
      modality: "presential",
      scheduledDate: undefined,
      scheduledTime: "",
      firstName: "",
      lastNameFather: "",
      lastNameMother: "",
      email: "",
      phone: "",
      address: "",
      weight: "",
      prevision: "particular",
      country: "Chile",
      region: "Metropolitana de Santiago",
      commune: "",
      sex: "not_specified",
    },
  });

  const selectedDate = form.watch("scheduledDate");
  const selectedRegion = form.watch("region");
  const selectedCommune = form.watch("commune");
  const selectedModality = form.watch("modality");
  const selectedPrevision = form.watch("prevision");

  const availableCommunes = selectedRegion ? [...(communesByRegion[selectedRegion] || [])].sort() : [];

  const deliveryFee = (selectedModality === 'home_kit' && selectedCommune) 
    ? (DELIVERY_PRICES[selectedCommune] || 30000) 
    : 0;

  const discountAmount = (selectedPrevision === "fonasa" || selectedPrevision === "isapre") ? BASE_FEE * DISCOUNT_RATE : 0;
  const examSubtotal = BASE_FEE - discountAmount;
  const finalTotal = examSubtotal + deliveryFee;

  useEffect(() => {
    async function checkAvailability() {
      if (!selectedDate || !db) return;
      setIsLoadingSlots(true);
      form.setValue("scheduledTime", ""); 
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const q = query(
          collection(db, "bookings"),
          where("scheduledDate", "==", formattedDate),
          where("status", "!=", "cancelled")
        );
        const snapshot = await getDocs(q);
        const slots = snapshot.docs.map(doc => doc.data().scheduledTime);
        setOccupiedSlots(slots);
      } catch (error) {
        console.error("Error checking availability:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    checkAvailability();
  }, [selectedDate, db, form]);

  useEffect(() => {
    if (selectedRegion) {
      form.setValue("commune", "");
    }
  }, [selectedRegion, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Solo permitir imágenes para asegurar el procesamiento por la IA
    if (!file.type.startsWith('image/')) {
      toast({ 
        variant: "destructive", 
        title: "Archivo no válido", 
        description: "Por favor sube una fotografía (JPG o PNG) de tu orden." 
      });
      return;
    }

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const result = await analyzeMedicalOrder({ photoDataUri: base64String });
        if (result.detectedExam !== 'Desconocido' && result.confidence > 0.5) {
          form.setValue("examType", result.detectedExam as any);
          toast({ title: "Orden Analizada", description: `Hemos detectado: ${result.detectedExam}.` });
        } else {
          toast({ 
            variant: "destructive", 
            title: "Detección fallida", 
            description: "No pudimos leer el examen. Por favor selecciónalo manualmente." 
          });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Error al procesar", description: "Ocurrió un error técnico al analizar la foto." });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  async function nextStep() {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["examType", "modality"];
    if (step === 2) fieldsToValidate = ["scheduledDate", "scheduledTime"];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(step + 1);
  }

  function prevStep() {
    setStep(step - 1);
  }

  async function downloadPDF() {
    if (!lastBookingValues) return;
    const doc = new jsPDF();
    const margin = 20;
    let y = 15;
    const primaryRGB = [28, 104, 182];

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("Oralab", margin, 25);
    doc.setFontSize(10);
    doc.text(`Fecha Emisión: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 145, 25);
    y = 55;
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.text("CONFIRMACIÓN DE RESERVA CLÍNICA", margin, y);
    y += 15;
    doc.setFillColor(245, 247, 249);
    doc.roundedRect(margin, y, 170, 85, 3, 3, 'FD');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Paciente: ${lastBookingValues.firstName} ${lastBookingValues.lastNameFather}`, margin + 5, y + 15);
    doc.text(`Examen: ${lastBookingValues.examType}`, margin + 5, y + 23);
    doc.text(`Fecha: ${format(lastBookingValues.scheduledDate, "d 'de' MMMM, yyyy", { locale: es })}`, margin + 5, y + 31);
    doc.text(`Hora: ${lastBookingValues.scheduledTime} hrs`, 130, y + 31);
    doc.text(`Previsión: ${lastBookingValues.prevision.toUpperCase()}`, margin + 5, y + 39);
    
    y += 45;
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE PAGO", margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Valor Examen: $${BASE_FEE.toLocaleString()}`, margin + 5, y + 8);
    if (discountAmount > 0) doc.text(`Descuento Previsión: -$${discountAmount.toLocaleString()}`, margin + 5, y + 16);
    if (deliveryFee > 0) doc.text(`Tarifa Logística Motoboy: $${deliveryFee.toLocaleString()}`, margin + 5, y + 24);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL A PAGAR: $${finalTotal.toLocaleString()}`, margin + 5, y + 32);
    
    y += 50;
    doc.setFontSize(11);
    doc.text("INDICACIONES FUNDAMENTALES", margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let instructions = "1. Ayuno estricto de 12 horas.\n2. Dieta blanda el día anterior.\n3. No fumar ni realizar ejercicio intenso 2 horas antes.\n4. No haber tomado antibióticos ni probióticos en las últimas 4 semanas.";
    if (lastBookingValues.modality === 'home_kit') {
      instructions += "\n\nPROCEDIMIENTO TEST EN CASA:\n- Retira el kit a la hora elegida en Apoquindo 3990.\n- Recibe la instrucción del profesional a cargo.\n- Una vez realizado, coordina el retiro con el motoboy indicado en el flyer.\n- IMPORTANTE: El test tiene un plazo máximo de 6 horas para ser entregado en el laboratorio.";
    }
    doc.text(doc.splitTextToSize(instructions, 170), margin, y);
    doc.save(`Reserva_Oralab_${lastBookingValues.firstName}.pdf`);
  }

  async function onSubmit(values: BookingFormValues) {
    if (!db) return;
    setIsSubmitting(true);
    const formattedDate = format(values.scheduledDate, "d 'de' MMMM, yyyy", { locale: es });
    const bookingData = {
      examType: values.examType,
      modality: values.modality,
      scheduledDate: format(values.scheduledDate, "yyyy-MM-dd"),
      scheduledTime: values.scheduledTime,
      firstName: values.firstName,
      lastNameFather: values.lastNameFather,
      lastNameMother: values.lastNameMother,
      email: values.email,
      phone: `+56 9 ${values.phone}`,
      address: values.address,
      weight: values.weight,
      prevision: values.prevision,
      deliveryFee: deliveryFee,
      baseFee: BASE_FEE,
      discount: discountAmount,
      total: finalTotal,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    try {
      await addDocumentNonBlocking(collection(db, "bookings"), bookingData);
      const homeKitText = values.modality === 'home_kit' 
        ? `<p style="color: #1c68b6; font-weight: bold;">PROCEDIMIENTO TEST EN CASA:</p>
           <ul>
             <li>Retira el kit a la hora elegida en nuestro laboratorio (Apoquindo 3990).</li>
             <li>Recibirás la instrucción técnica del profesional a cargo.</li>
             <li>Una vez terminado el test, coordina el retiro con el motoboy que aparece en tu flyer.</li>
             <li><strong>TIEMPO LÍMITE:</strong> El test debe estar en el laboratorio en máximo 6 horas tras ser realizado.</li>
           </ul>`
        : "";

      await addDocumentNonBlocking(collection(db, "mail"), {
        to: values.email, 
        message: {
          subject: `Confirmación de Reserva Oralab: ${values.firstName} ${values.lastNameFather}`,
          text: `Hola ${values.firstName}, tu reserva está confirmada para el día ${formattedDate}.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #1c68b6;">Confirmación de Reserva</h2>
              <p>Hola <strong>${values.firstName}</strong>, tu cita para el test de <strong>${values.examType}</strong> ha sido agendada.</p>
              <div style="padding: 15px; background: #f0f7ff; margin-bottom: 20px;">
                <p><strong>Día:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${values.scheduledTime} hrs</p>
                <p><strong>Lugar:</strong> ${values.modality === 'home_kit' ? 'Test en Casa (Retiro Kit en Apoquindo 3990)' : 'Apoquindo 3990, Las Condes'}</p>
              </div>
              ${homeKitText}
              <p><strong>Total Final a Pagar: $${finalTotal.toLocaleString()}</strong></p>
              <p style="color: #d97706;">RECUERDA: Ayuno de 12 horas y seguir la dieta blanda el día anterior.</p>
              <p style="font-size: 12px; color: #64748b;">© 2024 Oralab Clinical Lab. Tecnología Sunvou®.</p>
            </div>
          `
        }
      });
      setLastBookingValues(values);
      toast({ title: "Reserva Confirmada" });
      setStep(4);
    } catch (error) {
      toast({ variant: "destructive", title: "Error al procesar" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 4) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-12">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-3xl text-center">
          <Card className="py-12 shadow-lg rounded-[2rem] border-primary/10">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl mb-4 font-black italic">¡Reserva Confirmada!</CardTitle>
            <p className="mb-8 font-medium">Se envió un comprobante con las instrucciones y desglose de pago a <strong>{lastBookingValues?.email}</strong>.</p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button onClick={downloadPDF} variant="outline" className="rounded-full h-12 font-bold"><Download className="mr-2 h-4 w-4" /> Descargar Ficha PDF</Button>
              <Link href="/"><Button className="rounded-full w-full h-12 font-black">Volver al inicio</Button></Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-12">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8"><Progress value={(step / 3) * 100} className="h-2" /></div>
        <Card className="shadow-2xl overflow-hidden rounded-[2.5rem] border-primary/5">
          <CardHeader className="bg-primary/5 border-b py-8">
            <div className="flex items-center gap-3 mb-2">
               <CalendarIcon className="h-6 w-6 text-secondary" />
               <CardTitle className="text-2xl font-black italic text-primary">
                 {step === 1 ? "Elige Modalidad" : step === 2 ? "Selecciona Fecha" : "Tus Datos Clínicos"}
               </CardTitle>
            </div>
            <CardDescription className="font-medium">Estamos a pocos pasos de programar tu evaluación digestiva.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-6 md:px-12 pb-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <Card className="bg-secondary/5 border-dashed border-2 border-secondary/30 rounded-[2rem] p-6 relative overflow-hidden group">
                      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="bg-secondary text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                          {isAnalyzing ? <Loader2 className="h-8 w-8 animate-spin" /> : <ScanSearch className="h-8 w-8" />}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-black text-primary italic text-lg flex items-center justify-center md:justify-start gap-2">
                            ¿Tienes Foto de tu Orden? <span className="text-[10px] bg-secondary/20 px-2 py-0.5 rounded text-secondary not-italic uppercase font-black">Opcional</span>
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium">Sube una foto clara para detectar el examen automáticamente.</p>
                        </div>
                        <div className="relative">
                          <Input type="file" accept="image/*" className="hidden" id="order-upload" onChange={handleFileUpload} disabled={isAnalyzing} />
                          <label htmlFor="order-upload">
                            <Button asChild variant="outline" className="rounded-full font-bold border-secondary text-secondary hover:bg-secondary hover:text-white cursor-pointer h-12 px-6">
                              <span><FileUp className="mr-2 h-4 w-4" /> {isAnalyzing ? "Analizando..." : "Sugerir con Foto"}</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </Card>

                    <FormField control={form.control} name="examType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tipo de Examen</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-14 text-lg rounded-xl font-bold"><SelectValue placeholder="Seleccionar examen" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Lactulosa">Test Lactulosa (SIBO)</SelectItem>
                            <SelectItem value="Fructosa">Test Fructosa</SelectItem>
                            <SelectItem value="Lactosa">Test Lactosa</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="modality" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">¿Dónde realizarás el test?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem className="flex items-center space-x-0 space-y-0">
                              <FormControl><RadioGroupItem value="presential" id="p" className="hidden" /></FormControl>
                              <FormLabel htmlFor="p" className={cn("flex-1 p-6 border-2 rounded-[2rem] cursor-pointer text-center transition-all", field.value === "presential" ? "border-primary bg-primary/5" : "border-muted")}>
                                <Building2 className={cn("h-8 w-8 mx-auto mb-2", field.value === "presential" ? "text-primary" : "text-muted-foreground")} />
                                <span className="block font-black text-lg">En Consulta</span>
                                <span className="text-xs font-medium text-muted-foreground">Apoquindo 3990, Las Condes</span>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-0 space-y-0">
                              <FormControl><RadioGroupItem value="home_kit" id="h" className="hidden" /></FormControl>
                              <FormLabel htmlFor="h" className={cn("flex-1 p-6 border-2 rounded-[2rem] cursor-pointer text-center transition-all", field.value === "home_kit" ? "border-secondary bg-secondary/5" : "border-muted")}>
                                <Home className={cn("h-8 w-8 mx-auto mb-2", field.value === "home_kit" ? "text-secondary" : "text-muted-foreground")} />
                                <span className="block font-black text-lg">Test en Casa</span>
                                <span className="text-xs font-medium text-muted-foreground">Retira tu Kit Oralab</span>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )} />

                    {selectedModality && (
                      <div className="space-y-4 animate-in slide-in-from-bottom-4">
                        {selectedModality === 'home_kit' && (
                          <div className="bg-secondary/10 p-6 rounded-[2rem] border border-secondary/20 space-y-3">
                            <h5 className="font-black text-secondary flex items-center gap-2 text-sm italic"><Info className="h-4 w-4" /> Procedimiento Test en Casa</h5>
                            <ul className="text-xs font-medium text-muted-foreground space-y-2 list-disc pl-5">
                              <li>Deberás <strong>retirar el kit</strong> en el laboratorio a la hora elegida (Apoquindo 3990).</li>
                              <li>Recibirás la instrucción de uso por parte de un profesional.</li>
                              <li>Tras realizar el test, coordina el retiro con el motoboy indicado en el flyer.</li>
                              <li className="text-secondary font-black">IMPORTANTE: Plazo máximo de 6 horas para retorno al lab.</li>
                            </ul>
                          </div>
                        )}
                        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl"><CircleDollarSign className="h-6 w-6 text-primary" /></div>
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase">Valor del Examen</p>
                              <p className="text-2xl font-black text-primary italic">$ {BASE_FEE.toLocaleString()} CLP</p>
                            </div>
                          </div>
                          {selectedModality === 'home_kit' && <Badge variant="outline" className="text-secondary border-secondary/20"><Truck className="h-3 w-3 mr-1" /> + Logística</Badge>}
                        </div>
                      </div>
                    )}
                    <Button type="button" onClick={nextStep} className="w-full h-16 rounded-[1.5rem] text-xl font-black">Continuar</Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right">
                    <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-black text-xs uppercase text-muted-foreground">Fecha de tu Cita / Retiro Kit</FormLabel>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full h-14 text-xl font-bold rounded-xl pl-3 text-left", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP", { locale: es }) : "Elegir día"}
                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsCalendarOpen(false); }} disabled={(d) => isBefore(d, OPERATIONS_START_DATE) || isWeekend(d)} locale={es} />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-xs uppercase text-muted-foreground">Bloque Horario</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || isLoadingSlots}>
                          <FormControl><SelectTrigger className="h-14 text-lg rounded-xl font-bold">{isLoadingSlots ? <Loader2 className="animate-spin h-4 w-4" /> : <SelectValue placeholder="Seleccionar bloque" />}</SelectTrigger></FormControl>
                          <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t} disabled={occupiedSlots.includes(t)}>{t} hrs {occupiedSlots.includes(t) ? "(Reservado)" : ""}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-16 rounded-[1.5rem] font-bold">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 h-16 rounded-[1.5rem] font-black">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="font-bold">Nombre</FormLabel><Input {...field} className="rounded-xl h-12" /></FormItem>)} />
                      <FormField control={form.control} name="lastNameFather" render={({ field }) => (<FormItem><FormLabel className="font-bold">Apellido P.</FormLabel><Input {...field} className="rounded-xl h-12" /></FormItem>)} />
                      <FormField control={form.control} name="lastNameMother" render={({ field }) => (<FormItem><FormLabel className="font-bold">Apellido M.</FormLabel><Input {...field} className="rounded-xl h-12" /></FormItem>)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="font-bold">Email</FormLabel><Input type="email" {...field} className="rounded-xl h-12" /></FormItem>)} />
                       <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="font-bold">Teléfono</FormLabel><div className="flex items-center gap-2"><span className="bg-muted px-3 h-12 rounded-xl flex items-center font-bold">+56 9</span><Input {...field} maxLength={8} className="rounded-xl h-12" /></div></FormItem>)} />
                    </div>

                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel className="font-bold">Dirección</FormLabel><Input {...field} className="rounded-xl h-12" /></FormItem>)} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Región</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />
                      <FormField control={form.control} name="commune" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Comuna</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent>{availableCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="prevision" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold">Previsión (20% Desc)</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="fonasa">Fonasa (20% Desc)</SelectItem><SelectItem value="isapre">Isapre (20% Desc)</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent></Select></FormItem>
                      )} />
                      <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel className="font-bold">Peso (kg)</FormLabel><Input type="number" {...field} className="h-12 rounded-xl" /></FormItem>)} />
                    </div>

                    <Card className="bg-primary/5 border-primary/10 rounded-[2rem] overflow-hidden">
                      <div className="p-6 space-y-4">
                         <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b border-primary/10 pb-2"><ReceiptText className="h-4 w-4" /> Desglose de Pago</div>
                         <div className="space-y-2 text-sm">
                           <div className="flex justify-between"><span>Valor Examen:</span><span className="font-bold">$ {BASE_FEE.toLocaleString()}</span></div>
                           {discountAmount > 0 && <div className="flex justify-between text-green-600"><span><Wallet className="inline h-3 w-3 mr-1" /> Descuento Previsión:</span><span className="font-black">- $ {discountAmount.toLocaleString()}</span></div>}
                           {deliveryFee > 0 && <div className="flex justify-between text-secondary"><span><Truck className="inline h-3 w-3 mr-1" /> Logística Motoboy:</span><span className="font-black">+ $ {deliveryFee.toLocaleString()}</span></div>}
                         </div>
                         <div className="bg-primary/10 -mx-6 -mb-6 p-6 flex justify-between items-center text-primary italic">
                            <span className="font-black text-sm uppercase">Total Final:</span>
                            <span className="text-3xl font-black">$ {finalTotal.toLocaleString()} CLP</span>
                         </div>
                      </div>
                    </Card>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-16 rounded-[1.5rem] font-bold">Atrás</Button>
                      <Button type="submit" className="flex-1 h-16 rounded-[1.5rem] font-black bg-secondary shadow-lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Reserva"}</Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
