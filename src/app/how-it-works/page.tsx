
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { 
  Wind, 
  Clock, 
  Coffee, 
  ChevronRight, 
  ArrowLeft,
  Beaker,
  Stethoscope,
  MapPin,
  Package,
  MessageCircle,
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
      title: "1. Preparación previa",
      description: "El éxito del test comienza en casa. Deberás seguir una dieta sencilla el día anterior (dieta blanda) y un ayuno de 12 horas para que tu sistema digestivo esté en reposo absoluto al momento del examen.",
      icon: <Coffee className="h-8 w-8 text-secondary" />,
    },
    {
      title: "2. Primera medición",
      description: "Al llegar, realizaremos una primera toma de aliento (basal). Esto nos sirve para conocer el estado de tu organismo antes de comenzar el estudio propiamente tal.",
      icon: <Wind className="h-8 w-8 text-secondary" />,
    },
    {
      title: "3. Toma del sustrato",
      description: "Beberás una solución líquida específica (Lactosa, Fructosa o Lactulosa, según lo indicado por tu médico). Es una bebida dulce que las bacterias de tu intestino procesarán durante el test.",
      icon: <Beaker className="h-8 w-8 text-secondary" />,
    },
    {
      title: "4. Seguimiento del proceso",
      description: "Durante las siguientes 2 a 3 horas, tomaremos muestras de tu aliento en intervalos regulares. Es un proceso tranquilo y sin dolor donde solo deberás soplar suavemente en un equipo especializado.",
      icon: <Clock className="h-8 w-8 text-secondary" />,
    },
    {
      title: "5. Informe para tu médico",
      description: "Generamos un reporte detallado con gráficos que muestran cómo reaccionó tu cuerpo. Este documento es el 'mapa' que tu médico usará para darte el tratamiento exacto que necesitas.",
      icon: <ClipboardCheck className="h-8 w-8 text-secondary" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
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
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Entiende tu <br /><span className="text-secondary">Procedimiento</span></h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed font-medium">
                Realizarse un test de aire espirado es un proceso sencillo y no invasivo. Aquí te explicamos paso a paso cómo lo haremos juntos.
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
                <h3 className="text-2xl font-black text-primary mb-3">Opción de Test en Casa</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Si no puedes venir a la clínica, puedes retirar un kit con todos los insumos y las instrucciones detalladas para recolectar tus muestras cómodamente en tu hogar y luego traerlas para su análisis.
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
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Paso a paso del examen</h2>
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

        {/* Simple Science Section */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="glass-panel !bg-primary rounded-[3rem] p-8 md:p-16 shadow-2xl border-none relative">
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">¿Por qué soplamos?</h2>
                  <p className="text-lg opacity-80 mb-8 leading-relaxed font-medium">
                    Cuando las bacterias de tu intestino fermentan ciertos alimentos, producen gases que pasan a tu sangre y finalmente salen por tus pulmones. Al medir tu aliento, podemos "leer" lo que está pasando en tu sistema digestivo sin necesidad de procedimientos invasivos.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                      <div className="bg-secondary/20 p-2 rounded-lg mt-1">
                        <UserRound className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="font-bold text-white/90 italic">Es la forma más amable y precisa de detectar intolerancias o sobrecrecimiento bacteriano (SIBO).</p>
                    </div>
                    <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                      <div className="bg-secondary/20 p-2 rounded-lg mt-1">
                        <Stethoscope className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="font-bold text-white/90 italic">Usamos tecnología de punta certificada para asegurar resultados confiables para tu médico.</p>
                    </div>
                  </div>
                </div>
                <div className="relative flex justify-center">
                  <div className="aspect-square w-64 md:w-80 bg-secondary/10 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/30">
                    <Microscope className="h-32 w-32 text-secondary" />
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 hidden md:block">
                    <div className="text-center">
                      <p className="text-4xl font-black text-secondary">Sunvou®</p>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">Tecnología de Punta</p>
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
              <h2 className="text-3xl md:text-6xl font-black text-primary mb-6">Estamos para acompañarte</h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
                Si tienes dudas sobre la preparación o el día del examen, nuestro equipo técnico está disponible para resolver todas tus inquietudes.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/booking">
                  <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-primary hover:bg-secondary hover:text-white transition-all shadow-xl hover:scale-105">
                    Agendar mi Test
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-xl font-bold border-2 border-primary text-primary hover:bg-primary/5">
                    <MessageCircle className="h-6 w-6 mr-3" />
                    Consultar por WhatsApp
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
            <p className="text-primary-foreground/50 text-xs font-medium">© 2024 Oralab Clinical Lab. Tecnología especializada Sunvou®.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
