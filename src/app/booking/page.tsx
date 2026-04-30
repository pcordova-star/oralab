"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const [examType, setExamType] = useState<string>("SIBO");
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Generar bloques de tiempo dinámicos según el tipo de examen
  // Laboratorio cierra a las 17:00
  // SIBO dura 3h (última cita 14:00), HP dura 30min (última cita 16:30)
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

  // Limpiar hora seleccionada si cambia el tipo de examen y la hora ya no es válida
  useEffect(() => {
    if (selectedTime && !timeSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [examType, timeSlots, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsConfirmed(true);
      toast({
        title: "¡Reserva Exitosa!",
        description: `Tu cita para ${examType} ha sido agendada.`,
      });
    }, 1500);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="max-w-md w-full text-center p-8 rounded-3xl">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl mb-4">Cita Agendada</CardTitle>
            <CardDescription className="text-lg mb-8">
              Tu reserva para el examen <strong>{examType}</strong> ha sido confirmada para el día <strong>{date ? format(date, "PPP", { locale: es }) : ""}</strong> a las <strong>{selectedTime}</strong>.
            </CardDescription>
            <div className="space-y-4">
              <Button className="w-full rounded-xl" onClick={() => router.push('/')}>
                Volver al Inicio
              </Button>
              <p className="text-sm text-muted-foreground">
                Por favor revise su email para las instrucciones de ayuno y preparación.
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Reserva tu Examen</h1>
            <p className="text-muted-foreground text-lg">Completa el formulario para agendar tu hora en Oralab.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm overflow-hidden">
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

              <Card className="rounded-2xl shadow-sm overflow-hidden">
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
                    {examType === "SIBO" && (
                      <p className="text-[10px] text-muted-foreground px-1 italic">
                        * Los test de SIBO se agendan hasta las 14:00 por su duración de 3 horas.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-xl">3. Datos del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" placeholder="Ej: Juan Pérez" required className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input id="rut" placeholder="Ej: 12.345.678-9" required className="rounded-xl h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="+56 9..." required className="rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@ejemplo.com" required className="rounded-xl h-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
                disabled={isSubmitting || !date || !selectedTime}
              >
                {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
              </Button>
              <p className="text-center text-sm text-muted-foreground px-8">
                Al confirmar, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
