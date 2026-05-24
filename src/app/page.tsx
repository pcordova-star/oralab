
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
  AlertCircle,
  Globe,
  Award,
  FileText,
  Users
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
                <Zap className="h-4 w-4" /> Líder Global en Diagnóstico Molecular del Aliento
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-primary mb-6 leading-tight">
                Tecnología <span className="text-secondary">Nano Coulomb</span> para tu Salud Intestinal
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
                Pioneros en Chile con la tecnología Sunvou. Detección precisa de <strong>H2, CH4 y H2S</strong> 
                respaldada por científicos de la NASA, MIT y UC Berkeley. 
                Más de 12 millones de tests realizados a nivel mundial.
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

        {/* Global Leadership Stats */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-extrabold mb-2">70+</div>
                <div className="text-sm opacity-80 uppercase tracking-wider">Patentes Otorgadas</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">400+</div>
                <div className="text-sm opacity-80 uppercase tracking-wider">Publicaciones Científicas</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">4,000+</div>
                <div className="text-sm opacity-80 uppercase tracking-wider">Equipos en Hospitales</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">12M+</div>
                <div className="text-sm opacity-80 uppercase tracking-wider">Tests Realizados</div>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Indications Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">¿Cuándo realizarse un Test de Aire?</h2>
              <p className="text-muted-foreground">Indicaciones clínicas recomendadas para el diagnóstico de disbiosis e inflamación gastrointestinal mediante biomarcadores gaseosos.</p>
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

        {/* Sunvou Tech / Corporate Background */}
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="p-8 rounded-3xl bg-white shadow-2xl border">
                  <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                    <Globe className="text-secondary h-6 w-6" /> Respaldo Global Sunvou
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Sunvou es el líder mundial en innovación de tecnología de diagnóstico molecular del aliento, fundado por científicos e ingenieros ex-NASA, Honeywell y Cisco.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Award className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Certificaciones Internacionales</p>
                        <p className="text-sm text-muted-foreground">ISO 13485 por TUV Rheinland y marcado CE para diagnóstico in-vitro (IVD).</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Talento de Elite</p>
                        <p className="text-sm text-muted-foreground">Equipo conformado por graduados de MIT y UC Berkeley especializados en salud respiratoria.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Validación Científica</p>
                        <p className="text-sm text-muted-foreground">Más de 400 publicaciones revisadas por pares respaldan la precisión de nuestros analizadores.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-primary mb-8 leading-tight">Analizador de Aliento de Nano Coulomb</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Nuestra tecnología permite la detección simultánea de los gases clave para identificar condiciones gastrointestinales complejas:
                </p>
                <div className="space-y-6">
                  {[
                    { gas: "Hidrógeno (H2)", type: "SIBO", desc: "Detección estándar para sobrecrecimiento bacteriano." },
                    { gas: "Metano (CH4)", type: "IMO", desc: "Asociado a estreñimiento crónico y disbiosis de arqueas." },
                    { gas: "Sulfuro de Hidrógeno (H2S)", type: "SIBO-H2S", desc: "Detección avanzada para inflamaciones y dolor abdominal severo." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-white border shadow-sm transition-transform hover:-translate-y-1">
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
            </div>
          </div>
        </section>

        {/* Clinical Guidelines Timeline */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Respaldo Clínico e Internacional</h2>
              <p className="text-muted-foreground">Cumplimos con los más altos estándares y consensos técnicos globales para tests de aliento.</p>
            </div>
            
            <div className="relative border-l-2 border-secondary/30 ml-4 md:ml-0 md:flex md:border-l-0 md:border-t-2 md:justify-between md:items-start pt-8">
              {[
                { year: "2009", event: "Consenso de Roma", desc: "Establecimiento de estándares para tests de Hidrógeno." },
                { year: "2017", event: "ATS/ERS Standards", desc: "Estándares técnicos para gases exhalados (NO)." },
                { year: "2021", event: "Consenso Experto", desc: "Lineamientos para NO/H2/CH4/H2S en la práctica clínica." },
                { year: "2022", event: "Microbioma Digestivo", desc: "Integración del H2S como biomarcador de inflamación." },
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
              Tecnología Sunvou Medical Electronics. Líder mundial en diagnóstico molecular del aliento desde 2011.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8 font-medium">
              <span className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Certificaciones IVD</span>
              <span className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Privacidad</span>
              <span className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Contacto</span>
            </div>
            <div className="text-primary-foreground/70 text-sm">
              © 2024 Oralab Clinical Lab. Innovación en Salud Digestiva.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
