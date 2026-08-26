"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore } from "@/firebase";
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { 
  Timer, 
  CheckCircle2, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  ChevronRight, 
  Play, 
  RotateCcw,
  Clock,
  UserCheck,
  Search,
  CheckCircle,
  Activity,
  XCircle,
  ArrowLeft,
  ListChecks,
  History,
  PencilLine,
  Bell,
  Volume2,
  Sparkles
} from "lucide-react";
import { PROTOCOLS } from "@/app/lib/types";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { format } from "date-fns";

// URL de un sonido de campana melódica suave
const ALARM_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

interface LogEntry {
  stepName: string;
  timestamp: string;
}

interface TestState {
  bookingId: string;
  patientName: string;
  examType: string;
  currentStepIndex: number;
  startTime: number | null;
  stepStartTime: number | null;
  isPaused: boolean;
  isCompleted: boolean;
  logs: LogEntry[];
}

export default function HomeTestPage() {
  const [searchName, setSearchName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [testState, setTestState] = useState<TestState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const alarmPlayedRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const db = useFirestore();

  useEffect(() => {
    // Inicializar el objeto de audio con loop activado por defecto para las alertas
    audioRef.current = new Audio(ALARM_URL);
    audioRef.current.loop = true;
    
    const savedState = localStorage.getItem("oralab_test_session");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setTestState(parsed);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    if (testState) {
      localStorage.setItem("oralab_test_session", JSON.stringify(testState));
    }
  }, [testState]);

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const playAlarm = (isTest = false) => {
    if (!audioRef.current) return;

    // Si es una prueba, no queremos que suene en bucle para siempre
    audioRef.current.loop = !isTest;
    audioRef.current.currentTime = 0;
    
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (isTest) {
            toast({
              title: "¡Sonido Activado!",
              description: "La alarma funciona correctamente. Sonará en bucle cuando llegue el momento de tu próximo paso.",
            });
            // Si es prueba, detenerla después de 3 segundos para no molestar
            setTimeout(() => {
              if (isTest) stopAlarm();
            }, 3000);
          }
        })
        .catch(error => {
          console.error("Audio playback error:", error);
          if (isTest) {
            toast({
              variant: "destructive",
              title: "Permiso de audio requerido",
              description: "Tu navegador bloqueó el sonido. Por favor, intenta de nuevo o revisa los permisos de tu sitio.",
            });
          }
        });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (testState && !testState.isPaused && !testState.isCompleted) {
      const currentProtocol = PROTOCOLS[testState.examType];
      if (!currentProtocol) return;
      
      const currentStep = currentProtocol.steps[testState.currentStepIndex];
      
      if (currentStep?.type === 'wait' || currentStep?.type === 'ingest' || currentStep?.type === 'mouthwash') {
        const duration = currentStep.durationMinutes * 60;
        const elapsedSinceStepStart = Math.floor((Date.now() - (testState.stepStartTime || Date.now())) / 1000);
        const remaining = Math.max(0, duration - elapsedSinceStepStart);
        
        setTimeLeft(remaining);

        if (remaining > 0) {
          interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - (testState.stepStartTime || now)) / 1000);
            const nextRemaining = Math.max(0, duration - elapsed);
            setTimeLeft(nextRemaining);
            
            if (nextRemaining <= 0) {
              clearInterval(interval);
              if (alarmPlayedRef.current !== testState.currentStepIndex) {
                playAlarm();
                alarmPlayedRef.current = testState.currentStepIndex;
              }
            }
          }, 1000);
        } else {
          if (alarmPlayedRef.current !== testState.currentStepIndex) {
            playAlarm();
            alarmPlayedRef.current = testState.currentStepIndex;
          }
        }
      } else {
        setTimeLeft(0);
      }
    }

    return () => clearInterval(interval);
  }, [testState]);

  const handleLookup = async () => {
    if (!db || !searchName.trim()) return;
    setIsSearching(true);
    try {
      const q = query(collection(db, "bookings"), where("status", "in", ["pending", "arrived", "rescheduled"]));
      const snapshot = await getDocs(q);
      const match = snapshot.docs.find(doc => {
        const data = doc.data();
        const fullName = `${data.firstName || ''} ${data.lastNameFather || ''} ${data.lastNameMother || ''}`.toLowerCase();
        return fullName.includes(searchName.toLowerCase().trim());
      });

      if (match) {
        const data = match.data();
        setBooking({ id: match.id, ...data });
        toast({ title: "Reserva encontrada", description: `Hola ${data.firstName}, iniciemos tu protocolo.` });
      } else {
        toast({ variant: "destructive", title: "No encontrado", description: "No hay reservas activas con ese nombre." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Fallo al conectar con el servidor." });
    } finally {
      setIsSearching(false);
    }
  };

  const startTest = () => {
    if (!booking) return;
    
    const newState: TestState = {
      bookingId: booking.id,
      patientName: `${booking.firstName} ${booking.lastNameFather}`,
      examType: booking.examType,
      currentStepIndex: 0,
      startTime: Date.now(),
      stepStartTime: Date.now(),
      isPaused: false,
      isCompleted: false,
      logs: []
    };
    setTestState(newState);
  };

  const confirmStep = async () => {
    if (!testState || !db) return;
    
    // DETENER ALARMA AL AVANZAR
    stopAlarm();
    
    const currentProtocol = PROTOCOLS[testState.examType];
    const isLastStep = testState.currentStepIndex === currentProtocol.steps.length - 1;
    const currentStep = currentProtocol.steps[testState.currentStepIndex];
    const nowISO = new Date().toISOString();

    const newLog: LogEntry = {
      stepName: currentStep.name,
      timestamp: nowISO
    };

    const updatedLogs = [...(testState.logs || []), newLog];

    if (currentStep.type === 'breath') {
      try {
        await updateDoc(doc(db, "bookings", testState.bookingId), {
          testLogs: arrayUnion({
            stepName: currentStep.name,
            timestamp: nowISO
          })
        });
      } catch (e) {
        console.error("Error logging step:", e);
      }
    }

    if (isLastStep) {
      setTestState({ ...testState, logs: updatedLogs, isCompleted: true });
      localStorage.removeItem("oralab_test_session");
      toast({ title: "¡Test Finalizado!", description: "Has completado todas las muestras correctamente." });
    } else {
      setTestState({
        ...testState,
        logs: updatedLogs,
        currentStepIndex: testState.currentStepIndex + 1,
        stepStartTime: Date.now()
      });
    }
  };

  const restartProtocol = () => {
    if (confirm("⚠️ ¿ESTÁS SEGURO QUE DESEAS REINICIAR EL PROTOCOLO?")) {
      stopAlarm();
      alarmPlayedRef.current = null;
      setTestState(prev => prev ? {
        ...prev,
        currentStepIndex: 0,
        startTime: Date.now(),
        stepStartTime: Date.now(),
        isCompleted: false,
        logs: []
      } : null);
      toast({ title: "Protocolo reiniciado" });
    }
  };

  const cancelTest = () => {
    if (confirm("⚠️ ¿DESEAS CANCELAR EL TEST COMPLETAMENTE?")) {
      stopAlarm();
      setTestState(null);
      setBooking(null);
      localStorage.removeItem("oralab_test_session");
      toast({ title: "Sesión cancelada" });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getClockTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm");
  };

  const getNextActionTime = () => {
    if (!testState) return "";
    const protocol = PROTOCOLS[testState.examType];
    const step = protocol.steps[testState.currentStepIndex];
    if (step.type === 'wait' || step.type === 'ingest' || step.type === 'mouthwash') {
      const scheduledTime = (testState.stepStartTime || Date.now()) + (step.durationMinutes * 60 * 1000);
      return format(new Date(scheduledTime), "HH:mm");
    }
    return "Ahora";
  };

  const getStepImage = (type: string) => {
    const imageId = type === 'breath' ? 'step-breath' : type === 'ingest' ? 'step-ingest' : type === 'mouthwash' ? 'step-mouthwash' : 'step-wait';
    return PlaceHolderImages.find(img => img.id === imageId) || PlaceHolderImages[0];
  };

  if (!testState) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30 font-body">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-md">
          <Card className="rounded-[2.5rem] shadow-2xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary text-white text-center py-8">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-black italic">Mi Asistente Oralab</CardTitle>
              <CardDescription className="text-white/70 font-bold">Guía interactiva para tu test en casa.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {!booking ? (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Ingresa tu nombre para comenzar tu sesión de test.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="Nombre del paciente..." 
                      className="pl-10 h-12 rounded-xl"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleLookup} 
                    disabled={isSearching || !searchName}
                    className="w-full h-12 rounded-xl font-black bg-primary"
                  >
                    {isSearching ? "Buscando..." : "Continuar"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 text-center">
                    <UserCheck className="h-10 w-10 text-secondary mx-auto mb-2" />
                    <h3 className="font-black text-primary text-xl">{booking.firstName} {booking.lastNameFather}</h3>
                    <Badge className="bg-primary font-bold mt-2">Test: {booking.examType}</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-medium">
                        Asegúrate de tener todos tus tubos numerados y el sustrato preparado antes de iniciar. Activa el sonido de tu teléfono para escuchar la alarma.
                      </p>
                    </div>
                    <Button onClick={startTest} className="w-full h-14 rounded-xl text-lg font-black bg-secondary shadow-lg">
                      Iniciar Protocolo <Play className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="ghost" onClick={() => setBooking(null)} className="w-full text-muted-foreground font-bold">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Volver a buscar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const protocol = PROTOCOLS[testState.examType];
  const currentStep = protocol.steps[testState.currentStepIndex];
  const progress = (testState.currentStepIndex / protocol.steps.length) * 100;
  const stepImageData = getStepImage(currentStep.type);

  if (testState.isCompleted) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center p-4">
        <Card className="rounded-[2.5rem] shadow-2xl border-none text-center p-8 max-w-md w-full">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-black text-primary mb-4 italic">¡Test Finalizado!</CardTitle>
          <p className="text-sm text-muted-foreground font-medium mb-6">
            Has completado todas las muestras. Entrega tus tubos en el laboratorio en las próximas 24 horas.
          </p>
          <div className="bg-muted/30 rounded-2xl p-4 mb-8 text-left">
            <h4 className="text-xs font-black text-primary uppercase mb-3 flex items-center gap-2">
              <History className="h-3 w-3" /> Resumen de Tiempos
            </h4>
            <div className="space-y-2">
              {testState.logs?.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/50 pb-1">
                  <span className="font-bold text-muted-foreground">{log.stepName}</span>
                  <span className="font-black text-primary">{format(new Date(log.timestamp), "HH:mm")} hrs</span>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => window.location.href = '/'} className="w-full h-14 rounded-2xl font-black text-lg shadow-lg">
            Terminar y salir
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="p-4 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
             <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Paciente</p>
            <p className="text-sm font-black text-primary truncate max-w-[150px]">{testState.patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
             <p className="text-[10px] font-black text-muted-foreground uppercase leading-none">Inicio</p>
             <p className="text-sm font-black text-primary">{getClockTime(testState.startTime || 0)}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => playAlarm(true)}
            className="h-9 px-3 rounded-full bg-secondary/10 hover:bg-secondary/20 border-secondary/20 text-secondary flex items-center gap-2"
          >
             <Volume2 className="h-4 w-4 animate-pulse-subtle" />
             <span className="text-[10px] font-black uppercase hidden sm:inline">Probar Alarma</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md flex-grow space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-black border-primary/20 text-primary uppercase text-[10px] px-3 py-1">
            PASO {testState.currentStepIndex + 1} / {protocol.steps.length}
          </Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={restartProtocol} className="text-primary font-black text-[10px] h-9 px-3 border border-primary/10 rounded-full">
              <RotateCcw className="h-3 w-3 mr-1" /> Reiniciar
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelTest} className="text-red-500 font-black text-[10px] h-9 px-3 border border-red-100 rounded-full">
              <XCircle className="h-3 w-3 mr-1" /> Cancelar
            </Button>
          </div>
        </div>

        <Progress value={progress} className="h-2 rounded-full mb-4" />

        <Card className="rounded-[2.5rem] shadow-2xl border-primary/5 bg-white relative mt-10">
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-t-[2.5rem]">
            <Image 
              src={stepImageData.imageUrl} 
              alt={stepImageData.description}
              fill
              className="object-cover"
              data-ai-hint={stepImageData.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
          </div>
          
          <div className="p-10 text-center space-y-8">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto -mt-20 relative z-10 shadow-2xl transition-all duration-500",
              currentStep.type === 'breath' ? "bg-blue-100 text-blue-600 animate-pulse" :
              currentStep.type === 'ingest' ? "bg-amber-100 text-amber-600" : 
              currentStep.type === 'mouthwash' ? "bg-emerald-100 text-emerald-600" :
              "bg-primary text-white"
            )}>
              {currentStep.type === 'breath' && <Wind className="h-10 w-10" />}
              {currentStep.type === 'ingest' && <Droplets className="h-10 w-10" />}
              {currentStep.type === 'mouthwash' && <Sparkles className="h-10 w-10" />}
              {currentStep.type === 'wait' && <Timer className="h-10 w-10" />}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-primary italic leading-tight">{currentStep.name}</h2>
              <p className="text-muted-foreground font-medium text-base leading-relaxed px-4">{currentStep.description}</p>
            </div>

            {(currentStep.type === 'wait' || currentStep.type === 'ingest' || currentStep.type === 'mouthwash') && (
              <div className="py-6 space-y-4">
                <div className="relative inline-block">
                  <div className="text-7xl font-black text-primary font-mono tracking-tighter tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                  {timeLeft > 0 && (
                    <div className="absolute -top-4 -right-4 bg-secondary text-white p-1.5 rounded-full shadow-lg animate-bounce">
                      <Bell className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 inline-block">
                   <p className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Próxima acción a las:</p>
                   <p className="text-2xl font-black text-primary">{getNextActionTime()} hrs</p>
                </div>
              </div>
            )}

            <div className="pt-6">
              {currentStep.type === 'breath' ? (
                <div className="space-y-4">
                  <Button onClick={confirmStep} className="w-full h-20 rounded-2xl text-xl font-black bg-secondary hover:bg-secondary/90 shadow-xl flex items-center justify-center gap-2">
                    Confirmar soplido <CheckCircle2 className="h-6 w-6" />
                  </Button>
                  <p className="text-[11px] font-bold text-amber-600 flex items-center justify-center gap-1">
                    <PencilLine className="h-3 w-3" /> Recuerda anotar la hora en tu ficha ficha
                  </p>
                </div>
              ) : timeLeft === 0 ? (
                <div className="space-y-4">
                  <Button onClick={confirmStep} className="w-full h-20 rounded-2xl text-xl font-black bg-primary shadow-xl animate-in zoom-in duration-300">
                    Continuar protocolo <ChevronRight className="ml-2 h-6 w-6" />
                  </Button>
                  <p className="text-xs font-black text-secondary animate-pulse-subtle">🔔 Alarma sonando: tiempo cumplido</p>
                </div>
              ) : (
                <div className="bg-muted/50 p-8 rounded-2xl border-dashed border-2 border-muted">
                  <p className="text-sm font-bold text-muted-foreground italic flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" /> Esperando el tiempo de protocolo...
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <CardFooter className="bg-muted/30 border-t p-6 flex justify-center rounded-b-[2.5rem]">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <Activity className="h-3 w-3 text-secondary" /> Tecnología Sunvou® Chile
            </div>
          </CardFooter>
        </Card>

        {testState.logs && testState.logs.length > 0 && (
          <Card className="rounded-3xl border-primary/10 shadow-lg overflow-hidden bg-white/50">
            <div className="p-4 bg-primary/5 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Bitácora Digital
              </h3>
            </div>
            <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
              {[...testState.logs].reverse().map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-dashed last:border-0 border-primary/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-[11px] font-bold text-primary/80">{log.stepName}</span>
                  </div>
                  <span className="text-xs font-black text-primary">{format(new Date(log.timestamp), "HH:mm")} hrs</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
