"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Activity, 
  Wind, 
  ArrowRight, 
  Microscope, 
  ShieldCheck, 
  Zap,
  Beaker,
  AlertCircle,
  Globe,
  Award,
  Search,
  CheckCircle,
  Heart,
  Stethoscope,
  ClipboardCheck,
  CalendarDays,
  MapPin
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Patient-Centric Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-white to-blue-50/50">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold mb-6">
                <Heart className="h-4 w-4 fill-secondary" /> Tu bienestar digestivo es nuestra prioridad
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">
                ¿Vives con hinchazón o molestias y <span className="text-secondary">no sabes por qué?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Sabemos lo frustrante que es buscar respuestas sin éxito. En <strong>Oralab</strong>, utilizamos una tecnología tan simple como respirar para descubrir qué está pasando realmente en tu interior. 
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/how-it-works">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                    ¿Cómo funciona el test? <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-primary font-medium px-4">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <span className="text-sm">Las Condes, RM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
        </section>

        {/* Empathy Section: What is a Breath Test? */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-primary">Un test sencillo para respuestas profundas</h2>
                <p className="text-lg text-muted-foreground">
                  A veces, el origen de tus molestias no está en lo que comes, sino en cómo tu cuerpo procesa los alimentos. El <strong>Test de Aire Espirado</strong> es una técnica no invasiva que analiza los gases que producen las bacterias en tu intestino.
                </p>
                <div className="space-y-4">
                  {[
                    "Sin agujas ni procedimientos dolorosos.",
                    "Solo necesitas soplar en un dispositivo especial.",
                    "Resultados precisos para guiar tu tratamiento.",
                    "Realizado en un ambiente cómodo y profesional."
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-secondary shrink-0" />
                      <span className="font-medium text-primary/80">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-background p-8 rounded-3xl border-2 border-dashed border-secondary/30 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl mb-6">
                  <Wind className="h-16 w-16 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">¿Qué es el SIBO?</h3>
                <p className="text-muted-foreground">
                  Es el sobrecrecimiento de bacterias en el intestino delgado. Cuando estas bacterias fermentan comida, producen gases (Hidrógeno, Metano o Sulfuro) que causan esa sensación de "globo" en el abdomen, dolor o cambios en tu tránsito intestinal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Request to Specialist Section */}
        <section className="py-12 bg-secondary/5 border-y border-secondary/10">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-secondary/20 flex flex-col md:flex-row items-center gap-8">
              <div className="bg-secondary/10 p-6 rounded-full">
                <Stethoscope className="h-12 w-12 text-secondary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-primary mb-2">Da el primer paso con tu médico</h3>
                <p className="text-lg text-muted-foreground mb-4">
                  Realizamos diversos exámenes médicos para evaluar tu sistema digestivo: <strong>Test de Hidrógeno y Metano Espirado con Lactosa, Fructosa y Lactulosa</strong>. Si te identificas con estos síntomas, solicita a tu especialista o gastroenterólogo el test de aire espirado. Un diagnóstico preciso es la clave para un tratamiento efectivo.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-secondary font-bold">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>Diagnóstico certificado por especialistas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* High-Tech Authority Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">"Tecnología que inspira confianza, respaldada por la ciencia"</h2>
              <div className="h-1 w-24 bg-secondary mx-auto mb-8" />
              <p className="text-xl opacity-90 leading-relaxed">
                No somos solo un laboratorio. Somos pioneros en traer a Chile la tecnología <strong>Sunvou</strong>, desarrollada por científicos de la <strong>NASA, MIT y UC Berkeley</strong>.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 transition-all hover:bg-white/15">
                <Zap className="h-10 w-10 text-secondary mb-4" />
                <h4 className="text-xl font-bold mb-2">Nano Coulomb</h4>
                <p className="opacity-80 text-sm">Precisión molecular que detecta hasta la mínima traza de gas para un diagnóstico certero.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 transition-all hover:bg-white/15">
                <Globe className="h-10 w-10 text-secondary mb-4" />
                <h4 className="text-xl font-bold mb-2">Líder Mundial</h4>
                <p className="opacity-80 text-sm">Más de 12 millones de tests realizados y presencia en 4,000 hospitales a nivel global.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 transition-all hover:bg-white/15">
                <Award className="h-10 w-10 text-secondary mb-4" />
                <h4 className="text-xl font-bold mb-2">Certificación IVD</h4>
                <p className="opacity-80 text-sm">Cumplimos con los más altos estándares internacionales ISO 13485 y marcado CE.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </section>

        {/* Triple Gas Explanation */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Detección Única de 3 Gases</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">A diferencia de los tests tradicionales, nuestra tecnología detecta simultáneamente los tres gases clave para identificar tu condición exacta.</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {[
                { gas: "Hidrógeno (H2)", label: "SIBO Clásico", symptoms: "Diarrea, gases inmediatos, ruidos estomacales.", color: "text-blue-500" },
                { gas: "Metano (CH4)", label: "IMO", symptoms: "Estreñimiento crónico, hinchazón persistente, pesadez.", color: "text-emerald-500" },
                { gas: "Sulfuro (H2S)", label: "SIBO-H2S", symptoms: "Dolor abdominal severo, sensibilidad, gases con olor fuerte.", color: "text-amber-500" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1">
                  <span className={`text-4xl font-black ${item.color} block mb-4`}>0{idx + 1}</span>
                  <h4 className="text-2xl font-bold text-primary mb-2">{item.gas}</h4>
                  <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-4">{item.label}</div>
                  <p className="text-muted-foreground leading-relaxed">{item.symptoms}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Symptoms Icons Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">¿Cuándo es el momento de consultarnos?</h2>
              <p className="text-muted-foreground">Si experimentas de forma recurrente alguno de estos síntomas, el test de aire es el primer paso para recuperar tu calidad de vida.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {[
                { name: "Hinchazón / Gas", icon: <Zap className="h-8 w-8" /> },
                { name: "Diarrea Crónica", icon: <Activity className="h-8 w-8" /> },
                { name: "Constipación", icon: <AlertCircle className="h-8 w-8" /> },
                { name: "Dolor Abdominal", icon: <Search className="h-8 w-8" /> },
                { name: "Reflujo / Acidez", icon: <Beaker className="h-8 w-8" /> },
                { name: "Disbiosis", icon: <Microscope className="h-8 w-8" /> },
                { name: "Fatiga Post-Comida", icon: <ShieldCheck className="h-8 w-8" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-background border text-center transition-all hover:shadow-md hover:border-secondary group">
                  <div className="text-secondary mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <span className="text-sm font-semibold text-primary">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Tu camino hacia el alivio</h2>
              <p className="text-muted-foreground">Tres pasos simples para volver a sentirte bien.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-dashed border-t-2 border-dashed border-primary/20 -z-10" />
              
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-secondary flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110">
                  <ClipboardCheck className="h-8 w-8 text-secondary" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xl font-bold text-primary mb-3">1. Consulta Especializada</h4>
                  <p className="text-muted-foreground text-sm">Habla con tu gastroenterólogo sobre tus síntomas y solicita el Test de Aire Espirado.</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-secondary flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110">
                  <CalendarDays className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-xl font-bold text-primary mb-3">2. Agenda tu Test</h4>
                <p className="text-muted-foreground text-sm">Contáctanos para programar tu cita en nuestra consulta de Las Condes.</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-secondary flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110">
                  <Activity className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-xl font-bold text-primary mb-3">3. Resultados y Tratamiento</h4>
                <p className="text-muted-foreground text-sm">Recibe tus resultados y llévalos a tu especialista para iniciar el tratamiento adecuado.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-secondary p-1.5 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Oralab<span className="text-secondary">Flow</span></span>
              </div>
              <p className="text-primary-foreground/70 max-w-md leading-relaxed">
                Llevamos la ciencia de vanguardia Sunvou al servicio de los pacientes en Chile. Porque entender lo que pasa en tu interior es el primer paso para vivir mejor.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-secondary">Ubicación</h5>
              <ul className="space-y-4 text-primary-foreground/70 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <span>Apoquindo 3992, oficina 605, Las Condes<br />Centro Médico Alcántara (a pasos del metro)</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-secondary">Contacto</h5>
              <ul className="space-y-4 text-primary-foreground/70 text-sm">
                <li>Preguntas Frecuentes</li>
                <li>Privacidad de Datos</li>
                <li>Convenios Médicos</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
            <p>© 2024 Oralab Clinical Lab. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <span>Sunvou Medical Electronics Partner</span>
              <span>ISO 13485 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
