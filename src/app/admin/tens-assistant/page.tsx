
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Play, 
  CheckCircle2, 
  Clock, 
  Timer, 
  Bell, 
  Volume2, 
  Activity, 
  Wind, 
  Droplets, 
  Sparkles, 
  History,
  AlertCircle,
  Pause,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { PROTOCOLS } from "@/app/lib/types";
import { format, differenceInSeconds } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ALARM_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

export default function TensAssistantPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [now, setNow] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Actualizar el "ahora" cada segundo para los cronómetros
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    audioRef.current = new Audio(ALARM_URL);
    return () => clearInterval(timer);
  }, []);

  // Consultar pacientes de HOY en modalidad presencial
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "bookings"),
      where("scheduledDate", "==", todayStr),
      where("modality", "==", "presential")
    );
  }, [db, todayStr]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  const activeBookings = useMemo(() => {
    return (bookings || []).filter(b => b.status === "arrived" || b.status === "in_progress");
  }, [bookings]);

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleStartTest = async (bookingId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "in_progress",
        testStartTime: serverTimestamp(),
        testLogs: arrayUnion({
          stepName: "Inicio de Protocolo",
          timestamp: new Date().toISOString()
        })
      });
      toast({ title: "Test Iniciado", description: "El protocolo ha comenzado para este paciente." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo iniciar el test." });
    }
  };

  const handleConfirmStep = async (booking: any) => {
    if (!db) return;
    const protocol = PROTOCOLS[booking.examType];
    if (!protocol) return;

    // El índice actual es la cantidad de pasos completados (logs)
    // Pero el primer log es "Inicio de Protocolo", así que el primer paso real es logs.length - 1
    const currentStepIndex = (booking.testLogs?.length || 0) - 1;
    const nextStep = protocol.steps[currentStepIndex + 1];

    if (!nextStep) {
      // Si no hay más pasos, finalizar
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "completed",
        testLogs: arrayUnion({
          stepName: "Protocolo Finalizado",
          timestamp: new Date().toISOString()
        })
      });
      toast({ title: "Test Completado", description: "El paciente ha terminado todas sus muestras." });
      return;
    }

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        testLogs: arrayUnion({
          stepName: nextStep.name,
          timestamp: new Date().toISOString()
        })
      });
      toast({ title: "Paso Confirmado", description: `${nextStep.name} registrado.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo registrar la muestra." });
    }
  };

  if (isUserLoading || isLoading) return null;
  if (user?.email !== "admin@oralab.cl") {
    return <div className="p-20 text-center">Acceso restringido al personal TENS.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link href="/reception" className="inline-flex items-center text-primary hover:underline mb-2 text-sm font-bold">
              <ArrowLeft className="mr-1 h-3 w-3" /> Volver a Recepción
            </Link>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3 italic">
              <Users className="h-8 w-8 text-secondary" /> Asistente de Sala TENS
            </h1>
            <p className="text-muted-foreground font-medium">Control multi-paciente de tests de aire espirado.</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border shadow-sm flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Hora Actual</p>
                <p className="text-xl font-black text-primary">{format(now, "HH:mm:ss")}</p>
             </div>
             <Button variant="outline" size="icon" onClick={playAlarm} className="rounded-full h-10 w-10 border-secondary text-secondary">
                <Volume2 className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {activeBookings.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/20 bg-white/50 rounded-[3rem] p-20 text-center">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-black text-primary italic mb-2">No hay pacientes activos</h2>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Cuando un paciente sea marcado como "En Sala" desde recepción, aparecerá aquí para iniciar su protocolo.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeBookings.map((booking) => (
              <PatientTestCard 
                key={booking.id} 
                booking={booking} 
                now={now} 
                onStart={() => handleStartTest(booking.id)}
                onConfirm={() => handleConfirmStep(booking)}
                onAlarm={playAlarm}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PatientTestCard({ booking, now, onStart, onConfirm, onAlarm }: { booking: any, now: number, onStart: () => void, onConfirm: () => void, onAlarm: () => void }) {
  const protocol = PROTOCOLS[booking.examType];
  const logs = booking.testLogs || [];
  
  // El primer log es "Inicio de Protocolo". El primer paso real es el índice 0.
  const currentStepIndex = logs.length - 1;
  const isStarted = booking.status === "in_progress";
  
  const currentStep = protocol?.steps[currentStepIndex];
  const nextStep = protocol?.steps[currentStepIndex + 1];
  
  // Calcular tiempo restante para el paso actual si es de espera
  const [timeLeft, setTimeLeft] = useState(0);
  const [isDue, setIsStartedDue] = useState(false);

  useEffect(() => {
    if (isStarted && currentStep && (currentStep.type === 'wait' || currentStep.type === 'ingest' || currentStep.type === 'mouthwash')) {
      const lastLogTime = new Date(logs[logs.length - 1].timestamp).getTime();
      const durationSeconds = currentStep.durationMinutes * 60;
      const elapsedSeconds = Math.floor((now - lastLogTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsedSeconds);
      setTimeLeft(remaining);
      
      if (remaining === 0 && !isDue) {
        setIsStartedDue(true);
        onAlarm();
      }
    } else {
      setTimeLeft(0);
      setIsStartedDue(false);
    }
  }, [now, isStarted, currentStep, logs, onAlarm]);

  const progress = protocol ? (currentStepIndex / protocol.steps.length) * 100 : 0;

  return (
    <Card className={cn(
      "rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500",
      isDue ? "border-red-500 ring-4 ring-red-500/20" : "border-primary/10"
    )}>
      <CardHeader className={cn(
        "p-6 text-white relative",
        isDue ? "bg-red-500" : "bg-primary"
      )}>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2 font-black">
              {booking.examType}
            </Badge>
            <CardTitle className="text-xl font-black italic">{booking.firstName} {booking.lastNameFather}</CardTitle>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              Llegada: {booking.scheduledTime} hrs
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            {isStarted ? <Timer className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!isStarted ? (
          <div className="text-center py-8 space-y-4">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Play className="h-8 w-8 text-secondary fill-secondary ml-1" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Paciente listo en sala. Preparar sustrato e iniciar cronómetro.</p>
            <Button onClick={onStart} className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 font-black">
              Iniciar Protocolo
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
                <span>Paso {currentStepIndex + 1} de {protocol.steps.length}</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-muted/30 rounded-[1.5rem] p-4 border border-primary/5">
              <div className="flex items-center gap-4 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  currentStep?.type === 'breath' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                )}>
                  {currentStep?.type === 'breath' ? <Wind className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Acción Actual</p>
                   <p className="text-sm font-black text-primary italic">{currentStep?.name}</p>
                </div>
              </div>

              {timeLeft > 0 ? (
                <div className="text-center py-2">
                   <p className="text-4xl font-black text-primary font-mono tabular-nums">
                     {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                   </p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Esperando siguiente muestra</p>
                </div>
              ) : isDue ? (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                   <AlertCircle className="h-5 w-5 text-red-500" />
                   <p className="text-xs font-black text-red-700 uppercase">¡TIEMPO CUMPLIDO! REALIZAR ACCIÓN AHORA</p>
                </div>
              ) : currentStep?.type === 'breath' && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center gap-3">
                   <Wind className="h-5 w-5 text-blue-500" />
                   <p className="text-xs font-black text-blue-700 uppercase">Solicitar soplido al paciente</p>
                </div>
              )}
            </div>

            <Button 
              onClick={onConfirm}
              disabled={timeLeft > 0 && !isDue}
              className={cn(
                "w-full h-16 rounded-2xl font-black text-lg shadow-lg transition-all",
                isDue ? "bg-red-500 hover:bg-red-600 animate-bounce" : "bg-primary"
              )}
            >
              {nextStep ? "Confirmar y Continuar" : "Finalizar Test"}
              <CheckCircle2 className="ml-2 h-6 w-6" />
            </Button>
          </>
        )}

        <div className="pt-4 border-t border-dashed">
          <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 flex items-center gap-2">
            <History className="h-3 w-3" /> Bitácora Reciente
          </h4>
          <ScrollArea className="h-24">
            <div className="space-y-2">
              {logs.slice(-3).reverse().map((log: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-primary/5 pb-1">
                  <span className="font-bold text-primary/70">{log.stepName}</span>
                  <span className="font-black text-secondary">{format(new Date(log.timestamp), "HH:mm")} hrs</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
