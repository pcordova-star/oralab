
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useFirestore } from "@/firebase";
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
  ArrowLeft
} from "lucide-react";
import { PROTOCOLS } from "@/app/lib/types";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

interface TestState {
  bookingId: string;
  patientName: string;
  examType: string;
  currentStepIndex: number;
  startTime: number | null;
  stepStartTime: number | null;
  isPaused: boolean;
  isCompleted: boolean;
}

export default function HomeTestPage() {
  const [searchName, setSearchName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [testState, setTestState] = useState<TestState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const db = useFirestore();

  useEffect(() => {
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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (testState && !testState.isPaused && !testState.isCompleted) {
      const currentProtocol = PROTOCOLS[testState.examType];
      if (!currentProtocol) return;
      
      const currentStep = currentProtocol.steps[testState.currentStepIndex];
      
      if (currentStep?.type === 'wait' || currentStep?.type === 'ingest') {
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
            }
          }, 1000);
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
      isCompleted: false
    };
    setTestState(newState);
  };

  const confirmStep = async () => {
    if (!testState || !db) return;
    
    const currentProtocol = PROTOCOLS[testState.examType];
    const isLastStep = testState.currentStepIndex === currentProtocol.steps.length - 1;

    const currentStep = currentProtocol.steps[testState.currentStepIndex];
    if (currentStep.type === 'breath') {
      try {
        await updateDoc(doc(db, "bookings", testState.bookingId), {
          testLogs: arrayUnion({
            stepName: currentStep.name,
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.error("Error logging step:", e);
      }
    }

    if (isLastStep) {
      setTestState({ ...testState, isCompleted: true });
      localStorage.removeItem("oralab_test_session");
      toast({ title: "¡Test Finalizado!", description: "Has completado todas las muestras correctamente." });
    } else {
      setTestState({
        ...testState,
        currentStepIndex: testState.currentStepIndex + 1,
        stepStartTime: Date.now()
      });
    }
  };

  const restartProtocol = () => {
    if (confirm("¿Seguro que deseas reiniciar el protocolo desde el primer paso? Los tiempos actuales se perderán.")) {
      setTestState(prev => prev ? {
        ...prev,
        currentStepIndex: 0,
        startTime: Date.now(),
        stepStartTime: Date.now(),
        isCompleted: false
      } : null);
      toast({ title: "Protocolo reiniciado", description: "Volviendo al Paso 1." });
    }
  };

  const cancelTest = () => {
    if (confirm("¿Seguro que deseas cancelar el test y volver a la búsqueda? Se perderá todo el progreso actual.")) {
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

  const getStepImage = (type: string) => {
    const imageId = type === 'breath' ? 'step-breath' : type === 'ingest' ? 'step-ingest' : 'step-wait';
    return PlaceHolderImages.find(img => img.id === imageId);
  };

  // Si no hay test iniciado, mostramos la pantalla de búsqueda con Navbar
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
                        Asegúrate de tener todos tus tubos numerados y el sustrato preparado antes de iniciar. No cierres esta ventana durante el proceso.
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

  // Pantalla de Finalización (Sin Navbar para foco total)
  if (testState.isCompleted) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body items-center justify-center p-4">
        <Card className="rounded-[2.5rem] shadow-2xl border-none text-center p-12 max-w-md w-full">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-black text-primary mb-4 italic">¡Test Finalizado!</CardTitle>
          <p className="text-muted-foreground font-medium mb-8">
            Has completado todas las muestras siguiendo el protocolo. Recuerda entregar tus tubos en el laboratorio en las próximas 24 horas.
          </p>
          <div className="space-y-4">
            <Button onClick={() => window.location.href = '/'} className="w-full h-14 rounded-2xl font-black text-lg shadow-lg">
              Terminar y salir
            </Button>
            <Button variant="outline" onClick={restartProtocol} className="w-full h-12 rounded-2xl font-bold border-primary/20 text-primary">
              <RotateCcw className="mr-2 h-4 w-4" /> ¿Repetir el test?
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Pantalla de Protocolo en curso (Sin Navbar para evitar distracciones)
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      {/* Zen Header: Solo información crítica del test */}
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
        <Badge className="bg-secondary font-black text-[10px] uppercase">{testState.examType}</Badge>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <Badge variant="outline" className="font-black border-primary/20 text-primary uppercase text-[10px] px-3 py-1">
            PASO {testState.currentStepIndex + 1} / {protocol.steps.length}
          </Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={restartProtocol} className="text-primary font-bold hover:bg-primary/5 text-[10px] h-8 px-2">
              <RotateCcw className="h-3 w-3 mr-1" /> Reiniciar
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelTest} className="text-red-500 font-bold hover:bg-red-50 text-[10px] h-8 px-2">
              <XCircle className="h-3 w-3 mr-1" /> Cancelar
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2 rounded-full" />
        </div>

        <Card className="rounded-[2.5rem] shadow-2xl border-primary/5 overflow-hidden bg-white">
          {stepImageData && (
            <div className="relative w-full aspect-[3/2] overflow-hidden group">
              <Image 
                src={stepImageData.imageUrl} 
                alt={stepImageData.description}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                data-ai-hint={stepImageData.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
            </div>
          )}
          
          <div className="p-8 text-center space-y-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto -mt-16 relative z-10 shadow-xl transition-all duration-500",
              currentStep.type === 'breath' ? "bg-blue-100 text-blue-600 animate-pulse" :
              currentStep.type === 'ingest' ? "bg-amber-100 text-amber-600" : "bg-primary text-white"
            )}>
              {currentStep.type === 'breath' && <Wind className="h-8 w-8" />}
              {currentStep.type === 'ingest' && <Droplets className="h-8 w-8" />}
              {currentStep.type === 'wait' && <Timer className="h-8 w-8" />}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-primary italic leading-tight">{currentStep.name}</h2>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed px-2">{currentStep.description}</p>
            </div>

            {(currentStep.type === 'wait' || currentStep.type === 'ingest') && (
              <div className="py-4">
                <div className="text-6xl font-black text-primary font-mono tracking-tighter tabular-nums drop-shadow-sm">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 opacity-60">Tiempo restante</p>
              </div>
            )}

            <div className="pt-4">
              {currentStep.type === 'breath' ? (
                <Button 
                  onClick={confirmStep} 
                  className="w-full h-16 rounded-2xl text-lg font-black bg-secondary hover:bg-secondary/90 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirmar soplido <CheckCircle2 className="h-5 w-5" />
                </Button>
              ) : timeLeft === 0 ? (
                <Button 
                  onClick={confirmStep} 
                  className="w-full h-16 rounded-2xl text-lg font-black bg-primary shadow-xl animate-in zoom-in duration-300"
                >
                  Paso completado <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <div className="bg-muted/50 p-6 rounded-2xl border-dashed border-2 border-muted">
                  <p className="text-xs font-bold text-muted-foreground italic flex items-center justify-center gap-2">
                    <Clock className="h-3 w-3" /> Esperando el tiempo de protocolo...
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <CardFooter className="bg-muted/30 border-t p-4 flex justify-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Tecnología Sunvou® Chile
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <p className="text-[11px] text-primary/70 font-bold italic leading-relaxed">
            * Mantén esta ventana abierta. Si cierras el navegador, el cronómetro podría desincronizarse.
          </p>
        </div>
      </main>
    </div>
  );
}
