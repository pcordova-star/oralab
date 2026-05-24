
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Microscope, 
  Stethoscope, 
  ShieldCheck, 
  Zap,
  Beaker,
  AlertCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-background">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Zap className="h-4 w-4" /> Tecnología Sunvou de Vanguardia
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-primary mb-6 leading-tight">
                Diagnóstico de Triple Gas para tu <span className="text-secondary">Salud Intestinal</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                Somos pioneros en Chile en la detección de <strong>Hidrógeno (H2), Metano (CH4) y Sulfuro de Hidrógeno (H2S)</strong>. 
                Tecnología no invasiva para identificar disbiosis e inflamación con precisión clínica.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-lg transition-transform hover:scale-105">
                  Conoce nuestra tecnología <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
        </section>

        {/* Clinical Indications Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">¿Cuándo realizarse un Test de Aire?</h2>
              <p className="text-muted-foreground">Indicaciones clínicas recomendadas para el diagnóstico de disbiosis e inflamación gastrointestinal.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {[
                { name: "Diarrea / Constipación", icon: <Activity className="h-8 w-8" /> },
                { name: "Dolor Abdominal", icon: <AlertCircle className="h-8 w-8" /> },
                { name: "Vómitos / Acidez", icon: <Beaker className="h-8 w-8" /> },
                { name: "Hinchazón Gas", icon: <Zap className="h-8 w-8" /> },
                { name: "Gastropatía", icon: <Stethoscope className="h-8 w-8" /> },
                { name: "Enteropatía", icon: <ShieldCheck className="h-8 w-8" /> },
                { name: "Disbiosis", icon: <Microscope className="h-8 w-8" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-background border text-center transition-all hover:shadow-md hover:border-secondary">
                  <div className="text-secondary mb-4">{item.icon}</div>
                  <span className="text-sm font-semibold text-primary">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Specs - The 3 Gases */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-primary mb-8 leading-tight">Detección Precisa de los 3 Gases Productores de Disbiosis</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Nuestra tecnología Sunvou-CA7349 permite dividir la disbiosis en tres categorías principales de sobrecrecimiento bacteriano según el gas producido:
                </p>
                <div className="space-y-6">
                  {[
                    { gas: "Hidrógeno (H2)", type: "SOB (SIBO)", desc: "Relacionado frecuentemente con diarrea y tránsito rápido." },
                    { gas: "Metano (CH4)", type: "IMO", desc: "Asociado a constipación crónica y tránsito lento." },
                    { gas: "Sulfuro de Hidrógeno (H2S)", type: "SOB-H2S", desc: "Vinculado a inflamación sistémica y dolor abdominal severo." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-white border shadow-sm">
                      <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold shrink-0">
                        {item.gas.split(' ')[0][0]}{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-primary">{item.gas} <span className="text-secondary text-sm font-normal">({item.type})</span></h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="p-8 rounded-3xl bg-white shadow-2xl border">
                  <h3 className="text-2xl font-bold text-primary mb-6">Aplicaciones Clínicas</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Chequeo de Rutina</p>
                        <p className="text-sm text-muted-foreground">Evaluación preventiva de condiciones gastrointestinales.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Diagnóstico de Disbiosis</p>
                        <p className="text-sm text-muted-foreground">Identificación clara de microorganismos productores de gas.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Guía de Tratamiento</p>
                        <p className="text-sm text-muted-foreground">Ayuda a los clínicos a seleccionar la terapia antibiótica o dietética correcta.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Monitoreo de Pronóstico</p>
                        <p className="text-sm text-muted-foreground">Evaluación de la efectividad del tratamiento a lo largo del tiempo.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="absolute -bottom-10 -left-10 bg-primary p-6 rounded-2xl shadow-xl text-white hidden md:block">
                  <p className="text-3xl font-bold">99%</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Satisfacción del Cliente</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Guidelines Timeline */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Respaldo Clínico e Internacional</h2>
              <p className="text-muted-foreground">Basado en los más altos estándares y consensos técnicos globales.</p>
            </div>
            
            <div className="relative border-l-2 border-secondary/30 ml-4 md:ml-0 md:flex md:border-l-0 md:border-t-2 md:justify-between md:items-start pt-8">
              {[
                { year: "2009", event: "Consenso de Roma", desc: "Estándares para el test de aire de Hidrógeno." },
                { year: "2017", event: "ATS/ERS Standards", desc: "Estándares técnicos para NO y gases exhalados." },
                { year: "2021", event: "Consenso Chino", desc: "Lineamientos expertos para NO/H2/CH4/H2S." },
                { year: "2022", event: "Digestive Microbiome", desc: "Nuevas fronteras en diagnóstico funcional." },
              ].map((item, idx) => (
                <div key={idx} className="relative mb-12 md:mb-0 md:w-1/4 px-6">
                  <div className="absolute -left-[33px] md:left-1/2 md:-top-[41px] h-4 w-4 rounded-full bg-secondary border-4 border-white shadow-sm md:-translate-x-2" />
                  <span className="block text-secondary font-bold mb-2">{item.year}</span>
                  <h4 className="font-bold text-primary mb-2">{item.event}</h4>
                  <p className="text-sm text-muted-foreground leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6" />
              <span className="text-2xl font-bold">Oralab</span>
            </div>
            <p className="text-primary-foreground/70 max-w-xs">
              Laboratorio clínico especializado en diagnósticos funcionales del aliento. Tecnología Sunvou CA7349.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8 font-medium">
              <span className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Privacidad</span>
              <span className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Contacto</span>
            </div>
            <div className="text-primary-foreground/70 text-sm">
              © 2024 Oralab Clinical Lab. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
