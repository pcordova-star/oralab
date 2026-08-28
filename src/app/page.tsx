
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
  ChevronDown
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
  const whatsappUrl = "https://wa.me/56936850468";

  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-10 pb-16 md:pt-20 md:pb-20 lg:pt-32 lg:pb-40">
          <div className="container mx-auto px-4 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 md:space-y-8">
                <TechnologicalHeroTitle />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="pt-8 flex flex-wrap justify-center lg:justify-start gap-4"
                >
                  <Link href="/booking">
                    <Button size="lg" className="group rounded-full h-20 px-12 text-2xl font-black shadow-2xl bg-primary hover:bg-secondary transition-all hover:scale-105">
                      Reserva tu cita <ChevronRight className="ml-2 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="outline" size="lg" className="rounded-full h-20 px-8 text-xl font-bold border-2 border-primary text-primary">
                      ¿Cómo funciona?
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <div className="hidden lg:flex justify-center relative">
                 <div className="w-full max-w-[400px] aspect-square bg-secondary/10 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/30 animate-pulse">
                    <Microscope className="h-32 w-32 text-secondary" />
                 </div>
                 <div className="absolute -bottom-10 -right-10 glass-panel p-6 rounded-3xl border-primary/10 animate-float">
                    <p className="text-4xl font-black text-primary">Sunvou®</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tecnología de Punta</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
             <div className="text-center mb-20 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Nuestros Estudios Clínicos</h2>
                <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
                <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Evaluaciones no invasivas de alta precisión para identificar el origen de tu malestar digestivo.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {EXAMS.map((exam, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-muted/30 border border-primary/5 hover:border-secondary/50 transition-all group"
                  >
                    <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-sm group-hover:scale-110 transition-transform">
                      {exam.icon}
                    </div>
                    <h3 className="text-xl font-black text-primary mb-3 italic">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-4">{exam.desc}</p>
                    <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[10px]">Protocolo: {exam.duration}</Badge>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* HOME KIT SECTION */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
             <div className="glass-panel !bg-primary rounded-[3rem] p-8 md:p-20 shadow-2xl border-none relative text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                      <Home className="h-4 w-4 text-secondary" />
                      <span className="text-xs font-black uppercase tracking-widest text-secondary">Modalidad Home-Kit</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic leading-tight">Tu test, <br /> en la comodidad <br /> de tu hogar.</h2>
                    <p className="text-lg opacity-80 leading-relaxed font-medium">Retira tu kit, sigue el protocolo con nuestro **Asistente Virtual** y entrega tus muestras para análisis profesional. Mismas garantías, mayor comodidad.</p>
                    <ul className="space-y-4">
                      {[
                        "Asistente con Alarma Sonora Inteligente",
                        "Instrucciones Paso a Paso",
                        "Retiro por Motoboy disponible",
                        "Resultados en 24-48 horas"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 font-bold">
                          <CheckCircle2 className="h-5 w-5 text-secondary" /> {item}
                        </li>
                      ))}
                    </ul>
                    <Link href="/home-test" className="block">
                      <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-secondary hover:bg-white hover:text-primary transition-all shadow-xl">
                        Ver Mi Asistente
                      </Button>
                    </Link>
                  </div>
                  <div className="relative hidden lg:block">
                     <div className="aspect-[4/3] bg-white/5 rounded-[2.5rem] border border-white/10 p-4 flex items-center justify-center">
                        <Activity className="h-48 w-48 text-secondary opacity-50" />
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* PROCESS STEPS */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">¿Cómo es el proceso?</h2>
                <div className="h-1 w-20 bg-secondary mx-auto rounded-full" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                 {[
                   { step: "01", title: "Agenda Online", desc: "Elige tu fecha y modalidad (consulta o casa).", icon: <Clock className="h-8 w-8" /> },
                   { step: "02", title: "Realiza el Test", desc: "Sigue el protocolo de soplido cada 30 minutos.", icon: <Wind className="h-8 w-8" /> },
                   { step: "03", title: "Recibe el Informe", desc: "Tu médico recibe los gráficos Sunvou® detallados.", icon: <ClipboardCheck className="h-8 w-8" /> },
                 ].map((p, i) => (
                   <div key={i} className="text-center space-y-4 group">
                      <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        {p.icon}
                      </div>
                      <span className="text-5xl font-black text-muted/30 italic">{p.step}</span>
                      <h4 className="text-xl font-black text-primary italic">{p.title}</h4>
                      <p className="text-muted-foreground font-medium text-sm">{p.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CHART SECTION */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Resultados de Grado Clínico</h2>
                <div className="h-1 w-20 bg-secondary mx-auto rounded-full" />
                <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Nuestros reportes utilizan tecnología Sunvou® para mapear con precisión tu salud digestiva.</p>
             </div>
             <ClinicalReportVisualizer />
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
             <div className="text-center mb-12 space-y-4">
                <h2 className="text-2xl md:text-4xl font-black text-primary italic">Preguntas Frecuentes</h2>
                <div className="h-1 w-16 bg-secondary mx-auto rounded-full" />
             </div>
             
             <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border border-primary/5 bg-muted/20 rounded-2xl px-6">
                  <AccordionTrigger className="font-black text-primary hover:no-underline italic">¿Necesito orden médica?</AccordionTrigger>
                  <AccordionContent className="font-medium text-muted-foreground leading-relaxed">
                    Sí, para asegurar un diagnóstico correcto y el tratamiento posterior adecuado, solicitamos una orden médica. Si no tienes una clara, nuestra IA en la página de reservas puede ayudarte a sugerir el examen basado en tu foto de la orden.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border border-primary/5 bg-muted/20 rounded-2xl px-6">
                  <AccordionTrigger className="font-black text-primary hover:no-underline italic">¿Qué preparación debo seguir?</AccordionTrigger>
                  <AccordionContent className="font-medium text-muted-foreground leading-relaxed">
                    Fundamentalmente 12 horas de ayuno estricto y una dieta blanda (sin fibra, legumbres ni lácteos) el día anterior. Además, no haber tomado antibióticos ni probióticos en las últimas 4 semanas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border border-primary/5 bg-muted/20 rounded-2xl px-6">
                  <AccordionTrigger className="font-black text-primary hover:no-underline italic">¿Es doloroso el examen?</AccordionTrigger>
                  <AccordionContent className="font-medium text-muted-foreground leading-relaxed">
                    En absoluto. Es una prueba totalmente no invasiva que solo consiste en soplar suavemente a través de una boquilla o recolectar aire en bolsas especializadas.
                  </AccordionContent>
                </AccordionItem>
             </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <Stethoscope className="h-16 w-16 text-secondary mx-auto mb-4 animate-float" />
                <h2 className="text-4xl md:text-6xl font-black italic">Recupera tu Bienestar</h2>
                <p className="text-xl opacity-80 font-medium italic">Un diagnóstico preciso es el primer paso para terminar con la hinchazón y el malestar crónico.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/booking">
                    <Button size="lg" className="rounded-full h-20 px-12 text-2xl font-black bg-secondary hover:bg-white hover:text-primary transition-all shadow-2xl">
                       Agendar Ahora
                    </Button>
                  </Link>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="rounded-full h-20 px-12 text-xl font-bold border-2 border-white text-white hover:bg-white/10">
                       <MessageCircle className="mr-2 h-6 w-6" /> WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left space-y-4">
              <Logo />
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">Laboratorio especializado en Salud Digestiva Avanzada. Partner tecnológico Sunvou® en Chile.</p>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                 <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-secondary" /> Apoquindo 3990, Of. 605</div>
              </div>
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
          <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
             <p>© 2024 Oralab Clinical Lab. Todos los derechos reservados.</p>
             <div className="flex gap-6">
                <Link href="/terms" className="hover:text-primary">Términos</Link>
                <Link href="/privacy" className="hover:text-primary">Privacidad</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
