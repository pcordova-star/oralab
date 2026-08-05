
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
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, CheckCircle2, Download, Mail, AlertCircle, Home, Building2, Stethoscope, MessageCircle, HelpCircle, User, MapPin, Scale, Loader2 } from "lucide-react";
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
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
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
  diagnosis: z.string().min(2, "Indique el diagnóstico"),
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
  
  // Disponibilidad de horarios
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
      diagnosis: "",
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
  const selectedModality = form.watch("modality");
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

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { v: "01", l: "Enero" }, { v: "02", l: "Febrero" }, { v: "03", l: "Marzo" },
    { v: "04", l: "Abril" }, { v: "05", l: "Mayo" }, { v: "06", l: "Junio" },
    { v: "07", l: "Julio" }, { v: "08", l: "Agosto" }, { v: "09", l: "Septiembre" },
    { v: "10", l: "Octubre" }, { v: "11", l: "Noviembre" }, { v: "12", l: "Diciembre" }
  ];
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

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
    const secondaryRGB = [25, 204, 204];

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("Oralab", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Breath Diagnostics", margin, 32);

    doc.setFontSize(10);
    doc.text(`Fecha Emisión: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 145, 25);
    doc.text("ID Reserva: ORL-" + Math.random().toString(36).substr(2, 6).toUpperCase(), 145, 30);

    y = 55;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIRMACIÓN DE RESERVA CLÍNICA", margin, y);
    y += 15;

    doc.setFillColor(245, 247, 249);
    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(margin, y, 170, 45, 3, 3, 'FD');
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PACIENTE", margin + 5, y + 10);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre Completo: ${lastBookingValues.firstName} ${lastBookingValues.lastNameFather} ${lastBookingValues.lastNameMother}`, margin + 5, y + 20);
    doc.text(`Email: ${lastBookingValues.email}`, margin + 5, y + 28);
    doc.text(`Teléfono: +56 9 ${lastBookingValues.phone}`, margin + 5, y + 36);
    
    doc.text(`Peso: ${lastBookingValues.weight} kg`, 130, y + 20);
    doc.text(`Médico: ${lastBookingValues.doctor}`, 130, y + 28);
    y += 55;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DEL PROCEDIMIENTO", margin, y);
    y += 8;

    doc.setDrawColor(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, 190, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Examen: Test de Aire Espirado (${lastBookingValues.examType})`, margin, y);
    y += 8;
    doc.text(`Modalidad: ${lastBookingValues.modality === 'home_kit' ? 'RETIRO DE KIT (En consulta)' : 'CITA PRESENCIAL'}`, margin, y);
    y += 8;
    
    doc.setFillColor(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
    doc.rect(margin, y, 100, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`${format(lastBookingValues.scheduledDate, "EEEE d 'de' MMMM", { locale: es }).toUpperCase()} - ${lastBookingValues.scheduledTime} HRS`, margin + 5, y + 10);
    y += 25;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INDICACIONES FUNDAMENTALES", margin, y);
    y += 8;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const instructions = prepInstructions || "1. Ayuno de 12 horas.\n2. Dieta blanda el día anterior (sin fibra, sin legumbres).\n3. No fumar ni realizar ejercicio intenso 2 horas antes.\n4. No haber tomado antibióticos ni probióticos en las últimas 4 semanas.";
    const splitInstructions = doc.splitTextToSize(instructions, 170);
    doc.text(splitInstructions, margin, y);
    y += (splitInstructions.length * 5) + 15;

    doc.setFillColor(245, 247, 249);
    doc.rect(0, doc.internal.pageSize.height - 30, 210, 30, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Apoquindo 3990, Of. 605, Las Condes, Santiago. contacto@oralab.cl", margin, doc.internal.pageSize.height - 15);

    doc.save(`Reserva_Oralab_${lastBookingValues.firstName}_${lastBookingValues.lastNameFather}.pdf`);
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
      diagnosis: values.diagnosis,
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
      const instructions = "1. Ayuno estricto de 12 horas.\n2. Dieta blanda el día anterior (arroz, pollo/pescado a la plancha, evitar legumbres, frutas y verduras).\n3. No fumar ni realizar ejercicio intenso 2 horas antes.\n4. No haber tomado antibióticos ni probióticos en las últimas 4 semanas.";
      setPrepInstructions(instructions);
      
      const bookingsRef = collection(db, "bookings");
      await addDocumentNonBlocking(bookingsRef, bookingData);
      
      // Trigger Correo Electrónico (Vía Trigger Email Extension)
      const mailRef = collection(db, "mail");
      await addDocumentNonBlocking(mailRef, {
        to: values.email,
        message: {
          subject: `Confirmación de Reserva Oralab: ${values.firstName} ${values.lastNameFather}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
              <div style="background-color: #1c68b6; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Oralab</h1>
                <p style="color: #19cccc; margin: 5px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">Salud Digestiva Avanzada</p>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #1c68b6;">¡Hola ${values.firstName}!</h2>
                <p>Tu reserva ha sido procesada con éxito. A continuación, te presentamos los detalles de tu cita:</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; margin: 20px 0;">
                  <p><strong>Procedimiento:</strong> Test de Aire Espirado (${values.examType})</p>
                  <p><strong>Modalidad:</strong> ${values.modality === 'home_kit' ? 'Retiro de Kit (En oficina)' : 'Cita Presencial'}</p>
                  <p><strong>Fecha:</strong> ${formattedDate}</p>
                  <p><strong>Hora:</strong> ${values.scheduledTime} hrs</p>
                </div>

                <h3 style="color: #1c68b6; border-bottom: 2px solid #19cccc; padding-bottom: 5px;">Instrucciones de Preparación</h3>
                <p style="font-size: 14px; line-height: 1.6;">Para asegurar la validez técnica de tu examen, es <strong>obligatorio</strong> seguir estas indicaciones:</p>
                <ul style="font-size: 14px; line-height: 1.6;">
                  <li><strong>Ayuno de 12 horas:</strong> No ingerir alimentos ni bebidas (excepto agua) 12 horas antes del test.</li>
                  <li><strong>Dieta Blanda:</strong> El día anterior consumir únicamente arroz, fideos blancos, pollo o pescado a la plancha. Evitar legumbres, frutas, verduras, leche y jugos.</li>
                  <li><strong>Hábitos:</strong> No fumar ni realizar ejercicio intenso 2 horas antes de la toma de muestra.</li>
                  <li><strong>Medicamentos:</strong> No haber tomado antibióticos ni probióticos en las últimas 4 semanas.</li>
                </ul>

                <div style="margin-top: 30px; padding: 15px; background-color: #fff4f4; border-radius: 10px; text-align: center;">
                  <p style="color: #c00; margin: 0; font-weight: bold;">¿Necesitas reagendar?</p>
                  <p style="font-size: 12px; margin: 5px 0 0 0;">Avísanos con al menos 24 hrs de antelación vía WhatsApp al +56 9 3685 0468.</p>
                </div>
              </div>
              <div style="background-color: #f4f7f9; padding: 20px; text-align: center; font-size: 11px; color: #999;">
                Apoquindo 3990, Of. 605, Las Condes, Santiago.<br>
                Este es un correo automático, por favor no respondas a esta dirección.
              </div>
            </div>
          `
        }
      });

      setLastBookingValues(values);
      toast({ title: "Reserva Confirmada", description: "Se ha enviado un correo con las instrucciones." });
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
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="text-center py-12 px-6 shadow-lg border-primary/20">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-4">¡Reserva Confirmada!</CardTitle>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Hemos enviado un correo electrónico a <strong>{lastBookingValues?.email}</strong> con los detalles y las instrucciones de preparación.
            </p>
            <div className="bg-muted/30 border border-primary/10 rounded-2xl p-6 text-left mb-8 max-w-xl mx-auto">
              <h3 className="flex items-center gap-2 font-bold text-primary mb-3">
                <AlertCircle className="h-5 w-5" /> Recordatorio Fundamental
              </h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {prepInstructions}
              </div>
            </div>
            <div className="flex flex-col gap-4 max-w-sm mx-auto mb-8">
              <Button onClick={downloadPDF} variant="outline" size="lg" className="rounded-full flex items-center gap-2 bg-primary/5 hover:bg-primary hover:text-white transition-all">
                <Download className="h-5 w-5" /> Descargar Comprobante PDF
              </Button>
              <Link href="/"><Button size="lg" className="rounded-full w-full">Volver al inicio</Button></Link>
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
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
            <ChevronLeft className="mr-1 h-4 w-4" /> Inicio
          </Link>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Paso {step} de 3</div>
        </div>
        <div className="mb-8"><Progress value={(step / 3) * 100} className="h-2" /></div>

        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl text-primary font-bold">
              {step === 1 && "Modalidad y Examen"}
              {step === 2 && "Fecha y Hora"}
              {step === 3 && "Datos del Paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {step === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FormField
                      control={form.control}
                      name="modality"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-bold">¿Cómo deseas realizar el examen?</FormLabel>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={cn("flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer", field.value === "presential" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50")}>
                              <RadioGroupItem value="presential" id="mod-presential" />
                              <label htmlFor="mod-presential" className="flex-1 cursor-pointer">
                                <Building2 className="h-6 w-6 text-primary mb-2" />
                                <div className="font-bold text-primary">Presencial</div>
                                <div className="text-xs text-muted-foreground">En consulta de Las Condes.</div>
                              </label>
                            </div>
                            <div className={cn("flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer", field.value === "home_kit" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50")}>
                              <RadioGroupItem value="home_kit" id="mod-home" />
                              <label htmlFor="mod-home" className="flex-1 cursor-pointer">
                                <Home className="h-6 w-6 text-primary mb-2" />
                                <div className="font-bold text-primary">A Domicilio</div>
                                <div className="text-xs text-muted-foreground">Retiro de kit para casa.</div>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-bold">Tipo de Test</FormLabel>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-4">
                            {[
                              { id: "Lactulosa", label: "Test Lactulosa", sub: "SIBO / IMO", d: "Principal test para sobrecrecimiento bacteriano." },
                              { id: "Fructosa", label: "Test Fructosa", sub: "Malabsorción", d: "Dificultades con azúcares de frutas." },
                              { id: "Lactosa", label: "Test Lactosa", sub: "Intolerancia", d: "Confirma intolerancia a lácteos." }
                            ].map((opt) => (
                              <div key={opt.id} className={cn("flex items-center space-x-4 p-5 rounded-xl border-2 transition-all cursor-pointer", field.value === opt.id ? "border-primary bg-primary/5" : "border-muted")}>
                                <RadioGroupItem value={opt.id} id={`exam-${opt.id}`} />
                                <label htmlFor={`exam-${opt.id}`} className="flex-1 cursor-pointer">
                                  <div className="flex justify-between mb-1">
                                    <div className="font-black text-primary text-lg">{opt.label}</div>
                                    <Badge className="bg-secondary/10 text-secondary text-[10px]">{opt.sub}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">{opt.d}</div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormItem>
                      )}
                    />
                    <Button type="button" onClick={nextStep} className="w-full h-14 text-lg font-bold rounded-xl">Siguiente paso <ChevronRight className="ml-2 h-5 w-5" /></Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                       <AlertCircle className="h-5 w-5 text-amber-600" />
                       <p className="text-xs font-bold text-amber-800">Agendas disponibles desde el 1 de Agosto de 2026.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-lg font-bold">Día de la cita</FormLabel>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal h-12 text-lg border-2", !field.value && "text-muted-foreground")}>
                                    {isMounted && field.value ? <span className="capitalize">{format(field.value, "EEEE d 'de' MMMM", { locale: es })}</span> : <span>Selecciona fecha</span>}
                                    <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setIsCalendarOpen(false); }} disabled={(date) => isBefore(date, OPERATIONS_START_DATE) || isWeekend(date)} initialFocus locale={es} />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-bold flex items-center gap-2">Hora {isLoadingSlots && <Loader2 className="h-4 w-4 animate-spin" />}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDate || isLoadingSlots}>
                              <FormControl><SelectTrigger className="h-12 text-lg border-2"><SelectValue placeholder="Selecciona hora" /></SelectTrigger></FormControl>
                              <SelectContent className="max-h-60">
                                {timeSlots.map(time => {
                                  const isOccupied = occupiedSlots.includes(time);
                                  return <SelectItem key={time} value={time} disabled={isOccupied} className={cn("text-lg", isOccupied && "opacity-50 line-through")}>{time} hrs {isOccupied && "(Ocupado)"}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14">Atrás</Button>
                      <Button type="button" onClick={nextStep} className="flex-2 w-full h-14 font-bold" disabled={!selectedDate || !form.watch("scheduledTime")}>Continuar <ChevronRight className="ml-2 h-5 w-5" /></Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <h3 className="text-lg font-black text-primary border-b pb-2 flex items-center gap-2"><User className="h-5 w-5 text-secondary" /> Identificación</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastNameFather" render={({ field }) => (<FormItem><FormLabel>Apellido Pat.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastNameMother" render={({ field }) => (<FormItem><FormLabel>Apellido Mat.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="sex" render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Sexo</FormLabel>
                            <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                              <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel>Masculino</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel>Femenino</FormLabel></FormItem>
                            </RadioGroup></FormControl>
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-3 gap-2">
                           <FormField control={form.control} name="birthDay" render={({field}) => (<FormItem><FormLabel>Día</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></FormItem>)}/>
                           <FormField control={form.control} name="birthMonth" render={({field}) => (<FormItem><FormLabel>Mes</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{months.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}</SelectContent></Select></FormItem>)}/>
                           <FormField control={form.control} name="birthYear" render={({field}) => (<FormItem><FormLabel>Año</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></FormItem>)}/>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-black text-primary border-b pb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-secondary" /> Contacto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Celular</FormLabel><FormControl><div className="relative"><span className="absolute left-3 top-2.5 text-muted-foreground">+56 9</span><Input className="pl-16" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>Región</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                        <FormField control={form.control} name="commune" render={({ field }) => (<FormItem><FormLabel>Comuna</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{availableCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-black text-primary border-b pb-2 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-secondary" /> Antecedentes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="diagnosis" render={({ field }) => (<FormItem><FormLabel>Diagnóstico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="doctor" render={({ field }) => (<FormItem><FormLabel>Médico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="weight" render={({ field }) => (<FormItem className="max-w-[150px]"><FormLabel>Peso (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14" disabled={isSubmitting}>Atrás</Button>
                      <Button type="submit" className="flex-2 w-full h-14 font-bold bg-primary" disabled={isSubmitting}>{isSubmitting ? "Cargando..." : "Confirmar Reserva"}</Button>
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
