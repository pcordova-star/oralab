import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
                Diagnósticos precisos y no invasivos para SIBO y Helicobacter pylori. 
                Agenda tu cita hoy mismo en nuestro laboratorio clínico especializado.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg" asChild>
                  <Link href="/booking">
                    Agendar Examen Online <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
                  Ver Protocolos
                </Button>
              </div>
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute top-0 right-0 p-20 hidden lg:block">
            <div className="relative">
               <div className="bg-white p-8 rounded-3xl shadow-2xl border flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Resultados Rápidos</p>
                    <p className="text-sm text-muted-foreground">En menos de 24 horas hábiles</p>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-2xl border flex items-center gap-4 absolute -bottom-16 -left-20">
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Examen Express</p>
                    <p className="text-sm text-muted-foreground">30 min (HP) - 3 horas (SIBO)</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-16 text-primary">Nuestros Exámenes Especializados</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="group p-8 rounded-3xl border bg-background hover:border-secondary transition-all">
                <div className="h-16 w-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Test de Aire SIBO</h3>
                <p className="text-muted-foreground mb-6">
                  Detección de sobrecrecimiento bacteriano en el intestino delgado mediante la medición de hidrógeno y metano.
                </p>
                <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Duración: 3 horas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Múltiples tomas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> No invasivo</li>
                </ul>
                <Button className="w-full rounded-xl" asChild>
                  <Link href="/booking">Agendar SIBO</Link>
                </Button>
              </div>

              <div className="group p-8 rounded-3xl border bg-background hover:border-primary transition-all">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Test Helicobacter Pylori</h3>
                <p className="text-muted-foreground mb-6">
                  Test de aire (Urea C13) altamente sensible para detectar la presencia de la bacteria estomacal HP.
                </p>
                <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Duración: 30 minutos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Oro-estándar de diagnóstico</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Resultados inmediatos</li>
                </ul>
                <Button className="w-full rounded-xl" asChild>
                  <Link href="/booking">Agendar HP</Link>
                </Button>
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
              Laboratorio clínico especializado en diagnósticos funcionales.
            </p>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:underline">Privacidad</Link>
            <Link href="#" className="hover:underline">Contacto</Link>
            <Link href="/booking" className="hover:underline">Agenda</Link>
          </div>
          <div className="text-primary-foreground/70 text-sm">
            © 2024 Oralab Clinical Lab. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}