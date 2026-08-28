
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
  Lock
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
            Aire <span className="text-secondary relative">
              Espirado
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
            SIBO e <span className="text-primary font-black uppercase tracking-widest relative group cursor-default">
              Intolerancias
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
            <h3 className="text-base md:text-xl font-black text-primary italic">Análisis de Biomarcadores Metabólicos</h3>
          </div>
          <div className="text-left sm:text-right">
            <Badge className="bg-blue-500 text-white border-none text-[10px] md:text-xs">PRECISIÓN DE LABORATORIO</Badge>
          </div>
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

        <div className="overflow-x-auto rounded-xl border border-primary/5 -mx-4 md:mx-0">
          <Table className="min-w-[400px] md:min-w-full">
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">Tiempo</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">H₂ (ppm)</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">CH₄ (ppm)</TableHead>
                <TableHead className="h-8 text-[9px] md:text-[10px] font-bold">Síntomas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.slice(0, 5).map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2 text-[9px] md:text-[10px] font-bold">{row.time} min</TableCell>
                  <TableCell className={cn("py-2 text-[9px] md:text-[10px] font-black", row.h2 > 20 ? "text-red-600" : "text-primary")}>{row.h2}</TableCell>
                  <TableCell className="py-2 text-[9px] md:text-[10px] font-medium">{row.ch4}</TableCell>
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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      
      <main className="flex-grow">
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-32">
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
              <div className="hidden lg:flex justify-center relative">
                 <div className="w-full max-w-[400px] aspect-square bg-secondary/10 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/30 animate-pulse">
                    <Microscope className="h-32 w-32 text-secondary" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-white">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-6xl font-black italic mb-8">Tecnología Sunvou® Certificada</h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto font-medium">Somos partners de Sunvou en Chile, trayendo la mayor precisión global para el diagnóstico de SIBO e Intolerancias.</p>
           </div>
        </section>

        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Resultados de Grado Clínico</h2>
                <div className="h-1 w-20 bg-secondary mx-auto rounded-full" />
             </div>
             <ClinicalReportVisualizer />
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left space-y-4">
              <Logo />
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">Laboratorio especializado en Salud Digestiva Avanzada. Partner tecnológico Sunvou® en Chile.</p>
            </div>
            <div className="grid grid-cols-2 gap-12 text-sm">
               <div className="space-y-4">
                  <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">Atención</h4>
                  <ul className="space-y-2 font-bold text-muted-foreground">
                    <li><Link href="/booking" className="hover:text-primary">Reservas</Link></li>
                    <li><Link href="/home-test" className="hover:text-primary">Test en Casa</Link></li>
                    <li><Link href="/agreements" className="hover:text-primary">Convenios</Link></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">Corporativo</h4>
                  <ul className="space-y-2 font-bold text-muted-foreground">
                    <li><Link href="/investors" className="hover:text-primary">Inversores</Link></li>
                    <li><Link href="/sunvou" className="hover:text-primary">Tecnología</Link></li>
                    <li><Link href="/login" className="hover:text-primary flex items-center gap-1"><Lock className="h-3 w-3" /> Acceso Personal</Link></li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
