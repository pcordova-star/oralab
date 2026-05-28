
"use client";

import { Navbar, Logo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
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
  HelpCircle
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
  { time: 150, h2: 25, ch4: 4, h2s: 1.2, co2: 'OK', symptoms: 'Final' },
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

export default function HomePage() {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Apoquindo+3992+oficina+605+Las+Condes+Santiago+Chile";
  const whatsappUrl = "https://wa.me/56936850468";

  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden font-body">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
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
                    <Stethoscope className="h-3.5 w-3.5 md:h-4 md:w-4" /> Laboratorio Especializado
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary/10 text-secondary text-xs md:text-sm font-bold border border-secondary/20 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" /> Tecnología Sunvou®
                  </span>
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-3xl md:text-5xl lg:text-7xl font-black text-primary leading-[1.1]">
                  Soporte tecnológico <br />para tu salud <span className="text-gradient italic">digestiva</span>.
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Especialistas en tests de aire espirado para <strong>SIBO, IMO, HIMO e Intolerancias</strong>. Un procedimiento clínico de alta precisión diseñado para asistir en el diagnóstico de tu especialista.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6">
                  <Link href="/booking" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group">
                      Reservar Cita <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-16 px-8 text-base md:text-lg font-bold border-2 hover:bg-secondary/5">
                      Protocolo Clínico
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
                   <div className="aspect-video bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white/40 flex items-center justify-center overflow-hidden shadow-2xl">
                      <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12 scale-150">
                        <Logo />
                      </div>
                      <div className="relative text-center space-y-4">
                        <div className="bg-primary/10 p-8 rounded-full inline-block mb-4">
                           <Wind className="h-16 w-16 text-primary animate-pulse" />
                        </div>
                        <h4 className="text-2xl font-black text-primary">Diagnóstico de Precisión</h4>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Protocolos Sunvou®</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Clinical Statistics Section */}
        <section className="py-12 md:py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20 space-y-4">
              <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold">EDUCACIÓN AL PACIENTE</Badge>
              <h2 className="text-2xl md:text-5xl font-black text-primary italic leading-tight">¿Por qué mi especialista me solicitó este test?</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
              <p className="text-base md:text-xl text-muted-foreground font-medium">
                Entender lo que sucede en tu interior es el primer paso para recuperar tu bienestar.
              </p>
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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 md:mt-16 max-w-4xl mx-auto bg-primary/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-6 md:gap-8"
            >
              <div className="bg-white p-4 rounded-full shrink-0 shadow-md">
                <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-primary mb-2">¿Es tu primera vez con este test?</h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Es un procedimiento <strong>no invasivo</strong>. Solo necesitas soplar en un equipo especializado después de ingerir una solución dulce. A través de tu aliento, podemos "leer" lo que las bacterias están haciendo en tu intestino.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Science Section */}
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
                  Nuestra metodología Sunvou® permite cuantificar Hidrógeno, Metano y Sulfuro de Hidrógeno de forma simultánea. Este análisis multigas proporciona información detallada para el diagnóstico diferencial.
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

        {/* Technical Report Section */}
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
                  
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      { t: "Detección de Sulfuro de Hidrógeno (H₂S)", d: "Identifica SIBO sulfuroso." },
                      { t: "Control de CO₂ Alveolar", d: "Asegura muestra de aire válida." },
                      { t: "Curva Multivariante", d: "Gases correlacionados con síntomas." }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white border border-border">
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-secondary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm md:text-base text-primary">{item.t}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">{item.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="relative mt-8 lg:mt-0 w-full max-w-full">
                  <ClinicalReportVisualizer />
                  <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 glass-panel p-3 md:p-6 rounded-2xl md:rounded-3xl z-20 bg-white border-primary/10 shadow-xl hidden sm:block">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-secondary/10 p-2 md:p-3 rounded-xl md:rounded-2xl text-secondary">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estatístico</p>
                        <p className="text-xs md:text-sm font-black text-primary">Interpretación Sunvou®</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-32 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-16 lg:p-24 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 text-center space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-5xl lg:text-7xl font-black text-white leading-tight">
                Comprometidos con el soporte al diagnóstico médico.
              </h2>
              <p className="text-base md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
                Agende su procedimiento con orden médica y cuente con el respaldo tecnológico necesario.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-4 md:pt-8">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-14 md:h-20 px-10 md:px-12 text-lg md:text-2xl font-black shadow-2xl bg-white text-primary hover:bg-secondary hover:text-white transition-all hover:scale-105 active:scale-95">
                    Reservar Cita
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
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-10 md:mb-16">
            <div className="col-span-1 lg:col-span-2 space-y-6 md:space-y-8 text-center md:text-left">
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
          <div className="pt-8 md:pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-muted-foreground text-[10px] md:text-xs font-medium text-center md:text-left">
            <p>© 2024 Oralab Clinical Lab. Diagnóstico especializado Sunvou®.</p>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" /> Certificación IVD</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" /> Tecnología Sunvou®</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
