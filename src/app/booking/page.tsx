
"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, CheckCircle2, Clock, Printer, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { StaffRedirect } from "@/components/staff-redirect";
import { PROTOCOLS } from "@/app/lib/types";
import { useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function BookingPage() {
  const [examType, setExamType] = useState<string>("SIBO");
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientData, setPatientData] = useState({ name: "", rut: "", phone: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const timeSlots = useMemo(() => {
    const slots = [];
    const limitHour = examType === "SIBO" ? 14 : 16;
    const limitMin = examType === "SIBO" ? 0 : 30;
    const limitTotal = limitHour * 60 + limitMin;

    for (let hour = 9; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const currentTotal = hour * 60 + min;
        if (currentTotal > limitTotal) break;
        
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  }, [examType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !date) return;

    setIsSubmitting(true);
    
    try {
      const appointmentDate = new Date(date);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Crear cita en Firestore
      await addDocumentNonBlocking(collection(db, "appointments"), {
        patientName: patientData.name,
        patientRut: patientData.rut,
        patientEmail: patientData.email,
        patientPhone: patientData.phone,
        examType: examType,
        dateTime: appointmentDate.toISOString(),
        status: "scheduled",
        createdAt: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsConfirmed(true);
      toast({
        title: "¡Reserva Exitosa!",
        description: `Se ha enviado un correo con el resumen y las instrucciones a ${patientData.email}.`,
      });
    } catch (error) {
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar la reserva. Intente nuevamente.",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isConfirmed) {
    const instructions = PROTOCOLS[examType as keyof typeof PROTOCOLS]?.instructions || "";
    return (
      <div className="min-h-screen flex flex-col bg-background print:bg-white">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center">
          <Card className="max-w-3xl w-full rounded-3xl overflow-hidden shadow-xl border-none print:shadow-none print:border">
            <CardHeader className="bg-primary text-white text-center p-10 print:bg-white print:text-black print:border-b">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-extrabold mb-2">¡Reserva Confirmada!</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg print:text-black">
                Hemos enviado el resumen y las instrucciones a su correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8 border-b pb-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Resumen de la Cita</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Paciente:</span>
                      <span className="font-bold">{patientData.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">RUT:</span>
                      <span className="font-bold">{patientData.rut}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Examen:</span>
                      <span className="font-bold text-primary">{examType}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-bold">{date ? format(date, "PPP", { locale: es }) : ""}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Hora:</span>
                      <span className="font-bold">{selectedTime} hrs</span>
                    </p>
                  </div>
                </div>
                <div className="bg-muted/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                   <Mail className="h-8 w-8 text-primary mb-2 print:hidden" />
                   <p className="text-sm font-medium">Un correo de confirmación ha sido enviado a:</p>
                   <p className="font-bold text-primary break-all">{patientData.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Instrucciones de Preparación</h3>
                <div className="bg-background border rounded-2xl p-6 text-sm whitespace-pre-line leading-relaxed italic">
                  {instructions}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-muted/20 border-t flex flex-col sm:flex-row gap-4 print:hidden">
              <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir / Descargar PDF
              </Button>
              <Button className="flex-1 h-12 rounded-xl" onClick={() => router.push('/')}>
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StaffRedirect />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Reserva tu Examen</h1>
            <p className="text-muted-foreground text-lg">Completa el formulario para agendar tu hora en Oralab.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-xl">1. Tipo de Examen</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup value={examType} onValueChange={setExamType} className="grid grid-cols-1 gap-4">
                    <div>
                      <RadioGroupItem value="SIBO" id="sibo" className="peer sr-only" />
                      <Label
                        htmlFor="sibo"
                        className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                      >
                        <span className="font-bold text-lg">SIBO</span>
                        <span className="text-sm text-muted-foreground">Test de aire espirado (3 horas)</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="HP" id="hp" className="peer sr-only" />
                      <Label
                        htmlFor="hp"
                        className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                      >
                        <span className="font-bold text-lg">Helicobacter Pylori</span>
                        <span className="text-sm text-muted-foreground">Test de Urea C13 (30 minutos)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-xl">2. Fecha y Hora</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col space-y-2">
                    <Label>Selecciona el día</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl h-12",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Selecciona la hora</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger className="rounded-xl h-12">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecciona un horario" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time} hrs
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm overflow-hidden border-none shadow-md">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-xl">3. Datos del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input 
                      id="name" 
                      placeholder="Ej: Juan Pérez" 
                      required 
                      className="rounded-xl h-12"
                      value={patientData.name}
                      onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input 
                      id="rut" 
                      placeholder="Ej: 12.345.678-9" 
                      required 
                      className="rounded-xl h-12"
                      value={patientData.rut}
                      onChange={(e) => setPatientData({...patientData, rut: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input 
                        id="phone" 
                        placeholder="+56 9..." 
                        required 
                        className="rounded-xl h-12"
                        value={patientData.phone}
                        onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="email@ejemplo.com" 
                        required 
                        className="rounded-xl h-12"
                        value={patientData.email}
                        onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
                disabled={isSubmitting || !date || !selectedTime || !patientData.name || !patientData.rut || !patientData.email}
              >
                {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
