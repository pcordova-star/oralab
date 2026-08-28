
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, arrayUnion, serverTimestamp, deleteField } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
  Volume2, 
  Activity, 
  Wind, 
  Droplets, 
  Sparkles, 
  History,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  XCircle
} from "lucide-react";
import { PROTOCOLS } from "@/app/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ALARM_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

export default function TensAssistantPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [now, setNow] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    audioRef.current = new Audio(ALARM_URL);
    return () => clearInterval(timer);
  }, []);

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

  const handleStartTest = (bookingId: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), {
      status: "in_progress",
      testStartTime: serverTimestamp(),
      testLogs: arrayUnion({
        stepName: "Inicio de Protocolo",
        timestamp: new Date().toISOString()
      })
    });
    toast({ title: "Test Iniciado", description: "El protocolo ha comenzado." });
  };

  const handleResetTest = (bookingId: string) => {
    if (!db || !confirm("¿Seguro que deseas reiniciar el protocolo de este paciente? Se borrarán los soplidos actuales.")) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), {
      status: "arrived",
      testLogs: [],
      testStartTime: deleteField()
    });
    toast({ title: "Protocolo Reiniciado", description: "El paciente ha vuelto a estado 'En Sala'." });
  };

  const handleCancelTest = (bookingId: string) => {
    if (!db || !confirm("¿Deseas cancelar el test en curso?")) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), {
      status: "arrived",
      testLogs: [],
      testStartTime: deleteField()
    });
    toast({ title: "Test Cancelado", description: "Se ha detenido el cronómetro clínico." });
  };

  const handleConfirmStep = (booking: any) => {
    if (!db) return;
    const protocol = PROTOCOLS[booking.examType];
    if (!protocol) return;

    const currentStepIndex = (booking.testLogs?.length || 0) - 1;
    const currentProtocolStep = protocol.steps[currentStepIndex];

    if (!currentProtocolStep) return;

    const isLastStep = currentStepIndex === protocol.steps.length - 1;
    const updates: any = {
      testLogs: arrayUnion({
        stepName: currentProtocolStep.name,
        timestamp: new Date().toISOString()
      })
    };

    if (isLastStep) {
      updates.status = "completed";
    }

    updateDocumentNonBlocking(doc(db, "bookings", booking.id), updates);
    
    if (isLastStep) {
      toast({ title: "Test Completado", description: "Protocolo terminado." });
    } else {
      toast({ title: "Paso Confirmado", description: `${currentProtocolStep.name} registrado.` });
    }
  };

  if (isUserLoading || isLoading) return null;
  if (user?.email !== "admin@oralab.cl") {
    return <div className="p-20 text-center font-black text-primary italic">Acceso restringido al personal TENS de Oralab.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/reception" className="inline-flex items-center text-primary hover:underline mb-2 text-sm font-bold">
              <ArrowLeft className="mr-1 h-3 w-3" /> Volver a Recepción
            </Link>
            <h1 className="text-4xl font-black text-primary flex items-center gap-3 italic">
              <Users className="h-10 w-10 text-secondary" /> Control Multi-Paciente
            </h1>
            <p className="text-muted-foreground font-medium">Protocolos Sunvou® en tiempo real.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-5 rounded-[2rem] border shadow-xl flex items-center gap-6"
          >
             <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none tracking-widest">Hora de Sala</p>
                <p className="text-2xl font-black text-primary font-mono tabular-nums">{format(now, "HH:mm:ss")}</p>
             </div>
             <Button 
               variant="outline" 
               size="icon" 
               onClick={playAlarm} 
               className="rounded-full h-12 w-12 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all shadow-lg"
             >
                <Volume2 className="h-6 w-6" />
             </Button>
          </motion.div>
        </div>

        {activeBookings.length === 0 ? (
          <Card className="border-dashed border-4 border-muted-foreground/10 bg-white/50 rounded-[4rem] p-32 text-center">
            <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-primary/40 italic mb-2 uppercase tracking-tighter">Sin actividad en sala</h2>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">
              Marca a un paciente como "En Sala" desde el panel de recepción para comenzar su protocolo.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {activeBookings.map((booking) => (
              <PatientTestCard 
                key={booking.id} 
                booking={booking} 
                now={now} 
                onStart={() => handleStartTest(booking.id)}
                onReset={() => handleResetTest(booking.id)}
                onCancel={() => handleCancelTest(booking.id)}
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

function PatientTestCard({ booking, now, onStart, onReset, onCancel, onConfirm, onAlarm }: { booking: any, now: number, onStart: () => void, onReset: () => void, onCancel: () => void, onConfirm: () => void, onAlarm: () => void }) {
  const protocol = PROTOCOLS[booking.examType];
  const logs = booking.testLogs || [];
  const currentStepIndex = logs.length - 1;
  const isStarted = booking.status === "in_progress";
  const currentStep = protocol?.steps[currentStepIndex];
  const nextStep = protocol?.steps[currentStepIndex + 1];
  
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
  }, [now, isStarted, currentStep, logs, onAlarm, isDue]);

  const progress = protocol ? (currentStepIndex / protocol.steps.length) * 100 : 0;
  // Solo bloqueamos el botón si es un paso de ESPERA y el tiempo no ha terminado
  const isButtonDisabled = currentStep?.type === 'wait' && timeLeft > 0 && !isDue;

  return (
    <Card className={cn(
      "rounded-[3rem] shadow-2xl overflow-hidden transition-all duration-700",
      isDue ? "border-red-500 ring-8 ring-red-500/10 scale-[1.02]" : "border-primary/5 hover:border-primary/20"
    )}>
      <CardHeader className={cn(
        "p-8 text-white relative",
        isDue ? "bg-red-500 animate-pulse" : "bg-primary"
      )}>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-3 font-black uppercase text-[10px] tracking-widest px-4 py-1">
              {booking.examType}
            </Badge>
            <CardTitle className="text-2xl font-black italic leading-none truncate">{booking.firstName} {booking.lastNameFather}</CardTitle>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Llegada: {booking.scheduledTime} hrs
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
              {isStarted ? <Timer className="h-8 w-8 animate-pulse" /> : <Activity className="h-8 w-8" />}
            </div>
            {isStarted && (
              <div className="flex gap-2 relative z-20">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={(e) => { e.stopPropagation(); onReset(); }} 
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-primary border-white/20" 
                  title="Reiniciar Protocolo"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={(e) => { e.stopPropagation(); onCancel(); }} 
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-red-600 text-white border-white/20" 
                  title="Cancelar Test"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16" />
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {!isStarted ? (
          <div className="text-center py-10 space-y-6">
            <div className="bg-secondary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner group">
               <Play className="h-10 w-10 text-secondary fill-secondary group-hover:scale-125 transition-transform ml-1" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-primary italic">Paciente Listo</p>
              <p className="text-sm font-medium text-muted-foreground px-6">Prepare el sustrato y verifique los tubos antes de iniciar el cronómetro clínico.</p>
            </div>
            <Button onClick={onStart} className="w-full h-16 rounded-2xl bg-secondary hover:bg-secondary/90 font-black text-lg shadow-xl shadow-secondary/20">
              Iniciar Protocolo
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                <span>Paso {currentStepIndex + 1} de {protocol.steps.length}</span>
                <span className="text-primary font-black">{Math.round(progress)}% COMPLETADO</span>
              </div>
              <Progress value={progress} className="h-3 rounded-full bg-muted border border-primary/5" />
            </div>

            <div className={cn(
              "rounded-[2rem] p-8 border-2 transition-colors duration-500",
              currentStep?.type === 'breath' ? "bg-blue-50 border-blue-100" : 
              currentStep?.type === 'ingest' ? "bg-amber-50 border-amber-100" :
              currentStep?.type === 'mouthwash' ? "bg-emerald-50 border-emerald-100" :
              "bg-muted/30 border-muted"
            )}>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={cn(
                  "p-5 rounded-3xl shadow-lg",
                  currentStep?.type === 'breath' ? "bg-blue-500 text-white animate-bounce" : 
                  currentStep?.type === 'ingest' ? "bg-amber-500 text-white" :
                  currentStep?.type === 'mouthwash' ? "bg-emerald-500 text-white" :
                  "bg-slate-400 text-white"
                )}>
                  {currentStep?.type === 'breath' ? <Wind className="h-10 w-10" /> : 
                   currentStep?.type === 'ingest' ? <Droplets className="h-10 w-10" /> :
                   currentStep?.type === 'mouthwash' ? <Sparkles className="h-10 w-10" /> :
                   <Clock className="h-10 w-10" />}
                </div>
                
                <div className="space-y-1">
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Acción a realizar ahora:</p>
                   <h3 className={cn(
                     "text-2xl font-black italic leading-tight",
                     currentStep?.type === 'breath' ? "text-blue-700" : 
                     currentStep?.type === 'ingest' ? "text-amber-700" :
                     currentStep?.type === 'mouthwash' ? "text-emerald-700" :
                     "text-slate-700"
                   )}>{currentStep?.name}</h3>
                </div>

                {timeLeft > 0 ? (
                  <div className="py-2">
                     <p className="text-6xl font-black text-primary font-mono tracking-tighter tabular-nums">
                       {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                     </p>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">
                        Intervalo de seguridad activo
                     </p>
                  </div>
                ) : isDue ? (
                  <div className="bg-red-500 text-white p-4 rounded-2xl w-full flex items-center justify-center gap-3 animate-pulse shadow-xl">
                     <AlertCircle className="h-6 w-6" />
                     <p className="text-sm font-black uppercase italic">¡Tiempo Cumplido! Realizar ahora</p>
                  </div>
                ) : currentStep?.type === 'breath' && (
                  <div className="bg-blue-500 text-white p-4 rounded-2xl w-full flex items-center justify-center gap-3 animate-pulse shadow-xl">
                     <Wind className="h-6 w-6" />
                     <p className="text-sm font-black uppercase italic">Solicitar soplido clínico</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={onConfirm}
                disabled={isButtonDisabled}
                className={cn(
                  "w-full h-20 rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3",
                  isDue ? "bg-red-500 hover:bg-red-600 animate-bounce" : 
                  currentStep?.type === 'breath' ? "bg-blue-600 hover:bg-blue-700" :
                  "bg-primary"
                )}
              >
                {nextStep ? (
                  <>Confirmar Acción <CheckCircle2 className="h-8 w-8" /></>
                ) : (
                  <>Finalizar Protocolo <CheckCircle2 className="h-8 w-8" /></>
                )}
              </Button>

              {nextStep && (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                   <p className="text-[10px] font-black text-muted-foreground uppercase">Siguiente Paso:</p>
                   <Badge variant="outline" className="bg-white font-bold text-[10px] border-primary/10">
                     {nextStep.name} ({nextStep.durationMinutes > 0 ? `${nextStep.durationMinutes} min` : 'Instante'})
                   </Badge>
                </div>
              )}
            </div>
          </>
        )}

        <div className="pt-6 border-t border-dashed">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
              <History className="h-3 w-3" /> Bitácora del Paciente
            </h4>
            <Badge className="bg-muted text-muted-foreground text-[8px] font-black">{logs.length} Eventos</Badge>
          </div>
          <ScrollArea className="h-28">
            <div className="space-y-2 pr-3">
              {logs.slice().reverse().map((log: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-muted/30 border border-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-secondary" />
                    <span className="text-[10px] font-bold text-primary/70">{log.stepName}</span>
                  </div>
                  <span className="text-[10px] font-black text-secondary">{format(new Date(log.timestamp), "HH:mm:ss")} hrs</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 border-t p-4 flex justify-center">
         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
           <Activity className="h-3 w-3 text-secondary" /> Trazabilidad Clínica Oralab
         </p>
      </CardFooter>
    </Card>
  );
}
