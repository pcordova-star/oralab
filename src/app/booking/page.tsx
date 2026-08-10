
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
import { ChevronLeft, ChevronRight, CalendarIcon, CheckCircle2, Download, AlertCircle, Home, Building2, Stethoscope, User, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/utils";
import { Progress } from "@/components/ui/progress";
import { jsPDF } from "jspdf";

const regions = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
  "Valparaíso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Ñuble", 
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

const communesByRegion: Record<string, string[]> = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Concón", "Quintero", "Puchuncaví", "Casablanca", "Juan Fernández", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar"],
  "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrequén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacaví", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Puerto Natales", "Torres del Paine", "Porvenir", "Primavera", "Timaukel", "Cabo de Hornos", "Antártica"]
};

const timeSlots = [];
for (let hour = 8; hour <= 12; hour++) {
  for (let min = 0; min < 60; min += 15) {
    if (hour === 12 && min > 0) break;
    const h = hour.toString().padStart(2, '0');
    const m = min.toString().padStart(2, '0');
    timeSlots.push(`${h}:${m}`);
  }
}

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
  birthDay: z.string().min(1, "Día"),
  birthMonth: z.string().min(1, "Mes"),
  birthYear: z.string().min(4, "Año"),
  weight: z.string().min(1, "Indique peso"),
  doctor: z.string().min(2, "Indique el médico"),
  country: z.string().min(1, "Seleccione país"),
  region: z.string().min(1, "Seleccione región"),
  commune: z.string().min(1, "Seleccione comuna"),
  sex: z.enum(["not_specified", "male", "female"], {
    required_error: "Seleccione una opción",
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const OPERATIONS_START_DATE = new Date(2026, 7, 1);

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [prepInstructions, setPrepInstructions] = useState<string>("");
  const [lastBookingValues, setLastBookingValues] = useState<BookingFormValues | null>(null);
  
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
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
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      weight: "",
      doctor: "",
      country: "Chile",
      region: "",
      commune: "",
      sex: "not_specified",
    },
  });

  const selectedDate = form.watch("scheduledDate");
  const selectedRegion = form.watch("region");
  const availableCommunes = selectedRegion ? [...(communesByRegion[selectedRegion] || [])].sort() : [];

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
    doc.roundedRect(margin, y, 170, 45, 3, 3, 'FD');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Nombre Completo: ${lastBookingValues.firstName} ${lastBookingValues.lastNameFather}`, margin + 5, y + 20);
    doc.text(`Examen: ${lastBookingValues.examType}`, margin + 5, y + 28);
    doc.text(`Fecha: ${format(lastBookingValues.scheduledDate, "d 'de' MMMM", { locale: es })}`, margin + 5, y + 36);
    doc.text(`Hora: ${lastBookingValues.scheduledTime} hrs`, 130, y + 36);
    y += 55;
    doc.setFont("helvetica", "bold");
    doc.text("INDICACIONES FUNDAMENTALES", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    const instructions = prepInstructions || "1. Ayuno de 12 horas.\n2. Dieta blanda el día anterior.\n3. No fumar ni realizar ejercicio intenso.\n4. No antibióticos en 4 semanas.";
    doc.text(doc.splitTextToSize(instructions, 170), margin, y);
    doc.save(`Reserva_Oralab_${lastBookingValues.firstName}.pdf`);
  }

  async function onSubmit(values: BookingFormValues) {
    if (!db) return;
    setIsSubmitting(true);
    const birthDate = `${values.birthYear}-${values.birthMonth}-${values.birthDay.padStart(2, '0')}`;
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
      birthDate: birthDate,
      weight: values.weight,
      doctor: values.doctor,
      country: values.country,
      region: values.region,
      commune: values.commune,
      sex: values.sex,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    try {
      const instructions = "1. Ayuno estricto de 12 horas.\n2. Dieta blanda el día anterior.\n3. No fumar ni realizar ejercicio intenso 2 horas antes.\n4. No haber tomado antibióticos en las últimas 4 semanas.";
      setPrepInstructions(instructions);
      
      await addDocumentNonBlocking(collection(db, "bookings"), bookingData);
      
      await addDocumentNonBlocking(collection(db, "mail"), {
        to: values.email, 
        message: {
          subject: `Confirmación de Reserva Oralab: ${values.firstName} ${values.lastNameFather}`,
          text: `Hola ${values.firstName}, tu reserva para ${values.examType} está confirmada para el día ${formattedDate} a las ${values.scheduledTime} hrs.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1c68b6;">Confirmación de Reserva</h2>
              <p>Hola <strong>${values.firstName}</strong>, tu cita para el test de <strong>${values.examType}</strong> ha sido agendada con éxito.</p>
              <hr />
              <p><strong>Día:</strong> ${formattedDate}</p>
              <p><strong>Hora:</strong> ${values.scheduledTime} hrs</p>
              <p><strong>Lugar:</strong> Apoquindo 3990, Of. 605, Las Condes.</p>
              <hr />
              <p style="color: #d97706;"><strong>RECUERDA:</strong> Ayuno de 12 horas y seguir la dieta blanda el día anterior.</p>
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
            <p className="mb-8 font-medium">Se envió un correo a <strong>{lastBookingValues?.email}</strong>.</p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <Button onClick={downloadPDF} variant="outline" className="rounded-full h-12 font-bold"><Download className="mr-2 h-4 w-4" /> Descargar PDF</Button>
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
                    <FormField control={form.control} name="examType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">Tipo de Examen</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 text-lg rounded-xl font-bold"><SelectValue placeholder="Seleccionar examen" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lactulosa">Test Lactulosa (SIBO)</SelectItem>
                            <SelectItem value="Fructosa">Test Fructosa</SelectItem>
                            <SelectItem value="Lactosa">Test Lactosa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="modality" render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">¿Dónde realizarás el test?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem className="flex items-center space-x-0 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="presential" id="p" className="hidden" />
                              </FormControl>
                              <FormLabel htmlFor="p" className={cn(
                                "flex-1 p-6 border-2 rounded-[2rem] cursor-pointer text-center transition-all duration-300",
                                field.value === "presential" ? "border-primary bg-primary/5 shadow-md" : "border-muted hover:border-primary/30"
                              )}>
                                <Building2 className={cn("h-8 w-8 mx-auto mb-2", field.value === "presential" ? "text-primary" : "text-muted-foreground")} />
                                <span className="block font-black text-lg">En Consulta</span>
                                <span className="text-xs font-medium text-muted-foreground">Las Condes, Santiago</span>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-0 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="home_kit" id="h" className="hidden" />
                              </FormControl>
                              <FormLabel htmlFor="h" className={cn(
                                "flex-1 p-6 border-2 rounded-[2rem] cursor-pointer text-center transition-all duration-300",
                                field.value === "home_kit" ? "border-secondary bg-secondary/5 shadow-md" : "border-muted hover:border-secondary/30"
                              )}>
                                <Home className={cn("h-8 w-8 mx-auto mb-2", field.value === "home_kit" ? "text-secondary" : "text-muted-foreground")} />
                                <span className="block font-black text-lg">Test en Casa</span>
                                <span className="text-xs font-medium text-muted-foreground">Retira tu Kit Oralab</span>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="button" onClick={nextStep} className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-lg">Continuar</Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-2">Fecha de tu Cita</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">Horario Disponible</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || isLoadingSlots}>
                          <FormControl>
                            <SelectTrigger className="h-14 text-lg rounded-xl font-bold">
                              {isLoadingSlots ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Seleccionar bloque horario" />}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map(t => (
                              <SelectItem key={t} value={t} disabled={occupiedSlots.includes(t)}>
                                {t} hrs {occupiedSlots.includes(t) ? "(Reservado)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-16 rounded-[1.5rem] font-bold">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-1 h-16 rounded-[1.5rem] font-black shadow-lg">Siguiente</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="font-bold">Nombre</FormLabel><Input placeholder="Tu nombre" {...field} className="rounded-xl h-12" /></FormItem>)} />
                      <FormField control={form.control} name="lastNameFather" render={({ field }) => (<FormItem><FormLabel className="font-bold">Apellido Paterno</FormLabel><Input placeholder="Apellido" {...field} className="rounded-xl h-12" /></FormItem>)} />
                      <FormField control={form.control} name="lastNameMother" render={({ field }) => (<FormItem><FormLabel className="font-bold">Apellido Materno</FormLabel><Input placeholder="Apellido" {...field} className="rounded-xl h-12" /></FormItem>)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="font-bold">Email</FormLabel><Input type="email" placeholder="correo@ejemplo.com" {...field} className="rounded-xl h-12" /></FormItem>)} />
                       <FormField control={form.control} name="phone" render={({ field }) => (
                         <FormItem>
                           <FormLabel className="font-bold">Teléfono (8 dígitos)</FormLabel>
                           <div className="flex items-center gap-2">
                             <span className="bg-muted px-3 h-12 rounded-xl flex items-center font-bold">+56 9</span>
                             <Input placeholder="12345678" {...field} maxLength={8} className="rounded-xl h-12" />
                           </div>
                         </FormItem>
                       )} />
                    </div>

                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel className="font-bold">Dirección Completa</FormLabel><Input placeholder="Calle, número, departamento" {...field} className="rounded-xl h-12" /></FormItem>)} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Región</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                            <SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="commune" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Comuna</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}>
                            <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                            <SelectContent>{availableCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>

                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                       <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-2">
                          <Stethoscope className="h-4 w-4" /> Info Médica
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="doctor" render={({ field }) => (<FormItem><FormLabel className="font-bold">Médico</FormLabel><Input placeholder="Nombre Dr." {...field} className="h-10 rounded-lg" /></FormItem>)} />
                          <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel className="font-bold">Peso (kg)</FormLabel><Input type="number" placeholder="70" {...field} className="h-10 rounded-lg" /></FormItem>)} />
                       </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-16 rounded-[1.5rem] font-bold">Atrás</Button>
                      <Button type="submit" className="flex-1 h-16 rounded-[1.5rem] font-black bg-secondary shadow-lg hover:bg-secondary/90 transition-all" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmar Reserva"}
                      </Button>
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
