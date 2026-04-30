"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Play, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { PROTOCOLS, Appointment } from "@/app/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/auth-guard";

const WAITING_PATIENTS: Appointment[] = [
  { id: "3", patientId: "p3", patientName: "Andrés Bello", examType: "SIBO", datetime: "10:15", status: "waiting" },
  { id: "6", patientId: "p6", patientName: "Roberto Gomez", examType: "HP", datetime: "11:00", status: "waiting" },
];

export default function TeensPage() {
  const [waitingPatients, setWaitingPatients] = useState<Appointment[]>(WAITING_PATIENTS);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const { toast } = useToast();

  const startExam = (patient: Appointment) => {
    const protocol = PROTOCOLS[patient.examType];
    setActiveExam({ ...patient, protocol });
    setCurrentStepIndex(0);
    setTimeLeft(0);
    setTimerActive(false);
    toast({ title: "Examen Iniciado", description: `Iniciando protocolo para ${patient.patientName}` });
  };

  const currentStep = activeExam?.protocol?.steps[currentStepIndex];
  const isLastStep = activeExam && currentStepIndex === activeExam.protocol.steps.length - 1;

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "¡Atención!",
        description: `El tiempo de espera para el paso "${currentStep?.name}" ha terminado.`,
        duration: 0,
      });
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, currentStep?.name, toast]);

  const handleNextStep = () => {
    if (isLastStep) {
      toast({ title: "Examen Finalizado", description: "Todos los pasos han sido completados." });
      setWaitingPatients(prev => prev.filter(p => p.id !== activeExam.id));
      setActiveExam(null);
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const nextStep = activeExam.protocol.steps[nextIndex];
    
    setCurrentStepIndex(nextIndex);
    
    if (nextStep.waitMinutes > 0) {
      setTimeLeft(nextStep.waitMinutes * 60);
      setTimerActive(true);
    } else {
      setTimeLeft(0);
      setTimerActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AuthGuard requiredRole="teens">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Clock className="h-6 w-6" /> Pacientes en Espera
              </h2>
              {waitingPatients.length === 0 ? (
                <Card className="rounded-2xl border-dashed bg-muted/20">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay pacientes pendientes.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {waitingPatients.map((p) => (
                    <Card key={p.id} className="rounded-2xl hover:shadow-md transition-all border-l-4 border-l-yellow-500">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{p.patientName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{p.examType}</Badge>
                            <span className="text-sm text-muted-foreground">{p.datetime}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => startExam(p)}
                          disabled={!!activeExam}
                          className="rounded-xl h-10 px-4"
                        >
                          <Play className="h-4 w-4 mr-1" /> Iniciar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {!activeExam ? (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed text-center">
                  <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">Ningún examen en curso</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    Selecciona un paciente de la lista de espera para iniciar el protocolo guiado.
                  </p>
                </div>
              ) : (
                <Card className="rounded-3xl shadow-xl border-2 border-primary/10 overflow-hidden">
                  <CardHeader className="bg-primary text-white p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-3xl font-bold mb-2">{activeExam.patientName}</CardTitle>
                        <CardDescription className="text-primary-foreground/80 text-lg flex items-center gap-2">
                          Protocolo: <strong>{activeExam.protocol.name}</strong>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white/20 border-white/40 text-white text-lg px-4 py-1">
                        Paso {currentStepIndex + 1} de {activeExam.protocol.steps.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <div className="mb-12">
                      <div className="flex justify-between text-sm font-medium text-muted-foreground mb-3">
                        <span>Progreso del Examen</span>
                        <span>{Math.round(((currentStepIndex + 1) / activeExam.protocol.steps.length) * 100)}%</span>
                      </div>
                      <Progress value={((currentStepIndex + 1) / activeExam.protocol.steps.length) * 100} className="h-4 rounded-full bg-muted" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <div className="bg-muted/30 p-8 rounded-3xl border">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Acción Actual</h4>
                          <p className="text-4xl font-extrabold text-foreground mb-4">{currentStep.name}</p>
                          <p className="text-lg text-muted-foreground leading-relaxed">{currentStep.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center text-center p-8 bg-background rounded-3xl border shadow-inner">
                        {currentStep.waitMinutes > 0 ? (
                          <>
                            <Timer className={`h-16 w-16 mb-4 ${timerActive ? 'text-secondary animate-pulse-subtle' : 'text-muted-foreground'}`} />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Tiempo de Espera</p>
                            <div className={`text-7xl font-mono font-bold tracking-tighter ${timeLeft === 0 && timerActive === false ? 'text-destructive' : 'text-primary'}`}>
                              {formatTime(timeLeft)}
                            </div>
                            {timeLeft === 0 && !timerActive && (
                              <Badge variant="destructive" className="mt-4 px-4 py-1 text-sm rounded-full flex gap-1 items-center">
                                <AlertCircle className="h-4 w-4" /> ¡Tiempo cumplido!
                              </Badge>
                            )}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-16 w-16 mb-4 text-green-500" />
                            <p className="text-lg font-bold text-foreground">Acción Manual Requerida</p>
                            <p className="text-sm text-muted-foreground mt-2">Ejecuta la muestra y avanza al siguiente paso.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 bg-muted/20 border-t flex flex-col md:flex-row gap-4 justify-between">
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-14 px-8 text-lg border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => { if(confirm("¿Seguro que deseas abortar el examen?")) setActiveExam(null); }}
                    >
                      Abortar Examen
                    </Button>
                    <div className="flex gap-4">
                      {currentStep.waitMinutes > 0 && !timerActive && timeLeft > 0 && (
                        <Button 
                          onClick={() => setTimerActive(true)}
                          className="rounded-xl h-14 px-8 text-lg bg-secondary hover:bg-secondary/90 shadow-lg"
                        >
                          <Play className="mr-2 h-5 w-5" /> Iniciar Temporizador
                        </Button>
                      )}
                      <Button 
                        disabled={timerActive && timeLeft > 0}
                        onClick={handleNextStep}
                        className="rounded-xl h-14 px-12 text-lg shadow-xl"
                      >
                        {isLastStep ? "Finalizar y Guardar" : "Siguiente Paso"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
