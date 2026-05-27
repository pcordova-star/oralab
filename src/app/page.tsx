
"use client";

import { Navbar } from "@/components/navbar";
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
  FileText
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
  { time: 60, h2: 28, ch4: 5, h2s: 1.3, co2: 'OK', symptoms: 'Gases' },
  { time: 90, h2: 45, ch4: 6, h2s: 1.5, co2: 'OK', symptoms: 'Cólicos' },
  { time: 120, h2: 38, ch4: 5, h2s: 1.4, co2: 'OK', symptoms: 'Leve' },
  { time: 150, h2: 25, ch4: 4, h2s: 1.2, co2: 'OK', symptoms: 'Final' },
  { time: 180, h2: 15, ch4: 3, h2s: 1.0, co2: 'OK', symptoms: 'Ninguno' },
];

const ClinicalReportVisualizer = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full glass-panel rounded-[2.5rem] p-4 md:p-8 shadow-2xl border-primary/10 overflow-hidden bg-white/70"
    >
      <div className="flex flex-col gap-6">
        {/* Encabezado del Informe */}
        <div className="flex justify-between items-start border-b border-primary/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20 font-black">SUNVOU® CERTIFIED</Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">ID: ORL-2024-0526</span>
            </div>
            <h3 className="text-xl font-black text-primary italic">Resumen Técnico de Biomarcadores</h3>
          </div>
          <div className="text-right">
            <Badge className="bg-red-500 text-white border-none animate-pulse">POSITIVO SIBO (H₂)</Badge>
          </div>
        </div>

        {/* Gráfico Multigas */}
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Tiempo (min)', position: 'insideBottom', offset: -5, fontSize: 10 }} 
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                label={{ value: 'ppm', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <ReferenceArea x1={0} x2={90} y1={0} y2={60} fill="#f8fafc" fillOpacity={0.5} label={{ position: 'top', value: 'Ventana SIBO', fontSize: 10, fill: '#94a3b8' }} />
              <Line name="Hidrógeno (H₂)" type="monotone" dataKey="h2" stroke="#1c68b6" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line name="Metano (CH₄)" type="monotone" dataKey="ch4" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
              <Line name="Sulfuro (H₂S)" type="monotone" dataKey="h2s" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de Biomarcadores */}
        <div className="overflow-hidden rounded-xl border border-primary/5">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="h-8 text-[10px] font-bold">Tiempo</TableHead>
                <TableHead className="h-8 text-[10px] font-bold">H₂ (ppm)</TableHead>
                <TableHead className="h-8 text-[10px] font-bold">CH₄ (ppm)</TableHead>
                <TableHead className="h-8 text-[10px] font-bold">H₂S (ppm)</TableHead>
                <TableHead className="h-8 text-[10px] font-bold">CO₂</TableHead>
                <TableHead className="h-8 text-[10px] font-bold">Síntomas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.slice(0, 5).map((row, i) => (
                <TableRow key={i} className="hover:bg-primary/5">
                  <TableCell className="py-2 text-[10px] font-bold">{row.time} min</TableCell>
                  <TableCell className={cn("py-2 text-[10px] font-black", row.h2 > 20 ? "text-red-600" : "text-primary")}>{row.h2}</TableCell>
                  <TableCell className="py-2 text-[10px] font-medium">{row.ch4}</TableCell>
                  <TableCell className="py-2 text-[10px] font-medium text-amber-600">{row.h2s}</TableCell>
                  <TableCell className="py-2 text-[10px] text-green-600 font-bold">{row.co2}</TableCell>
                  <TableCell className="py-2 text-[10px] italic text-muted-foreground">{row.symptoms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Técnico */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Ventaja Tecnológica
            </p>
            <p className="text-[9px] font-medium leading-tight text-muted-foreground">
              Medición de <span className="font-bold text-amber-600">Sulfuro (H₂S)</span> para detectar SIBO de gases sulfurosos.
            </p>
          </div>
          <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10">
            <p className="text-[10px] font-black text-secondary uppercase mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Soporte Clínico
            </p>
            <p className="text-[9px] font-medium leading-tight text-muted-foreground">
              Alineado con el Consenso Norteamericano de Aire Espirado.
            </p>
          </div>
        </div>
      </div>
      
      {/* Elementos decorativos de escaneo */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none"
      />
    </motion.div>
  );
};

const TechScannerAnimation = () => {
  return (
    <div className="relative w-full aspect-square max-w-[450px] flex items-center justify-center">
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
      <div className="relative z-10 bg-white/5 backdrop-blur-xl p-8 rounded-full border border-white/20 shadow-2xl">
        <Wind className="h-16 w-16 text-secondary animate-pulse" />
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
          className={`absolute font-black text-xl ${gas.color} pointer-events-none`}
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
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          </div>

          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="space-y-8"
              >
                <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 backdrop-blur-sm">
                    <Stethoscope className="h-4 w-4" /> Laboratorio Especializado
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold border border-secondary/20 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" /> Tecnología Sunvou®
                  </span>
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black text-primary leading-[1.1]">
                  Respuestas precisas para tu salud <span className="text-gradient italic">digestiva</span>.
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Realizamos tests de aire espirado con rigor técnico. Un procedimiento no invasivo diseñado para asistir en el diagnóstico de su médico especialista.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-6">
                  <Link href="/booking">
                    <Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group">
                      Agendar mi Examen <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="outline" size="lg" className="rounded-full h-16 px-8 text-lg font-bold border-2 hover:bg-secondary/5">
                      Protocolo Clínico
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={fadeIn} className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <UserRoundCheck className="h-6 w-6 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Oralab proporciona el soporte tecnológico para el examen solicitado por su <span className="text-primary font-bold">médico tratante</span>.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <ClinicalReportVisualizer />
                
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-4 glass-panel p-4 rounded-2xl z-20 hidden md:block bg-white/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Registro</p>
                      <p className="text-sm font-black text-primary">Multigas</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Symptoms Section */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-primary italic">Indicadores Clínicos</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
              <p className="text-xl text-muted-foreground">El test de aire espirado es una herramienta técnica fundamental para que su médico identifique el origen de síntomas recurrentes.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: "Meteorismo (Gases)", icon: <Zap />, color: "bg-blue-50 text-blue-600" },
                { name: "Hinchazón Abdominal", icon: <Activity />, color: "bg-emerald-50 text-emerald-600" },
                { name: "Alteración del Tránsito", icon: <AlertCircle />, color: "bg-amber-50 text-amber-600" },
                { name: "Malestar Digestivo", icon: <Search />, color: "bg-purple-50 text-purple-600" },
                { name: "Digestión Difícil", icon: <Beaker />, color: "bg-pink-50 text-pink-600" },
                { name: "Pesadez Postprandial", icon: <ShieldCheck />, color: "bg-indigo-50 text-indigo-600" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center p-8 rounded-[2rem] bg-white border border-border shadow-sm hover:shadow-xl transition-all group cursor-default"
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors text-center">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Science Section */}
        <section className="py-40 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-6xl font-black mb-8 leading-tight italic"
                >
                  Rigor técnico al servicio de la <span className="text-secondary">gastroenterología</span>
                </motion.h2>
                <p className="text-xl opacity-80 mb-12 leading-relaxed">
                  Nuestra metodología Sunvou® permite cuantificar Hidrógeno, Metano y Sulfuro de Hidrógeno de forma simultánea. Este análisis multigas proporciona información detallada sobre la actividad metabólica intraluminal para el diagnóstico diferencial solicitado por su especialista.
                </p>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Microscope className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Informe Especializado</h4>
                      <p className="text-sm opacity-60">Resultados cuantificables diseñados para la interpretación de su gastroenterólogo.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Award className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Precisión Sunvou®</h4>
                      <p className="text-sm opacity-60">Tecnología alineada con los estándares internacionales de medición multigas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative flex justify-center"
              >
                <div className="w-full max-w-md bg-secondary/10 rounded-[3rem] p-12 overflow-hidden border border-white/10 relative group">
                  <TechScannerAnimation />
                  <div className="absolute bottom-6 left-6 right-6 text-center z-30">
                    <p className="text-xs font-black uppercase tracking-widest text-secondary mb-1">Análisis Multigas Simultáneo</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">H₂ · CH₄ · H₂S</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-32 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">Proceso de Atención</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Un flujo profesional diseñado para garantizar la validez técnica de sus resultados.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  title: "1. Reserva", 
                  desc: "Seleccione el examen indicado en su orden médica y el horario de su preferencia.", 
                  icon: <CalendarDays className="h-10 w-10" />,
                  link: "/booking"
                },
                { 
                  title: "2. Procedimiento", 
                  desc: "Recolección de muestras de aire bajo estrictos protocolos clínicos de seguridad.", 
                  icon: <Activity className="h-10 w-10" />,
                  link: "/how-it-works"
                },
                { 
                  title: "3. Entrega de Informe", 
                  desc: "Resultados técnicos disponibles para que su especialista defina los pasos a seguir.", 
                  icon: <ClipboardCheck className="h-10 w-10" />
                },
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative glass-panel p-10 rounded-[2.5rem] flex flex-col items-center text-center group h-full bg-white/50"
                >
                  <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 font-medium">{step.desc}</p>
                  {step.link && (
                    <Link href={step.link} className="mt-auto">
                      <Button variant="link" className="text-secondary font-bold hover:gap-2 transition-all">
                        Ver protocolo clínico <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <span className="absolute -top-6 -left-6 text-8xl font-black text-primary/5 select-none">{idx + 1}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="rounded-[3rem] p-12 md:p-24 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-7xl font-black text-white leading-tight">
                Comprometidos con el soporte al diagnóstico médico.
              </h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
                Agende su procedimiento con orden médica y cuente con el respaldo tecnológico que su especialista requiere.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-8">
                <Link href="/booking">
                  <Button size="lg" className="rounded-full h-20 px-12 text-2xl font-black shadow-2xl bg-white text-primary hover:bg-secondary hover:text-white transition-all hover:scale-105 active:scale-95">
                    Reservar Cita
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full h-20 px-10 text-xl font-bold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md">
                    <MessageCircle className="h-6 w-6 mr-3" /> Consultas Técnicas
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 lg:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter italic">Oralab</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Laboratorio clínico especializado en Salud Digestiva. Partner tecnológico Sunvou® para el apoyo al diagnóstico gastroenterológico en Chile.
              </p>
            </div>
            <div>
              <h5 className="font-black text-primary mb-8 text-xl">Sede Las Condes</h5>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="group space-y-4 block">
                <div className="flex items-start gap-3 text-muted-foreground group-hover:text-primary transition-colors text-lg">
                  <MapPin className="h-6 w-6 text-secondary shrink-0 mt-1" />
                  <span>Apoquindo 3992, Of. 605, Las Condes. <br /> Centro Médico Alcántara.</span>
                </div>
              </a>
            </div>
            <div>
              <h5 className="font-black text-primary mb-8 text-xl">Gestión Clínica</h5>
              <ul className="space-y-4 text-lg">
                <li><Link href="/booking" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Reservar Examen</Link></li>
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Protocolo Técnico</Link></li>
                <li><Link href="/login" className="text-muted-foreground/30 hover:text-primary transition-colors inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Acceso Personal</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground text-sm font-medium">
            <p>© 2024 Oralab Clinical Lab. Diagnóstico especializado Sunvou®.</p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Certificación IVD</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Tecnología Sunvou®</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
