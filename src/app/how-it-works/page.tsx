
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wind, 
  Clock, 
  Coffee, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Info,
  Beaker,
  Stethoscope,
  MapPin,
  Package,
  Home,
  MessageCircle,
  Lock,
  ClipboardCheck,
  UserRound,
  Microscope
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  const whatsappUrl = "https://wa.me/56936850468";

  const steps = [
    {
      title: "1. Preparación y Dieta",
      description: "Siguiendo las indicaciones de su médico y nuestro protocolo clínico, deberá realizar una dieta blanda 24 horas antes y un ayuno de 12 horas para asegurar una línea base de gases estable.",
      icon: <Coffee className="h-8 w-8 text-secondary" />,
    },
    {
      title: "2. Medición Basal",
      description: "Al iniciar el procedimiento, se recolecta una muestra basal de aliento para cuantificar la producción endógena de gases antes de cualquier estímulo.",
      icon: <Wind className="h-8 w-8 text-secondary" />,
    },
    {
      title: "3. Administración del Sustrato",
      description: "Se administra el sustrato específico (Lactulosa, Fructosa o Lactosa) indicado en su orden médica, el cual será fermentado por la microbiota en caso de malabsorción o sobrecrecimiento.",
      icon: <Beaker className="h-8 w-8 text-secondary" />,
    },
    {
      title: "4. Registro de Curva",
      description: "Se realizan mediciones seriadas cada 15 a 30 minutos para trazar la curva de producción de Hidrógeno, Metano y Sulfuro, permitiendo identificar el lugar y tipo de fermentación.",
      icon: <Clock className="h-8 w-8 text-secondary" />,
    },
    {
      title: "5. Informe para Especialista",
      description: "Generamos un reporte clínico con gráficas de evolución de gases. Este documento es la herramienta que su gastroenterólogo utilizará para diagnosticar SIBO, IMO o intolerancias.",
      icon: <ClipboardCheck className="h-8 w-8 text-secondary" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-primary text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="inline-flex items-center text-secondary hover:text-secondary/80 mb-8 font-bold transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
              </Link>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Protocolo Clínico de <br /><span className="text-secondary">Aire Espirado</span></h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed font-medium">
                Un procedimiento estandarizado internacionalmente bajo el Consenso Norteamericano de Aire Espirado para asistir a su especialista en el diagnóstico preciso.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Home Kit Section */}
        <section className="py-16 -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto glass-panel !bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-primary/10 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="bg-secondary/10 p-6 rounded-3xl shrink-0">
                <Package className="h-12 w-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary mb-3">Modalidad Ambulatoria (Kit en Casa)</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Bajo estricta supervisión de protocolo, el paciente puede retirar el material de recolección en nuestra sede para realizar el test en su entorno, asegurando que las muestras lleguen a nuestro laboratorio para el análisis multigas profesional.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Fases del Procedimiento Clínico</h2>
                <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
              </div>
              
              <div className="space-y-16">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col md:flex-row gap-8 items-start relative group"
                  >
                    {idx !== steps.length - 1 && (
                      <div className="hidden md:block absolute left-10 top-24 bottom-[-64px] w-0.5 bg-gradient-to-b from-secondary/50 to-transparent" />
                    )}
                    <div className="w-20 h-20 rounded-[2rem] bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-inner">
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-black text-primary mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed font-medium">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Fundamental Science Section */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="glass-panel !bg-primary rounded-[3rem] p-8 md:p-16 shadow-2xl border-none relative">
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Fundamento Clínico del Test</h2>
                  <p className="text-lg opacity-80 mb-8 leading-relaxed">
                    La malabsorción de carbohidratos o el sobrecrecimiento bacteriano (SIBO) provocan que las bacterias fermenten sustratos, liberando gases que se difunden al torrente sanguíneo y se eliminan por los pulmones. Medir estos gases es la forma más precisa y menos invasiva de "ver" la actividad metabólica de su intestino.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                      <div className="bg-secondary/20 p-2 rounded-lg mt-1">
                        <UserRound className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="font-bold text-white/90 italic">Validado internacionalmente para el diagnóstico diferencial de SIBO, IMO y Malabsorción.</p>
                    </div>
                    <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                      <div className="bg-secondary/20 p-2 rounded-lg mt-1">
                        <Stethoscope className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="font-bold text-white/90 italic">Tecnología recomendada por el American College of Gastroenterology.</p>
                    </div>
                  </div>
                </div>
                <div className="relative flex justify-center">
                  <div className="aspect-square w-64 md:w-80 bg-secondary/10 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/30 animate-pulse-subtle">
                    <Microscope className="h-32 w-32 text-secondary" />
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hidden md:block">
                    <div className="text-center">
                      <p className="text-4xl font-black text-secondary">100%</p>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Rigor Clínico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Stethoscope className="h-16 w-16 text-secondary mx-auto mb-8 animate-float" />
              <h2 className="text-3xl md:text-6xl font-black text-primary mb-6">Apoyamos el diagnóstico de su especialista</h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
                Si cuenta con una orden médica para un test de aire espirado, Oralab le brinda la tecnología multigas más avanzada de Chile para su realización.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/booking">
                  <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-primary hover:bg-secondary hover:text-white transition-all shadow-xl hover:scale-105">
                    Reservar Cita Médica
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-xl font-bold border-2 border-primary text-primary hover:bg-primary/5">
                    <MessageCircle className="h-6 w-6 mr-3" />
                    Consultas por WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
               <MapPin className="h-5 w-5 text-secondary" />
               <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Apoquindo 3992, Las Condes. Chile.</p>
            </div>
            <p className="text-primary-foreground/50 text-xs font-medium">© 2024 Oralab Clinical Lab. Diagnóstico especializado Sunvou®.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
