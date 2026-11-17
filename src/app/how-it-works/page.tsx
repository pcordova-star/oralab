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
  Microscope,
  Building2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  const whatsappUrl = "https://wa.me/56936850468";

  const steps = [
    {
      title: "1. Preparación previa",
      description: "El éxito del test comienza con el paciente. Deberá seguir una dieta blanda el día anterior y un ayuno de 12 horas para que su sistema digestivo esté en reposo absoluto.",
      icon: <Coffee className="h-8 w-8 text-secondary" />,
    },
    {
      title: "2. Recolección de muestras",
      description: "Utilizando nuestros kits de recolección, se toman muestras de aliento en intervalos regulares siguiendo el protocolo indicado para cada azúcar (Lactosa, Fructosa o Lactulosa).",
      icon: <Wind className="h-8 w-8 text-secondary" />,
    },
    {
      title: "3. Envío al Laboratorio",
      description: "Las muestras recolectadas son enviadas por el centro médico o el paciente directamente a nuestras oficinas centrales para su procesamiento técnico.",
      icon: <Package className="h-8 w-8 text-secondary" />,
    },
    {
      title: "4. Análisis Sunvou®",
      description: "Procesamos cada muestra en nuestro analizador DA7349, midiendo H2, CH4 y corrigiendo por CO2 para asegurar la validez de la exhalación.",
      icon: <Clock className="h-8 w-8 text-secondary" />,
    },
    {
      title: "5. Reporte al Especialista",
      description: "Generamos un reporte digital detallado con las curvas metabólicas, entregando una herramienta diagnóstica precisa para el médico tratante.",
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
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Logística y <br /><span className="text-secondary">Procesamiento</span></h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed font-medium">
                Oralab opera como un centro de procesamiento especializado. Recibimos muestras de todo Chile para entregar diagnósticos de alta precisión.
              </p>
            </motion.div>
          </div>
        </section>

        {/* B2B Info Section */}
        <section className="py-16 -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto glass-panel !bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-primary/10 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="bg-secondary/10 p-6 rounded-3xl shrink-0">
                <Building2 className="h-12 w-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary mb-3">Modelo de Servicio B2B</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  Nuestra red de convenios permite que centros médicos deriven las muestras a nuestro laboratorio central. Contamos con protocolos de transporte que aseguran la estabilidad de los gases para un análisis confiable.
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
                <h2 className="text-3xl md:text-5xl font-black text-primary italic">Flujo de Trabajo</h2>
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

        {/* CTA Section */}
        <section className="py-24 bg-white text-center border-t">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Stethoscope className="h-16 w-16 text-secondary mx-auto mb-8 animate-float" />
              <h2 className="text-3xl md:text-6xl font-black text-primary mb-6">Expertos a su servicio</h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
                Si su clínica requiere implementar este servicio o enviar muestras, nuestro equipo técnico está disponible para coordinar la logística.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/agreements">
                  <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-primary hover:bg-secondary hover:text-white transition-all shadow-xl hover:scale-105">
                    Solicitar Convenio
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-xl font-bold border-2 border-primary text-primary hover:bg-primary/5">
                    <MessageCircle className="h-6 w-6 mr-3" />
                    Consultar Soporte
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
               <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Apoquindo 3990, Las Condes. Chile.</p>
            </div>
            <p className="text-primary-foreground/50 text-xs font-medium">© 2024 Oralab Clinical Lab. Tecnología especializada Sunvou®.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}