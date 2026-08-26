
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
  ClipboardCheck,
  MapPin,
  Lock,
  ChevronRight,
  Sparkles,
  Wind,
  BarChart3,
  Timer,
  Home,
  Droplets,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Briefcase,
  Users,
  FileText,
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
  Legend, 
  ReferenceArea 
} from 'recharts';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const reportData = [
  { time: 0, h2: 5, ch4: 2, h2s: 0.8, co2: 'OK', symptoms: 'Ninguno' },
  { time: 30, h2: 7, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Borborigmos' },
  { time: 60, h2: 12, ch4: 4, h2s: 1.1, co2: 'OK', symptoms: 'Distensión' },
  { time: 90, h2: 45, h2_alert: true, ch4: 6, h2s: 1.5, co2: 'OK', symptoms: 'Cólicos' },
  { time: 120, h2: 38, ch4: 5, h2s: 1.4, co2: 'OK', symptoms: 'Leve' },
  { time: 150, h2: 25, h2_alert: false, ch4: 4, h2s: 1.2, co2: 'OK', symptoms: 'Final' },
  { time: 180, h2: 15, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Ninguno' },
];

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
            Test <span className="text-secondary relative">
              SIBO
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute -bottom-2 left-0 w-full h-2 bg-secondary/20 rounded-full origin-left"
              />
            </span>
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4"
        >
          <div className="h-[2px] w-12 bg-secondary/50 hidden lg:block" />
          <p className="text-2xl md:text-4xl font-bold text-primary/40 tracking-tighter">
            con <span className="text-primary font-black uppercase tracking-widest relative group cursor-default">
              precisión clínica
              <motion.span 
                animate={{ left: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 h-[2px] w-full bg-secondary/50 blur-[2px]"
              />
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

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
            </div>
            <h3 className="text-base md:text-xl font-black text-primary italic">Resumen Técnico de Biomarcadores</h3>
          </div>
          <div className="text-left sm:text-right">
            <Badge className="bg-red-50 text-white border-none animate-pulse text-[10px] md:text-xs">POSITIVO SIBO (H₂)</Badge>
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
              />
              {!isMobile && <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />}
              <ReferenceArea x1={0} x2={90} y1={0} y2={60} fill="#f8fafc" fillOpacity={0.5} />
              <Line name="H₂" type="monotone" dataKey="h2" stroke="#1c68b6" strokeWidth={isMobile ? 3 : 4} dot={!isMobile} />
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
      <div className="relative z-10 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-full border border-white/20 shadow-2xl flex items-center justify-center">
        <Wind className="h-10 w-10 md:h-16 md:w-16 text-secondary animate-pulse" />
      </div>
    </div>
  );
};

const SIBOEducationSection = () => {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="bg-secondary text-primary font-black px-4 py-1 border-none uppercase tracking-widest">¿Qué es el SIBO?</Badge>
            <h2 className="text-4xl md:text-6xl font-black italic leading-tight">
              Entendiendo el <span className="text-secondary">Sobrecrecimiento Bacteriano</span>
            </h2>
            <div className="space-y-6 text-lg md:text-xl opacity-90 leading-relaxed font-medium">
              <p>
                El SIBO ocurre cuando hay un exceso de bacterias en el <strong>intestino delgado</strong>, una sección que normalmente es casi estéril.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
               {[
                 { icon: <Zap className="h-6 w-6 text-secondary" />, title: "Robo de Nutrientes", desc: "Las bacterias consumen tus alimentos antes que tú." },
                 { icon: <AlertCircle className="h-6 w-6 text-secondary" />, title: "Gases y Toxinas", desc: "La fermentación produce Hidrógeno y Metano." },
               ].map((item, i) => (
                 <div key={i} className="bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                   <div className="mb-4">{item.icon}</div>
                   <h4 className="font-black text-lg mb-2">{item.title}</h4>
                   <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const InteractiveAssistantSim = () => {
  const [step, setStep] = useState(0);

  const simSteps = [
    {
      title: "Enjuague Bucal",
      instruction: "Enjuague su boca con agua durante 1 minuto.",
      importance: "Limpia la cavidad oral de bacterias que podrían falsear los resultados iniciales.",
      icon: <Sparkles className="h-8 w-8" />,
      badge: "Preparación",
      button: "Comenzar Enjuague",
      time: "01:00"
    },
    {
      title: "Muestra Basal (T-0)",
      instruction: "Sopla en el primer tubo antes de ingerir el sustrato.",
      importance: "Este es tu punto cero. Nos permite saber cuántos gases produce tu cuerpo naturalmente.",
      icon: <Wind className="h-8 w-8" />,
      badge: "Muestra 1 / 7",
      button: "Confirmar Soplido",
      time: "00:00"
    },
    {
      title: "Ingesta del Sustrato",
      instruction: "Beba la solución lentamente durante 2 minutos.",
      importance: "El sustrato es el 'alimento' que las bacterias fermentarán si están presentes en exceso.",
      icon: <Droplets className="h-8 w-8" />,
      badge: "Ingesta",
      button: "Comenzar Ingesta",
      time: "02:00"
    },
    {
      title: "Periodo de Espera",
      instruction: "Mantén reposo absoluto durante 28 minutos.",
      importance: "El intervalo de 30 minutos es el estándar de oro para construir una curva metabólica fiable.",
      icon: <Timer className="h-8 w-8" />,
      badge: "Espera Fija",
      button: "Esperando...",
      time: "28:00",
      isWaiting: true
    },
    {
      title: "Segunda Muestra (T-30)",
      instruction: "Sopla suavemente en el tubo número 2.",
      importance: "Aquí evaluamos el inicio del tránsito intestinal.",
      icon: <Wind className="h-8 w-8" />,
      badge: "Muestra 2 / 7",
      button: "Confirmar Soplido",
      time: "00:00"
    },
    {
      title: "¡Test Finalizado!",
      instruction: "Has completado todas las muestras con éxito.",
      importance: "Has garantizado una toma de muestra profesional. Ahora entrega tus tubos en el laboratorio.",
      icon: <CheckCircle2 className="h-10 w-10 text-secondary" />,
      badge: "Protocolo Logrado",
      button: "Ver Resumen",
      time: "180 MIN",
      isFinal: true
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % simSteps.length);
    }, 4500); 
    return () => clearInterval(timer);
  }, [simSteps.length]);

  const current = simSteps[step];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-24 left-0 right-0 z-20 px-2"
        >
          <div className="bg-primary text-white p-4 rounded-2xl shadow-xl relative border-2 border-white/20">
            <p className="text-[11px] font-bold leading-relaxed italic">
              <Sparkles className="h-3 w-3 inline mr-1 text-secondary" /> {current.importance}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 border-r-2 border-b-2 border-white/20" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative glass-panel !bg-white rounded-[3rem] p-8 shadow-2xl border-primary/10 overflow-hidden min-h-[500px] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
           <motion.div 
             key={step}
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 4.5, ease: "linear" }}
             className="h-full bg-secondary"
           />
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
              <Badge className={cn(
                "font-black uppercase text-[10px] px-3 py-1 rounded-full",
                current.isFinal ? "bg-green-500" : "bg-secondary"
              )}>
                {current.badge}
              </Badge>

              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 shadow-inner",
                current.isFinal ? "bg-green-100 text-green-600 scale-110 shadow-lg" : 
                current.title === "Enjuague Bucal" ? "bg-emerald-100 text-emerald-600" :
                current.title.includes("Muestra") ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-600"
              )}>
                <motion.div
                  animate={current.isFinal ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {current.icon}
                </motion.div>
              </div>

              <div className="space-y-2 px-2">
                <h4 className="text-2xl font-black text-primary italic leading-tight">{current.title}</h4>
                <p className="text-sm font-bold text-muted-foreground leading-snug">{current.instruction}</p>
              </div>

              <div className="pt-4">
                <Button 
                  className={cn(
                    "w-full rounded-2xl font-black shadow-lg transition-all h-14 text-base",
                    current.isWaiting ? "bg-slate-200 text-slate-500 border border-slate-300" : 
                    current.isFinal ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {current.button}
                </Button>
                {current.time !== "--:--" && (
                  <p className="mt-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Cronómetro: {current.time}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      
      <main className="flex-grow">
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 md:space-y-8">
                <TechnologicalHeroTitle />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="pt-8 flex justify-center lg:justify-start"
                >
                  <Link href="/booking">
                    <Button size="lg" className="group rounded-full h-20 px-12 text-2xl font-black shadow-2xl bg-primary hover:bg-secondary transition-all hover:scale-105">
                      Reserva tu cita <ChevronRight className="ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <div className="hidden lg:block relative"><TechScannerAnimation /></div>
            </div>
          </div>
        </section>

        <SIBOEducationSection />

        <section className="py-24 bg-muted/20 border-y">
           <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-6 lg:order-1">
                <Badge className="bg-secondary text-primary font-black px-4 py-1 border-none uppercase tracking-widest">Máxima Flexibilidad</Badge>
                <h2 className="text-3xl md:text-5xl font-black text-primary italic leading-tight">También en tu <br/><span className="text-secondary">Domicilio o Trabajo</span></h2>
                <p className="text-lg text-muted-foreground font-medium">Lleva la misma precisión clínica a donde estés. Nuestro asistente digital te guiará paso a paso, incluyendo el enjuague bucal previo para asegurar una muestra pura.</p>
                <div className="flex flex-wrap gap-4 pt-6">
                  <Link href="/home-test"><Button className="rounded-full h-14 px-8 font-black text-lg bg-primary shadow-xl">Probar Asistente Digital</Button></Link>
                </div>
             </div>
             <div className="lg:order-2">
               <InteractiveAssistantSim />
             </div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="text-muted-foreground text-sm leading-relaxed mt-6">Laboratorio especializado en Salud Digestiva. Partner tecnológico Sunvou® en Chile.</p>
        </div>
      </footer>
    </div>
  );
}
