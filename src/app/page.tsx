"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Activity, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-background">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">
                Tecnología de Aire Espirado para tu <span className="text-secondary">Salud Digestiva</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                Diagnósticos precisos y no invasivos para SIBO. 
                Especialistas en salud intestinal y bienestar digestivo en Chile.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg">
                  Conoce nuestro servicio <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute top-0 right-0 p-20 hidden lg:block">
            <div className="relative">
               <div className="bg-white p-8 rounded-3xl shadow-2xl border flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Resultados Rápidos</p>
                    <p className="text-sm text-muted-foreground">Diagnósticos de alta precisión</p>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-2xl border flex items-center gap-4 absolute -bottom-16 -left-20">
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Atención Especializada</p>
                    <p className="text-sm text-muted-foreground">Protocolos clínicos internacionales</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-16 text-primary">Nuestra Especialidad</h2>
            <div className="max-w-2xl mx-auto">
              <div className="group p-10 rounded-3xl border bg-background transition-all hover:shadow-xl">
                <div className="h-20 w-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Activity className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Test de Aire SIBO</h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Detección de sobrecrecimiento bacteriano en el intestino delgado mediante la medición de hidrógeno y metano. Un procedimiento indoloro y altamente efectivo.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Precisión diagnóstica</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Múltiples gases (H2/CH4)</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> No invasivo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Resultados confiables</div>
                </div>
              </div>
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
              Laboratorio clínico especializado en diagnósticos funcionales del aliento para SIBO.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8">
              <span className="opacity-70">Privacidad</span>
              <span className="opacity-70">Contacto</span>
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
