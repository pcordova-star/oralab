"use client";

import { useState, useEffect } from "react";
import { Navbar, Logo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Zap,
  Beaker,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Wind,
  Timer,
  Droplets,
  CheckCircle2,
  Microscope,
  Lock,
  Home,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
  Volume2,
  Bell,
  MapPin,
  ExternalLink,
  Handshake
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";

const reportData = [
  { time: 0, h2: 5, ch4: 2, h2s: 0.8, co2: 'OK', symptoms: 'Ninguno' },
  { time: 30, h2: 7, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Borborigmos' },
  { time: 60, h2: 12, ch4: 4, h2s: 1.1, co2: 'OK', symptoms: 'Distensión' },
  { time: 90, h2: 45, h2_alert: true, ch4: 6, h2s: 1.5, co2: 'OK', symptoms: 'Cólicos' },
  { time: 120, h2: 38, ch4: 5, h2s: 1.4, co2: 'OK', symptoms: 'Leve' },
  { time: 150, h2: 25, h2_alert: false, ch4: 4, h2s: 1.2, co2: 'OK', symptoms: 'Final' },
  { time: 180, h2: 15, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Ninguno' },
];

const EXAMS = [
  {
    title: "Test de SIBO",
    desc: "Detecta el sobrecrecimiento bacteriano en el intestino delgado mediante hidrógeno y metano.",
    duration: "90 min",
    icon: <Activity className="h-6 w-6 text-primary" />
  },
  {
    title: "Intolerancia Lactosa",
    desc: "Identifica la incapacidad de digerir el azúcar de la leche y derivados.",
    duration: "180 min",
    icon: <Droplets className="h-6 w-6 text-primary" />
  },
  {
    title: "Intolerancia Fructosa",
    desc: "Evaluación de malabsorción de azúcares presentes en frutas y miel.",
    duration: "180 min",
    icon: <Zap className="h-6 w-6 text-primary" />
  },
  {
    title: "Test Lactulosa",
    desc: "Prueba estándar de oro para evaluar el tiempo de tránsito intestinal y SIBO distal.",
    duration: "180 min",
    icon: <Beaker className="h-6 w-6 text-primary" />
  }
];

const HomeTestSimulator = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { title: "Enjuague Bucal", type: "mouthwash", icon: <Sparkles className="h-8 w-8" />, color: "text-emerald-400" },
    { title: "Muestra Basal (T-0)", type: "breath", icon: <Wind className="h-8 w-8" />, color: "text-blue-400" },
    { title: "Ingesta Sustrato", type: "ingest", icon: <Droplets className="h-8 w-8" />, color: "text-amber-400" },
    { title: "Reposo (28 min)", type: "wait", icon: <Timer className="h-8 w-8" />, color: "text-secondary" },
    { title: "Alarma Activa", type: "alarm", icon: <Bell className="h-8 w-8 animate-bounce" />, color: "text-red-400" },
    { title: "Muestra 2 (T-30)", type: "breath", icon: <Wind className="h-8 w-8" />, color: "text-blue-400" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-[320px] aspect-[9/16] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col p-6 font-body">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
      <div className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col">
        <header className="p-3 border-b bg-slate-50 flex items-center justify-between">
          <Logo />
          <Volume2 className="h-4 w-4 text-primary" />
        </header>
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="space-y-4 w-full"
            >
              <div className={cn("mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center shadow-inner", steps[step].color)}>
                {steps[step].icon}
              </div>
              <div>
                <Badge variant="outline" className="mb-2 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">PASO {step + 1} / {steps.length}</Badge>
                <h4 className="text-sm font-black text-slate-900 leading-tight italic">{steps[step].title}</h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-tight">Simulación de protocolo acelerado.</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="w-full space-y-2">
            {steps[step].type === 'wait' || steps[step].type === 'alarm' ? (
              <div className="text-4xl font-black text-primary tabular-nums">
                {steps[step].type === 'alarm' ? "0:00" : "27:54"}
              </div>
            ) : null}
            <Button className={cn("w-full rounded-xl text-[10px] font-black h-10 shadow-lg", steps[step].type === 'alarm' ? "bg-red-500 animate-pulse" : "bg-primary")}>
              {steps[step].type === 'breath' ? "CONFIRMAR SOPLIDO" : "CONTINUAR TEST"}
            </Button>
          </div>
        </div>
        <footer className="p-3 bg-slate-50 border-t text-[8px] font-bold text-slate-400 flex justify-between items-center">
          <span>BITÁCORA ACTIVA</span>
          <Activity className="h-3 w-3 text-secondary" />
        </footer>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-700 rounded-full" />
    </div>
  );
};

const TechnologicalHeroTitle = () => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center lg:items-start gap-4 mb-16"
      >
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 px-8 rounded-[2.5rem] border border-primary/10 shadow-lg group scale-150 origin-center lg:origin-left transition-transform duration-500">
          <Logo />
        </div>
      </motion.div>
      <div className="space-y-2">
        <div className="relative inline-block overflow-hidden">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-primary leading-[0.95] tracking-tighter italic"
          >
            Aire <span className="text-secondary relative">Espirado<motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 1 }} className="absolute -bottom-2 left-0 w-full h-2 bg-secondary/20 rounded-full origin-left" /></span>
          </motion.h1>
        </div>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }} className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4">
          <div className="h-[2px] w-12 bg-secondary/50 hidden lg:block" />
          <p className="text-2xl md:text-4xl font-bold text-primary/40 tracking-tighter">SIBO e <span className="text-primary font-black uppercase tracking-widest relative group cursor-default">Intolerancias<motion.span animate={{ left: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 h-[2px] w-full bg-secondary/50 blur-[2px]" /></span></p>
        </motion.div>
      </div>
    </div>
  );
};

