
"use client";

import { useState } from "react";
import { Navbar, Logo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ArrowRight, 
  Microscope, 
  ShieldCheck, 
  Zap,
  Beaker,
  AlertCircle,
  Award,
  Search,
  CheckCircle,
  Stethoscope,
  ClipboardCheck,
  CalendarDays,
  MapPin,
  MessageCircle,
  Lock,
  ChevronRight,
  Sparkles,
  UserRoundCheck,
  Wind,
  TrendingUp,
  FileText,
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  Info,
  HelpCircle,
  Building2,
  Smartphone,
  Timer,
  Home,
  Database,
  Droplets,
  RotateCcw,
  CheckCircle2,
  Flag
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceArea 
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const reportData = [
  { time: 0, h2: 5, ch4: 2, h2s: 0.8, co2: 'OK', symptoms: 'Ninguno' },
  { time: 20, h2: 7, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Borborigmos' },
  { time: 40, h2: 12, ch4: 4, h2s: 1.1, co2: 'OK', symptoms: 'Distensión' },
  { time: 60, h2: 28, h2_alert: true, ch4: 5, h2s: 1.3, co2: 'OK', symptoms: 'Gases' },
  { time: 90, h2: 45, h2_alert: true, ch4: 6, h2s: 1.5, co2: 'OK', symptoms: 'Cólicos' },
  { time: 120, h2: 38, ch4: 5, h2s: 1.4, co2: 'OK', symptoms: 'Leve' },
  { time: 150, h2: 25, h2_alert: false, ch4: 4, h2s: 1.2, co2: 'OK', symptoms: 'Final' },
  { time: 180, h2: 15, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Ninguno' },
];

const ClinicalReportVisualizer = () => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative w-full glass-panel rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl border-primary/10 overflow-hidden bg-white/70"
    >
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-primary/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 font-black">SUNVOU® CERTIFIED</Badge>
              {!isMobile && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">ID: ORL-2024-0526</span>}
            </div>
            <h3 className="text-base md:text-xl font-black text-primary italic">Resumen Técnico de Biomarcadores</h3>
          </div>
          <div className="text-left sm:text-right">
            <Badge className="bg-red-500 text-white border-none animate-pulse text-[10px] md:text-xs">POSITIVO SIBO (H₂)</Badge>
          </div>
        </div>

        <div className="h-[200px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
                hide={isMobile}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              {!isMobile && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />}
              <ReferenceArea x1={0} x2={90} y1={0} y2={60} fill="#f8fafc" fillOpacity={0.5} label={!isMobile ? { position: 'top', value: 'Ventana SIBO', fontSize: 10, fill: '#94a3b8' } : undefined} />
              <Line name="H₂" type="monotone" dataKey="h2" stroke="#1c68b6" strokeWidth={isMobile ? 3 : 4} dot={!isMobile} activeDot={{ r: 6 }} />
              <Line name="CH₄" type="monotone" dataKey="ch4" stroke="#10b981" strokeWidth={isMobile ? 2 : 3} dot={!isMobile} />
              <Line name="H₂S" type="monotone" dataKey="h2s" stroke="#f59e0b" strokeWidth={isMobile ? 2 : 3} dot={!isMobile} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-xl border border-primary/5 -mx-4 md:mx-0">
          <Table className="min-w-[400px] md:min-w-full">
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">Tiempo</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">H₂ (ppm)</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">CH₄ (ppm)</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">H₂S (ppm)</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">Síntomas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.slice(0, 5).map((row, i) => (
                <TableRow key={i} className="hover:bg-primary/5">
                  <TableCell className="py-2 text-[9px] md:text-[10px] font-bold">{row.time} min</TableCell>
                  <TableCell className={cn("py-2 text-[9px] md:text-[10px] font-black", row.h2 > 20 ? "text-red-600" : "text-primary")}>{row.h2}</TableCell>
                  <TableCell className="py-2 text-[9px] md:text-[10px] font-medium">{row.ch4}</TableCell>
                  <TableCell className="py-2 text-[9px] md:text-[10px] font-medium text-amber-600">{row.h2s}</TableCell>
                  <TableCell className="py-2 text-[9px] md:text-[10px] italic text-muted-foreground">{row.symptoms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};

const TechScannerAnimation = () => {
  return (
    <div className="relative w-full aspect-square max-w-[280px] md:max-w-[400px] flex items-center justify-center mx-auto">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full border-2 border-dashed border-secondary/20 rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[80%] h-[80%] border border-white/10 rounded-full"
      />
      <div className="relative z-10 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-full border border-white/20 shadow-2xl flex items-center justify-center">
        <Wind className="h-10 w-10 md:h-16 md:w-16 text-secondary animate-pulse" />
      </div>
      {[
        { label: "H₂", color: "text-blue-400", delay: 0 },
        { label: "CH₄", color: "text-emerald-400", delay: 2 },
        { label: "H₂S", color: "text-amber-400", delay: 4 },
      ].map((gas, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [20, -100],
            x: [0, (i - 1) * 40],
            scale: [0.5, 1, 0.5]
          }}
          transition={{ duration: 4, delay: gas.delay, repeat: Infinity, ease: "easeOut" }}
          className={`absolute font-black text-lg md:text-xl ${gas.color} pointer-events-none`}
        >
          {gas.label}
        </motion.div>
      ))}
    </div>
  );
};

const InteractiveAssistantSim = () => {
  const [step, setStep] = useState(0);

  const simSteps = [
    {
      title: "Muestra Basal (T-0)",
      instruction: "Sopla en el primer tubo antes de ingerir el sustrato.",
      importance: "Este es tu punto cero. Nos permite saber cuántos gases produce tu cuerpo naturalmente antes del estímulo.",
      icon: <Wind className="h-8 w-8" />,
      badge: "Paso 1 / 14",
      button: "Confirmar Soplido",
      time: "00:00"
    },
    {
      title: "Ingesta del Sustrato",
      instruction: "Bebe la solución lentamente durante 5 minutos.",
      importance: "El sustrato (lactulosa o azúcar) es el 'alimento' que las bacterias fermentarán si están presentes en exceso.",
      icon: <Droplets className="h-8 w-8" />,
      badge: "Paso 2 / 14",
      button: "Comenzar Ingesta",
      time: "05:00"
    },
    {
      title: "Periodo de Espera",
      instruction: "Mantén reposo absoluto durante 20 minutos.",
      importance: "El reposo es vital. La actividad física altera la respiración y puede diluir los gases, dando un falso negativo.",
      icon: <Timer className="h-8 w-8" />,
      badge: "Paso 3 / 14",
      button: "Esperando...",
      time: "14:52",
      isWaiting: true
    },
    {
      title: "Segunda Muestra (T-20)",
      instruction: "Sopla suavemente en el tubo número 2.",
      importance: "Aquí evaluamos el inicio del tránsito. Detectar gases tempranos sugiere bacterias en el intestino delgado (SIBO).",
      icon: <Wind className="h-8 w-8" />,
      badge: "Paso 4 / 14",
      button: "Confirmar Soplido",
      time: "00:00"
    },
    {
      title: "Seguimiento Seriados",
      instruction: "Este proceso se repite cada 20-30 minutos.",
      importance: "Repetiremos los soplidos y esperas 10 veces más. Esto construye tu curva metabólica completa para el médico.",
      icon: <RotateCcw className="h-8 w-8" />,
      badge: "Pasos 5 al 13",
      button: "Simular Ciclo Completo",
      time: "--:--"
    },
    {
      title: "¡Test Finalizado!",
      instruction: "Has completado todas las muestras con éxito.",
      importance: "¡Excelente! Has garantizado una toma de muestra profesional. Ahora solo entrega tus tubos en el laboratorio.",
      icon: <CheckCircle2 className="h-10 w-10 text-secondary" />,
      badge: "Paso 14 / 14",
      button: "Ver Resumen",
      time: "LISTO",
      isFinal: true
    }
  ];

  const current = simSteps[step];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Speech Bubble (Globo didáctico) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-24 left-0 right-0 z-20"
        >
          <div className="bg-primary text-white p-4 rounded-2xl shadow-xl relative border-2 border-white/20">
            <p className="text-xs font-bold leading-relaxed italic">
              <Sparkles className="h-3 w-3 inline mr-1 text-secondary" /> {current.importance}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 border-r-2 border-b-2 border-white/20" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Phone Mockup */}
      <div className="relative glass-panel !bg-white rounded-[3rem] p-8 shadow-2xl border-primary/10 overflow-hidden min-h-[500px] flex flex-col">
        <div className="absolute top-4 right-6 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        
        <div className="mt-6 space-y-6 text-center flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Badge className={cn("font-black uppercase text-[10px]", current.isFinal ? "bg-green-500" : "bg-secondary")}>
                {current.badge}
              </Badge>
              
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500",
                current.isFinal ? "bg-green-100 text-green-600 scale-110 shadow-lg" : 
                current.title.includes("Muestra") ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600"
              )}>
                {current.icon}
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-primary italic leading-tight">{current.title}</h4>
                <p className="text-[10px] font-bold text-muted-foreground leading-tight px-4">{current.instruction}</p>
              </div>
              
              {!current.isFinal && (
                <div className="py-4">
                  <div className="text-4xl font-black text-primary font-mono tabular-nums">{current.time}</div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Tiempo restante</p>
                </div>
              )}

              <Button 
                onClick={() => setStep((step + 1) % simSteps.length)}
                className={cn(
                  "w-full rounded-xl font-bold shadow-lg active:scale-95 transition-all h-12",
                  current.isWaiting ? "bg-slate-200 text-slate-500 pointer-events-none" : 
                  current.isFinal ? "bg-green-600 hover:bg-green-700" : "bg-secondary hover:bg-secondary/90"
                )}
              >
                {current.button}
              </Button>
            </motion.div>
          </AnimatePresence>
          
          {current.isWaiting && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold text-primary underline mt-2"
              onClick={() => setStep((step + 1) % simSteps.length)}
            >
              Simular fin de espera
            </Button>
          )}

          {current.isFinal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="pt-4 border-t border-dashed"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-[10px] font-bold"
                onClick={() => setStep(0)}
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reiniciar Simulación
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Apoquindo+3992+oficina+605+Las+Condes+Santiago+Chile";
  const whatsappUrl = "https://wa.me/56936850468";

  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section: Enfoque en Agenda y Rigor Clínico */}
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-blob" />
            <div className="absolute top-[20%] right-[-5%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-secondary/10 rounded-full blur-[70px] md:blur-[100px] animate-blob animation-delay-2000" />
          </div>

          <div className="container mx-auto px-4 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="space-y-6 md:space-y-8"
              >
                <motion.div variants={fadeIn} className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-bold border border-primary/20 backdrop-blur-sm">
                    <Activity className="h-3.5 w-3.5 md:h-4 md:w-4" /> Laboratorio Especializado
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary/10 text-secondary text-xs md:text-sm font-bold border border-secondary/20 backdrop-blur-sm">
                    <Microscope className="h-3.5 w-3.5 md:h-4 md:w-4" /> Tecnología Sunvou®
                  </span>
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-3xl md:text-5xl lg:text-7xl font-black text-primary leading-[1.1]">
                  Test SIBO con <br />precisión clínica. <span className="text-gradient italic">Reserva tu cita.</span>
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Somos especialistas en el diagnóstico de sobrecrecimiento bacteriano e intolerancias alimentarias mediante aire espirado multigas.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4">
                  <Link href="/booking" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group">
                      Agendar mi Test <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-16 px-8 text-base md:text-lg font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all">
                      Conoce el protocolo
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10 p-4">
                   <div className="aspect-square bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white/40 flex items-center justify-center overflow-hidden shadow-2xl">
                      <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12 scale-150">
                        <Logo />
                      </div>
                      <div className="relative text-center space-y-6">
                        <div className="bg-primary/10 p-8 rounded-full inline-block shadow-inner">
                           <CalendarDays className="h-20 w-20 text-primary" />
                        </div>
                        <h4 className="text-2xl font-black text-primary italic leading-none">Agenda Digital</h4>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Reserva inmediata 24/7</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Home Test Assistant: Simulación Interactiva */}
        <section className="py-32 bg-gradient-to-b from-white to-muted/20 border-y overflow-visible">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 pt-12 lg:pt-0">
                <InteractiveAssistantSim />
              </div>

              <div className="order-1 lg:order-2 space-y-8">
                <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold">VALOR AGREGADO</Badge>
                <h2 className="text-3xl md:text-5xl font-black text-primary italic leading-tight">
                  Prueba nuestro <br /><span className="text-secondary">Asistente Digital</span>
                </h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  Interactúa con la simulación a la izquierda. Nuestro asistente guía al paciente paso a paso, explicando la importancia de cada etapa para asegurar un resultado válido.
                </p>
                
                <div className="grid gap-6">
                  {[
                    { 
                      t: "Guía Paso a Paso", 
                      d: "Un cronómetro inteligente te avisa exactamente cuándo soplar.", 
                      i: <Timer className="h-6 w-6" /> 
                    },
                    { 
                      t: "Explicación Clínica", 
                      d: "Cada paso detalla su relevancia para el diagnóstico final.", 
                      i: <Info className="h-6 w-6" /> 
                    },
                    { 
                      t: "Trazabilidad Total", 
                      d: "Tus tiempos se sincronizan con nuestro laboratorio para validación.", 
                      i: <Database className="h-6 w-6" /> 
                    }
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="bg-primary/5 p-3 rounded-xl text-primary">{feat.i}</div>
                      <div>
                        <h4 className="font-black text-primary text-base">{feat.t}</h4>
                        <p className="text-sm text-muted-foreground font-medium">{feat.d}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link href="/home-test" className="inline-block mt-4">
                  <Button variant="link" className="text-primary font-black flex items-center gap-2 p-0 text-lg">
                    Ir al Asistente Real <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Representación Banner */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="bg-secondary/10 p-4 rounded-3xl">
                  <Award className="h-10 w-10 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-primary italic">Partner Oficial Sunvou® en Chile</h3>
                  <p className="text-muted-foreground font-medium">Representación exclusiva para clínicas e instituciones médicas.</p>
                </div>
              </div>
              <Link href="/sunvou">
                <Button size="lg" className="rounded-full h-14 px-8 font-black bg-primary hover:bg-secondary hover:text-white transition-all">
                  Ver Oferta Institucional <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Estadísticas Clínicas */}
        <section className="py-12 md:py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20 space-y-4">
              <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold">EDUCACIÓN AL PACIENTE</Badge>
              <h2 className="text-2xl md:text-5xl font-black text-primary italic leading-tight">¿Por qué mi especialista me solicitó este test?</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { 
                  stat: "78%", 
                  label: "No es solo estrés", 
                  desc: "Hasta el 78% de personas con síntomas de Colon Irritable tienen en realidad un sobrecrecimiento de bacterias (SIBO).", 
                  icon: <Users className="h-8 w-8" />,
                  color: "border-blue-100 bg-blue-50/30"
                },
                { 
                  stat: "30%", 
                  label: "Más allá de lo básico", 
                  desc: "Nuestra tecnología detecta gases (Metano y Sulfuro) que otros equipos pasan por alto.", 
                  icon: <BarChart3 className="h-8 w-8" />,
                  color: "border-emerald-100 bg-emerald-50/30"
                },
                { 
                  stat: "1 de 5", 
                  label: "Tus síntomas tienen explicación", 
                  desc: "Cerca del 20% de los adultos sufren intolerancias a la lactosa o fructosa sin saberlo.", 
                  icon: <PieChartIcon className="h-8 w-8" />,
                  color: "border-amber-100 bg-amber-50/30"
                },
                { 
                  stat: "180", 
                  label: "Un mapa para tu médico", 
                  desc: "En 3 horas de seguimiento, generamos la curva metabólica que tu médico necesita.", 
                  icon: <ClipboardCheck className="h-8 w-8" />,
                  color: "border-purple-100 bg-purple-50/30"
                },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all shadow-sm flex flex-col items-center text-center group",
                    item.color
                  )}
                >
                  <div className="mb-4 md:mb-6 text-primary group-hover:scale-110 transition-transform bg-white p-3 md:p-4 rounded-2xl shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-3xl md:text-4xl font-black text-primary mb-1 md:mb-2">{item.stat}</span>
                  <span className="text-sm md:text-base font-black text-primary/80 uppercase tracking-widest mb-3 md:mb-4 leading-tight">{item.label}</span>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sección de Ciencia y Tecnología */}
        <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 leading-tight italic"
                >
                  Rigor técnico al servicio de la <span className="text-secondary">gastroenterología</span>
                </motion.h2>
                <p className="text-base md:text-xl opacity-80 mb-8 md:mb-12 leading-relaxed">
                  Nuestra metodología Sunvou® permite cuantificar Hidrógeno, Metano y Sulfuro de Hidrógeno de forma simultánea para un diagnóstico diferencial preciso.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Microscope className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg">Informe Especializado</h4>
                      <p className="text-xs md:text-sm opacity-60">Resultados cuantificables diseñados para interpretación médica.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg">Precisión Sunvou®</h4>
                      <p className="text-xs md:text-sm opacity-60">Tecnología alineada con estándares internacionales.</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="w-full max-w-sm md:max-w-md mx-auto bg-secondary/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden border border-white/10 relative group">
                  <TechScannerAnimation />
                  <div className="absolute bottom-6 left-6 right-6 text-center z-30">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-secondary mb-1">Análisis Multigas Simultáneo</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">H₂ · CH₄ · H₂S</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Visualización de Informe Técnico */}
        <section className="py-16 md:py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
               <div className="space-y-6 md:space-y-8">
                  <div className="inline-block p-3 md:p-4 rounded-2xl md:rounded-3xl bg-primary/5 text-primary border border-primary/10">
                    <FileText className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-primary italic leading-tight">Visualización técnica de resultados</h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Un informe técnico de Oralab entrega una representación gráfica que permite al especialista identificar patrones clínicos como el SIBO o intolerancias.
                  </p>
                  <Link href="/booking">
                    <Button size="lg" className="rounded-full px-8 font-black">Agendar mi examen ahora</Button>
                  </Link>
               </div>

               <div className="relative mt-8 lg:mt-0 w-full max-w-full">
                  <ClinicalReportVisualizer />
               </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-12 md:py-32 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-16 lg:p-24 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 text-center space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-5xl lg:text-7xl font-black text-white leading-tight">
                Comprometidos con el soporte al diagnóstico médico.
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-4 md:pt-8">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-20 px-10 md:px-12 text-lg md:text-2xl font-black shadow-2xl bg-white text-primary hover:bg-secondary hover:text-white transition-all hover:scale-105 active:scale-95">
                    Reservar mi Cita
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-20 px-8 md:px-10 text-base md:text-xl font-bold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md">
                    <MessageCircle className="h-5 w-5 md:h-6 md:w-6 mr-3" /> Consultas Técnicas
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-10 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
            <div className="col-span-1 lg:col-span-2 space-y-6 md:space-y-8">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
              <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                Laboratorio clínico especializado en Salud Digestiva. Partner tecnológico Sunvou® en Chile.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h5 className="font-black text-primary mb-4 md:mb-8 text-base md:text-xl uppercase tracking-widest">Sede Las Condes</h5>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="group space-y-4 block">
                <div className="flex items-start justify-center md:justify-start gap-3 text-muted-foreground group-hover:text-primary transition-colors text-sm md:text-lg">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-secondary shrink-0 mt-1" />
                  <span>Apoquindo 3992, Of. 605, Las Condes. <br /> Centro Médico Alcántara.</span>
                </div>
              </a>
            </div>
            <div className="text-center md:text-left">
              <h5 className="font-black text-primary mb-4 md:mb-8 text-base md:text-xl uppercase tracking-widest">Gestión Clínica</h5>
              <ul className="space-y-3 md:space-y-4 text-sm md:text-lg">
                <li><Link href="/booking" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Reservar Examen</Link></li>
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Protocolo Técnico</Link></li>
                <li><Link href="/login" className="text-muted-foreground/30 hover:text-primary transition-colors inline-flex items-center gap-2 text-xs"><Lock className="h-3 w-3" /> Acceso Personal</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 md:pt-12 border-t border-border mt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground text-[10px] md:text-xs font-medium">
            <p>© 2024 Oralab Clinical Lab. Diagnóstico especializado Sunvou®.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
