
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Play, CheckCircle2, Timer, Loader2 } from "lucide-react";
import { PROTOCOLS } from "@/app/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth-guard";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, orderBy } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

function ActiveExamCard({ session }: { session: any }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const protocol = PROTOCOLS[session.examType as 'SIBO' | 'HP'];
  const currentStep = protocol.steps[session.currentStepIndex];
  const isLastStep = session.currentStepIndex === protocol.steps.length - 1;

  useEffect(() => {
    if (session.nextStepTime) {
      const targetTime = new Date(session.nextStepTime).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
        setTimeLeft(diff);
        setTimerActive(diff > 0);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setTimerActive(false);
    }
  }, [session.nextStepTime]);

  const handleNextStep = () => {
    if (!db) return;
    if (isLastStep) {
      updateDocumentNonBlocking(doc(db, "exam_sessions", session.id), { status: "completed" });
      updateDocumentNonBlocking(doc(db, "appointments", session.appointmentId), { status: "completed" });
      toast({ title: "Examen Finalizado", description: `Protocolo completado para ${session.patientName}` });
      return;
    }
    const nextIndex = session.currentStepIndex + 1;
    const nextStep = protocol.steps[nextIndex];
    let nextStepTime = null;
    if (nextStep.waitMinutes > 0) {
      const time = new Date();
      time.setMinutes(time.getMinutes() + nextStep.waitMinutes);
      nextStepTime = time.toISOString();
    }
    updateDocumentNonBlocking(doc(db, "exam_sessions", session.id), {
      currentStepIndex: nextIndex,
      nextStepTime: nextStepTime,
      timerWasActive: nextStep.waitMinutes > 0
    });
  };

  const handleStartTimer = () => {
    if (!db || currentStep.waitMinutes === 0) return;
    const time = new Date();
    time.setMinutes(time.getMinutes() + currentStep.waitMinutes);
    updateDocumentNonBlocking(doc(db, "exam_sessions", session.id), {
      nextStepTime: time.toISOString(),
      timerWasActive: true
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="rounded-3xl shadow-lg border-2 border-primary/10 overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-primary text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{session.patientName}</CardTitle>
            <CardDescription className="text-primary-foreground/80 font-medium">
              {protocol.name}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-white/20 border-white/40 text-white">
            Paso {session.currentStepIndex + 1}/{protocol.steps.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-grow flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>Progreso</span>
            <span>{Math.round(((session.currentStepIndex + 1) / protocol.steps.length) * 100)}%</span>
          </div>
          <Progress value={((session.currentStepIndex + 1) / protocol.steps.length) * 100} className="h-2 rounded-full" />
        </div>

        <div className="bg-muted/30 p-4 rounded-2xl border">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Acción Actual</h4>
          <p className="text-lg font-extrabold text-foreground leading-tight">{currentStep.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{currentStep.description}</p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-background rounded-2xl border shadow-inner">
          {currentStep.waitMinutes > 0 ? (
            <>
              <Timer className={`h-10 w-10 mb-2 ${timerActive ? 'text-secondary animate-pulse-subtle' : 'text-muted-foreground'}`} />
              <div className={`text-4xl font-mono font-bold ${timeLeft === 0 && session.timerWasActive ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
              {timeLeft === 0 && !timerActive && session.timerWasActive && (
                <Badge variant="destructive" className="mt-2 text-[10px] rounded-full">¡Tiempo cumplido!</Badge>
              )}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-10 w-10 mb-2 text-green-500" />
              <p className="text-sm font-bold text-foreground">Acción Manual</p>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-muted/20 border-t flex flex-col gap-2">
        {currentStep.waitMinutes > 0 && !timerActive && timeLeft === 0 && !session.timerWasActive && (
          <Button onClick={handleStartTimer} className="w-full bg-secondary hover:bg-secondary/90">
            <Play className="mr-2 h-4 w-4" /> Iniciar Espera
          </Button>
        )}
        <Button disabled={timerActive && timeLeft > 0} onClick={handleNextStep} className="w-full">
          {isLastStep ? "Finalizar Examen" : "Siguiente Paso"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TeensPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const waitingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "appointments"), where("status", "==", "waiting"), orderBy("dateTime", "asc"));
  }, [db]);

  const sessionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "exam_sessions"), where("status", "==", "in_progress"));
  }, [db]);

  const { data: waitingPatients, isLoading: loadingWaiting } = useCollection(waitingQuery);
  const { data: activeSessions, isLoading: loadingSessions } = useCollection(sessionsQuery);

  const startExam = async (patient: any) => {
    if (!db) return;
    try {
      await addDocumentNonBlocking(collection(db, "exam_sessions"), {
        appointmentId: patient.id,
        patientName: patient.patientName,
        examType: patient.examType,
        status: "in_progress",
        currentStepIndex: 0,
        startTime: new Date().toISOString(),
        timerWasActive: false,
        nextStepTime: null
      });
      updateDocumentNonBlocking(doc(db, "appointments", patient.id), { status: "in_progress" });
      toast({ title: "Examen Iniciado", description: `Iniciando protocolo para ${patient.patientName}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo iniciar el examen." });
    }
  };

  return (
    <AuthGuard requiredRole="teens">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Clock className="h-5 w-5" /> Sala de Espera ({waitingPatients?.length || 0})
              </h2>
              {loadingWaiting ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : waitingPatients?.length === 0 ? (
                <Card className="rounded-2xl border-dashed bg-muted/20">
                  <CardContent className="p-6 text-center text-xs text-muted-foreground">Sin pacientes en espera.</CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {waitingPatients?.map((p) => (
                    <Card key={p.id} className="rounded-xl border-l-4 border-l-yellow-500 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <p className="font-bold text-sm">{p.patientName}</p>
                        <Badge variant="secondary" className="text-[10px]">{p.examType}</Badge>
                        <Button size="sm" className="w-full rounded-lg" onClick={() => startExam(p)}>
                          <Play className="h-3 w-3 mr-1" /> Iniciar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Activity className="h-5 w-5" /> Estaciones de Test Activas ({activeSessions?.length || 0})
              </h2>
              {loadingSessions ? (
                <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin" /></div>
              ) : activeSessions?.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed text-center p-8">
                  <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-bold text-muted-foreground">Centro de test vacío</h3>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeSessions?.map((session) => (
                    <ActiveExamCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
