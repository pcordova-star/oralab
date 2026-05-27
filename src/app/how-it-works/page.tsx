
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
  UserRound
} from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4">
            <Link href="/" className="inline-flex items-center text-secondary hover:text-secondary/80 mb-8 font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Protocolo Clínico de Aire Espirado</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
              Un procedimiento estandarizado internacionalmente para asistir a su especialista en el diagnóstico preciso de patologías digestivas funcionales.
            </p>
          </div>
        </section>

        {/* Home Kit Section */}
        <section className="py-16 bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-secondary/20 flex flex-col md:flex-row items-center gap-8">
              <div className="bg-secondary/10 p-6 rounded-full shrink-0">
                <Package className="h-12 w-12 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-3">Modalidad Ambulatoria (Kit en Casa)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bajo estricta supervisión de protocolo, el paciente puede retirar el material de recolección en nuestra sede para realizar el test en su entorno, asegurando que las muestras lleguen a nuestro laboratorio para el análisis multigas profesional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-12 text-center">Fases del Procedimiento Clínico</h2>
              <div className="space-y-12">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-8 items-start relative group">
                    {idx !== steps.length - 1 && (
                      <div className="hidden md:block absolute left-10 top-20 bottom-0 w-0.5 bg-secondary/20" />
                    )}
                    <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-bold text-primary mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why it works Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-background rounded-3xl p-8 md:p-16 shadow-sm border border-secondary/10 overflow-hidden relative">
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-6">Fundamento Clínico</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    La malabsorción de carbohidratos o el sobrecrecimiento bacteriano (SIBO) provocan que las bacterias fermenten sustratos, liberando gases que se difunden al torrente sanguíneo y se eliminan por los pulmones. Medir estos gases es la forma más precisa y menos invasiva de "ver" la actividad metabólica de su intestino.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary/10 p-2 rounded-lg mt-1">
                        <UserRound className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-primary/80 font-medium">Validado para el diagnóstico de SIBO, IMO y Malabsorción de Fructosa/Lactosa.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary/10 p-2 rounded-lg mt-1">
                        <Stethoscope className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-primary/80 font-medium">Tecnología recomendada en el Consenso Norteamericano de Aire Espirado.</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-secondary/5 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/20">
                    <Microscope className="h-32 w-32 text-secondary animate-pulse-subtle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white text-center">
          <div className="container mx-auto px-4">
            <Stethoscope className="h-16 w-16 text-secondary mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Apoyamos el diagnóstico de su especialista</h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Si cuenta con una orden médica para un test de aire espirado, Oralab le brinda la tecnología más avanzada de Chile para su realización.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/booking">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-secondary hover:text-white transition-all">
                  Reservar Cita Médica
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg font-bold border-white text-white hover:bg-white/10">
                  <MessageCircle className="h-6 w-6 mr-2" />
                  Consultas por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary/95 text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-secondary" />
            <p className="text-sm opacity-80">Apoquindo 3992, oficina 605, Las Condes. Centro Médico Alcántara.</p>
          </div>
          <p className="text-primary-foreground/50 text-xs">© 2024 Oralab Clinical Lab. Diagnóstico especializado.</p>
        </div>
      </footer>
    </div>
  );
}
