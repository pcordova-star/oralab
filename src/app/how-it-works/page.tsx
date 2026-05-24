
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
  Lock
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const whatsappUrl = "https://wa.me/56936850468";

  const steps = [
    {
      title: "1. Preparación previa",
      description: "Para obtener resultados precisos, deberás seguir una dieta sencilla el día anterior y mantener un ayuno de 12 horas. Esto asegura que tu sistema digestivo esté en reposo.",
      icon: <Coffee className="h-8 w-8 text-secondary" />,
    },
    {
      title: "2. Muestra basal",
      description: "Al iniciar el examen (en nuestra consulta o en tu casa con el kit), tomarás la primera muestra simplemente soplando en un dispositivo. Esto establece tu punto de partida.",
      icon: <Wind className="h-8 w-8 text-secondary" />,
    },
    {
      title: "3. Ingesta del sustrato",
      description: "Beberás una pequeña solución (Lactosa, Fructosa o Lactulosa según lo indicado por tu médico). Es una bebida segura y con sabor neutro.",
      icon: <Beaker className="h-8 w-8 text-secondary" />,
    },
    {
      title: "4. Mediciones periódicas",
      description: "Soplaremos nuevamente en intervalos regulares (cada 15 a 30 minutos). Si estás en nuestra sala, puedes leer o descansar durante las esperas.",
      icon: <Clock className="h-8 w-8 text-secondary" />,
    },
    {
      title: "5. Resultados",
      description: "Nuestro equipo analiza los gases (Hidrógeno, Metano y Sulfuro) al instante. Tu informe estará listo para que lo lleves a tu especialista.",
      icon: <CheckCircle2 className="h-8 w-8 text-secondary" />,
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">¿Cómo funciona el test de aire?</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
              Es un proceso sencillo, seguro y no invasivo que nos permite "escuchar" lo que ocurre en tu intestino a través de tu respiración.
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
                <h3 className="text-2xl font-bold text-primary mb-3">Opción de Test en Casa</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ¿Prefieres realizar el test a tu ritmo? Puedes retirar los elementos y el kit de toma de muestra en nuestra consulta de Las Condes, realizar el procedimiento en la comodidad de tu hogar y luego traernos de vuelta el material para que realicemos el análisis clínico especializado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-12 text-center">Tu camino durante el examen</h2>
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

        {/* Location Highlight */}
        <section className="py-12 bg-background border-y border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-secondary/20 max-w-2xl mx-auto">
              <div className="bg-secondary/10 p-3 rounded-full">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-primary">Nuestra ubicación única</h3>
                <p className="text-muted-foreground">Apoquindo 3992, oficina 605, Las Condes (Centro Médico Alcántara, a pasos del metro)</p>
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
                  <h2 className="text-3xl font-bold text-primary mb-6">La ciencia detrás de un soplido</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Cuando las bacterias en tu intestino fermentan los alimentos, producen gases específicos. Estos gases pasan a tu torrente sanguíneo y luego a tus pulmones, permitiéndonos medirlos con precisión molecular al exhalar.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary/10 p-2 rounded-lg mt-1">
                        <Info className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-primary/80 font-medium">Tecnología Sunvou detecta simultáneamente Hidrógeno, Metano y Sulfuro de Hidrógeno.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary/10 p-2 rounded-lg mt-1">
                        <Info className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-primary/80 font-medium">Precisión de nivel NASA para diagnósticos certeros de SIBO e IMO.</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-secondary/5 rounded-full flex items-center justify-center p-12 border-4 border-dashed border-secondary/20">
                    <Wind className="h-32 w-32 text-secondary animate-pulse-subtle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">Preguntas Frecuentes</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { q: "¿Es doloroso?", a: "Para nada. Solo requiere soplar suavemente a través de una boquilla desechable o bolsa colectora. Es tan simple como respirar." },
                { q: "¿Cuánto tiempo dura?", a: "Dependiendo del tipo de examen (Lactosa, Fructosa o Lactulosa), puede durar entre 90 minutos y 3 horas de recolección." },
                { q: "¿Tiene efectos secundarios?", a: "El sustrato es seguro. Algunas personas muy sensibles pueden notar una ligera hinchazón momentánea, similar a comer algo que les cae pesado." },
                { q: "¿Puedo hacerlo en mi casa?", a: "Sí, puedes retirar el kit en nuestra consulta y realizarlo en tu hogar siguiendo nuestro protocolo estricto." },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-background border border-border">
                  <h4 className="text-lg font-bold text-primary mb-2">{item.q}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white text-center">
          <div className="container mx-auto px-4">
            <Stethoscope className="h-16 w-16 text-secondary mx-auto mb-8" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para obtener respuestas?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Habla con tu gastroenterólogo y solicita el test de aire espirado. Estamos aquí para ayudarte a recuperar tu bienestar digestivo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] transition-all">
                  <MessageCircle className="h-6 w-6 mr-2" />
                  Contactar por WhatsApp
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg font-bold border-white text-white hover:bg-white/10">
                  Volver al inicio
                </Button>
              </Link>
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
          <div className="flex items-center justify-center gap-2">
            <p className="text-primary-foreground/50 text-xs">© 2024 Oralab Clinical Lab. Todos los derechos reservados.</p>
            <Link href="/login" className="opacity-10 hover:opacity-100 transition-opacity">
              <Lock className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
