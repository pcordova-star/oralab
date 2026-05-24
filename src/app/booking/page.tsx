
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
import { ChevronLeft, ChevronRight, ClipboardList, CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, startOfToday, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const regions = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
  "Valparaíso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Ñuble", 
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

const chileanCommunes = Array.from(new Set([
  "Santiago", "Concepción", "Viña del Mar", "Valparaíso", "Antofagasta", "Temuco", 
  "La Serena", "Rancagua", "Puerto Montt", "Talca", "Arica", "Iquique", 
  "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", 
  "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", 
  "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", 
  "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", 
  "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", 
  "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San Miguel", 
  "San Ramón", "Vitacura", "Colina", "Lampa", "Tiltil", 
  "Pirque", "San José de Maipo", "Buin", "Paine", "Calera de Tango", 
  "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", 
  "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
])).sort();

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

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      examType: "Lactulosa",
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
    if (step === 1) fieldsToValidate = ["examType"];
    if (step === 2) fieldsToValidate = ["scheduledDate", "scheduledTime"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  }

  function prevStep() {
    setStep(step - 1);
  }

  function onSubmit(values: BookingFormValues) {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Inténtalo más tarde.",
      });
      return;
    }

    setIsSubmitting(true);
    const fullPhone = `+56 9 ${values.phone}`;
    const birthDate = `${values.birthYear}-${values.birthMonth}-${values.birthDay.padStart(2, '0')}`;
    
    const bookingData = {
      examType: values.examType,
      scheduledDate: format(values.scheduledDate, "yyyy-MM-dd"),
      scheduledTime: values.scheduledTime,
      firstName: values.firstName,
      lastNameFather: values.lastNameFather,
      lastNameMother: values.lastNameMother,
      email: values.email,
      phone: fullPhone,
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

    const bookingsRef = collection(db, "bookings");
    
    addDocumentNonBlocking(bookingsRef, bookingData)
      .then(() => {
        toast({
          title: "Solicitud enviada correctamente",
          description: "Nos pondremos en contacto contigo a la brevedad para confirmar tu hora.",
        });
        setIsSubmitting(false);
        setStep(4); // Pantalla de éxito
      })
      .catch(() => {
        setIsSubmitting(false);
      });
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
            <CardTitle className="text-3xl font-bold text-primary mb-4">¡Solicitud Enviada!</CardTitle>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Hemos recibido tus datos correctamente. Un especialista de Oralab te contactará por teléfono o email para confirmar la disponibilidad de tu hora.
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full">Volver al inicio</Button>
            </Link>
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
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Paso {step} de 3
          </div>
        </div>

        <div className="mb-8">
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-2xl text-primary font-bold">
              {step === 1 && "Selecciona tu Examen"}
              {step === 2 && "Fecha y Horario"}
              {step === 3 && "Tus Datos Personales"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Elige el test indicado por tu médico especialista."}
              {step === 2 && "Selecciona el día y la hora que más te acomode."}
              {step === 3 && "Completa la ficha para agendar tu procedimiento."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* ETAPA 1: TIPO DE EXAMEN */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FormField
                      control={form.control}
                      name="examType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Tipo de Test de Aire Espirado</FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-4"
                          >
                            {["Lactulosa", "Fructosa", "Lactosa"].map((type) => (
                              <div key={type} className="flex items-center space-x-3 bg-muted/30 p-4 rounded-xl border hover:border-primary transition-colors cursor-pointer">
                                <RadioGroupItem value={type} id={`exam-${type}`} />
                                <label htmlFor={`exam-${type}`} className="flex-1 cursor-pointer">
                                  <div className="font-bold text-primary">Test {type}</div>
                                  <div className="text-xs text-muted-foreground">Procedimiento no invasivo especializado.</div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" onClick={nextStep} className="w-full h-14 text-lg font-bold rounded-xl">
                      Siguiente paso <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* ETAPA 2: FECHA Y HORA */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-lg">Día del Examen (Lunes a Viernes)</FormLabel>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal bg-white h-12 text-lg border-2",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {isMounted && field.value ? (
                                      <span className="capitalize">
                                        {format(field.value, "EEEE d 'de' MMMM", { locale: es })}
                                      </span>
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setIsCalendarOpen(false);
                                  }}
                                  disabled={(date) =>
                                    isBefore(date, startOfToday()) || isWeekend(date)
                                  }
                                  initialFocus
                                  locale={es}
                                />
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
                            <FormLabel className="text-lg">Bloque Horario Disponible</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white h-12 text-lg border-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 opacity-50" />
                                    <SelectValue placeholder="Selecciona hora" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time} className="text-lg">{time} hrs</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-xl">
                        Atrás
                      </Button>
                      <Button type="button" onClick={nextStep} className="flex-2 w-full h-14 text-lg font-bold rounded-xl">
                        Continuar a mis datos <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ETAPA 3: DATOS DEL PACIENTE */}
                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombres</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Juan Pablo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lastNameFather"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido Paterno</FormLabel>
                              <FormControl>
                                <Input placeholder="Pérez" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastNameMother"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido Materno</FormLabel>
                              <FormControl>
                                <Input placeholder="González" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="usuario@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono Celular</FormLabel>
                            <div className="flex gap-2 items-center">
                              <div className="bg-muted px-3 h-10 flex items-center rounded-md text-sm border font-medium">
                                +56 9
                              </div>
                              <FormControl>
                                <Input placeholder="12345678" maxLength={8} {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle, número, depto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        <FormField
                          control={form.control}
                          name="birthDay"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="birthMonth"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="birthYear"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnóstico médico</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Sospecha de SIBO" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Ej: 70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="doctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Médico solicitante</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del médico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Chile">Chile</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Región</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="commune"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comuna</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {chileanCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Sexo asignado al nacer</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              {["not_specified", "male", "female"].map((s) => (
                                <div key={s} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border">
                                  <RadioGroupItem value={s} id={`sex-${s}`} />
                                  <label htmlFor={`sex-${s}`} className="text-sm font-medium cursor-pointer flex-1">
                                    {s === "not_specified" ? "No especifica" : s === "male" ? "Masculino" : "Femenino"}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-14 text-lg rounded-xl" disabled={isSubmitting}>
                        Atrás
                      </Button>
                      <Button type="submit" className="flex-2 w-full h-14 text-lg font-bold rounded-xl shadow-lg" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Confirmar Reserva"}
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
