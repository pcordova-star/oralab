
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
  Flag,
  Coins
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

      <div className="relative glass-panel !bg-white rounded-[3rem] p-8 shadow-2xl border-primary/10 overflow-hidden min-h-[500px] flex flex-col">
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
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-blob" />
          </div>
          <div className="container mx-auto px-4 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6 md:space-y-8">
                <motion.div variants={fadeIn} className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <Activity className="h-3.5 w-3.5" /> Laboratorio Especializado
                  </span>
                </motion.div>
                <motion.h1 variants={fadeIn} className="text-3xl md:text-5xl lg:text-7xl font-black text-primary leading-[1.1]">
                  Test SIBO con <br />precisión clínica. <span className="text-gradient italic">Reserva tu cita.</span>
                </motion.h1>
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/booking"><Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold shadow-2xl bg-primary">Agendar mi Test</Button></Link>
                </motion.div>
              </motion.div>
              <div className="hidden lg:block relative"><TechScannerAnimation /></div>
            </div>
          </div>
        </section>

        {/* Sección Educativa */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-primary italic leading-tight">¿Por qué mi especialista me solicitó este test?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card className="p-8 border-blue-100 bg-blue-50/30 rounded-[2rem]">
                 <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                 <h3 className="text-4xl font-black text-primary mb-2">78%</h3>
                 <p className="text-sm font-bold text-muted-foreground">Muchos casos de 'estrés' son en realidad desequilibrios bacterianos (SIBO).</p>
              </Card>
              <Card className="p-8 border-emerald-100 bg-emerald-50/30 rounded-[2rem]">
                 <BarChart3 className="h-10 w-10 text-secondary mx-auto mb-4" />
                 <h3 className="text-4xl font-black text-primary mb-2">30%</h3>
                 <p className="text-sm font-bold text-muted-foreground">Nuestra tecnología detecta gases que equipos básicos no pueden ver.</p>
              </Card>
              <Card className="p-8 border-amber-100 bg-amber-50/30 rounded-[2rem]">
                 <ClipboardCheck className="h-10 w-10 text-amber-600 mx-auto mb-4" />
                 <h3 className="text-4xl font-black text-primary mb-2">3 hrs</h3>
                 <p className="text-sm font-bold text-muted-foreground">Generamos el mapa metabólico completo para tu tratamiento.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Asistente Simulador */}
        <section className="py-24 bg-muted/20 border-y">
           <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-6 lg:order-1">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic leading-tight">Test en Casa con <br/><span className="text-secondary">Guía Inteligente</span></h2>
                <p className="text-lg text-muted-foreground font-medium">Nuestro asistente guía al paciente paso a paso, explicando cada etapa para asegurar un resultado válido y profesional desde su hogar.</p>
                <Link href="/home-test"><Button variant="outline" className="rounded-full h-12 px-6 font-bold border-primary text-primary">Probar Asistente Real</Button></Link>
             </div>
             <div className="lg:order-2">
               <InteractiveAssistantSim />
             </div>
           </div>
        </section>

        {/* Informe Visual */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-primary italic">Resultados con <br/>Rigor Científico</h2>
              <p className="text-lg text-muted-foreground">Generamos informes detallados con curvas de Hidrógeno, Metano y Sulfuro, permitiendo un diagnóstico diferencial preciso para tu médico.</p>
            </div>
            <ClinicalReportVisualizer />
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <Logo />
            <p className="text-muted-foreground text-sm leading-relaxed">Laboratorio especializado en Salud Digestiva. Partner tecnológico Sunvou® en Chile.</p>
          </div>
          <div>
            <h5 className="font-black text-primary mb-6 uppercase tracking-widest">Sede Las Condes</h5>
            <div className="flex items-start gap-3 text-muted-foreground text-sm">
              <MapPin className="h-5 w-5 text-secondary shrink-0 mt-1" />
              <span>Apoquindo 3992, Of. 605, Las Condes.</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-black text-primary mb-2 uppercase tracking-widest">Accesos</h5>
            <Link href="/login" className="text-xs text-muted-foreground/40 hover:text-primary transition-colors flex items-center gap-2"><Lock className="h-3 w-3" /> Acceso Administrativo</Link>
            <Link href="/investors" className="text-xs text-muted-foreground/40 hover:text-secondary transition-colors flex items-center gap-2"><Coins className="h-3 w-3" /> Dashboard Inversionistas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