const ClinicalReportVisualizer = () => {
  const isMobile = useIsMobile();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative w-full glass-panel rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl border-primary/10 overflow-hidden bg-white/70">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-primary/10 pb-4">
          <div>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 font-black mb-1">SUNVOU® CERTIFIED</Badge>
            <h3 className="text-base md:text-xl font-black text-primary italic">Análisis de Biomarcadores</h3>
          </div>
          <Badge className="bg-blue-500 text-white border-none text-[10px] md:text-xs">PRECISIÓN DE LABORATORIO</Badge>
        </div>
        <div className="h-[200px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
              <XAxis dataKey="time" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} hide={isMobile} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              {!isMobile && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />}
              <Line name="H₂ (Hidrógeno)" type="monotone" dataKey="h2" stroke="#1c68b6" strokeWidth={isMobile ? 3 : 4} dot={!isMobile} />
              <Line name="CH₄ (Metano)" type="monotone" dataKey="ch4" stroke="#10b981" strokeWidth={isMobile ? 2 : 3} dot={!isMobile} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const whatsappUrl = "https://wa.me/56936850468";
  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      <main className="flex-grow">
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 md:space-y-8">
                <TechnologicalHeroTitle />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.5 }} className="pt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link href="/booking"><Button size="lg" className="group rounded-full h-20 px-12 text-2xl font-black shadow-2xl bg-primary hover:bg-secondary transition-all hover:scale-105">Reserva tu cita <ChevronRight className="ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" /></Button></Link>
                  <Link href="/how-it-works"><Button variant="outline" size="lg" className="rounded-full h-20 px-8 text-xl font-bold border-2 border-primary text-primary">¿Cómo funciona?</Button></Link>
                </motion.div>
              </div>
              <div className="hidden lg:flex justify-center relative">
                 <div className="w-full max-w-[400px] aspect-square bg-secondary/10 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/30 animate-pulse"><Microscope className="h-32 w-32 text-secondary" /></div>
                 <div className="absolute -bottom-10 -right-10 glass-panel p-6 rounded-3xl border-primary/10 animate-float">
                    <p className="text-4xl font-black text-primary">Sunvou®</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tecnología de Punta</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ALIANZA CYBERSALUD */}
        <section className="py-24 bg-muted/30 border-t relative overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto">
              <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-primary/5 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="shrink-0 w-full md:w-auto flex justify-center">
                  <a href="https://www.cybersalud.cl" target="_blank" rel="noopener noreferrer" className="block group transition-all duration-500 hover:scale-105">
                    <div className="relative bg-muted/20 p-6 rounded-[2.5rem] border border-primary/10 overflow-hidden shadow-inner">
                      <Image src="/logo_cybersalud.jpg" alt="Logo Cybersalud" width={240} height={100} className="h-auto w-auto max-w-[200px] md:max-w-[240px]" />
                    </div>
                  </a>
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest">
                    <Handshake className="h-3 w-3" /> Partner en Telemedicina
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-primary italic leading-tight">¿Necesitas asistencia médica y seguimiento?</h3>
                  <p className="text-lg text-muted-foreground font-medium">A través de nuestra alianza con Cybersalud, ponemos a tu disposición especialistas que te ayudarán con la interpretación clínica de tus resultados.</p>
                  <a href="https://www.cybersalud.cl" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button className="rounded-full bg-primary hover:bg-secondary font-black h-14 px-8 shadow-lg transition-all group">Visitar Cybersalud <ExternalLink className="ml-2 h-4 w-4" /></Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="bg-white border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="text-muted-foreground text-sm mt-4">Laboratorio especializado en Salud Digestiva Avanzada.</p>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-8">© 2024 Oralab Clinical Lab. Apoquindo 3990, Of. 605.</p>
        </div>
      </footer>
    </div>
  );
}