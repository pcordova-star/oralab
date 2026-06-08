
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Microscope, 
  Wind, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  MessageCircle,
  Settings,
  Activity,
  ArrowRight,
  Database
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function SunvouPage() {
  const medicalDeviceImg = PlaceHolderImages.find(img => img.id === 'medical-device');
  const labHeroImg = PlaceHolderImages.find(img => img.id === 'hero-lab');
  const whatsappUrl = "https://wa.me/56936850468";

  const features = [
    {
      title: "Detección Multi-gas",
      desc: "Único sistema capaz de medir Hidrógeno (H₂), Metano (CH₄) y Sulfuro de Hidrógeno (H₂S) simultáneamente.",
      icon: <Wind className="h-6 w-6 text-secondary" />
    },
    {
      title: "Corrección de CO₂",
      desc: "Asegura la validez de la muestra mediante la medición del CO₂ alveolar, eliminando falsos negativos.",
      icon: <Activity className="h-6 w-6 text-secondary" />
    },
    {
      title: "Sensores Electromecánicos",
      desc: "Tecnología de alta durabilidad con garantía de 2 años y precisión certificada internacionalmente.",
      icon: <Settings className="h-6 w-6 text-secondary" />
    },
    {
      title: "Resultados en Tiempo Real",
      desc: "Software integrado para visualización inmediata de curvas metabólicas y exportación de informes clínicos.",
      icon: <BarChart3 className="h-6 w-6 text-secondary" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section B2B */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-primary">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Award className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-black uppercase tracking-widest text-secondary">Representante Oficial en Chile</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight italic">
                  Tecnología Sunvou® <br />
                  <span className="text-secondary">Diagnóstico de Clase Mundial</span>
                </h1 >
                <p className="text-xl opacity-80 max-w-xl leading-relaxed">
                  Llevamos la vanguardia tecnológica de Sunvou Global a las clínicas y laboratorios de Chile. El analizador DA7349 redefine el estándar en el diagnóstico de SIBO e IMO.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-secondary hover:bg-secondary/90 shadow-xl">
                      Solicitar Cotización Técnica
                    </Button>
                  </a>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="glass-panel !bg-white/5 rounded-[3rem] p-4 border-white/10">
                  <Image 
                    src={medicalDeviceImg?.imageUrl || ""} 
                    alt="Sunvou Device" 
                    width={600} 
                    height={600} 
                    className="rounded-[2.5rem] shadow-2xl"
                    data-ai-hint="medical device"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-primary/5 hidden md:block">
                    <div className="text-center">
                      <p className="text-3xl font-black text-primary italic">DA7349</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Modelo de Referencia Global</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-primary italic">Ventaja Tecnológica Sunvou</h2>
              <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
              <p className="text-lg text-muted-foreground font-medium">
                Precisión que asiste al especialista en la toma de decisiones clínicas críticas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2rem] bg-muted/30 border border-primary/5 hover:border-secondary/50 transition-all group"
                >
                  <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specification Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="glass-panel !bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border-primary/5 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-secondary border-secondary font-bold px-4 py-1">ESPECIFICACIONES TÉCNICAS</Badge>
                  <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">El estándar de oro en Diagnóstico de Aire.</h2>
                </div>
                
                <div className="space-y-6">
                  {[
                    "Muestreo automático de gases de extremo aliento.",
                    "Análisis simultáneo en menos de 180 segundos.",
                    "Vida útil del analizador superior a 5 años.",
                    "Conectividad USB para gestión de base de datos de pacientes.",
                    "Bajo costo de mantenimiento y consumibles."
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                      <p className="font-bold text-primary/80 italic">{text}</p>
                    </div>
                  ))}
                </div>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold group">
                    Descargar Ficha Técnica <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
              
              <div className="lg:w-1/2 relative">
                <div className="aspect-square bg-primary/5 rounded-[3rem] flex items-center justify-center p-12 border-4 border-dashed border-primary/10">
                   <div className="text-center space-y-4">
                      <Microscope className="h-32 w-32 text-primary mx-auto opacity-20" />
                      <div className="space-y-2">
                        <p className="text-4xl font-black text-primary italic">Sunvou Chile</p>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.3em]">Official Partner</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture Section */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-6xl font-black italic">¿Interesado en implementar esta tecnología?</h2>
              <p className="text-xl opacity-80 font-medium">
                Proveemos equipos, capacitación clínica y soporte técnico especializado para centros de salud en todo Chile.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-16 px-12 text-xl font-black bg-secondary hover:bg-white hover:text-primary transition-all shadow-2xl">
                    <MessageCircle className="h-6 w-6 mr-2" /> Consultar por WhatsApp
                  </Button>
                </a>
                <Link href="/admin/quotations" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-16 px-12 text-xl font-bold border-2 border-white/30 bg-white/10 backdrop-blur-md">
                    Acceso Portal CRM
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-primary font-black italic text-xl">Oralab Clinical Lab.</p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Representante Sunvou® Breath Diagnostics Chile</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-primary/60">
            <Link href="/" className="hover:text-secondary">Oralab Inicio</Link>
            <Link href="/how-it-works" className="hover:text-secondary">Protocolos</Link>
            <Link href="/booking" className="hover:text-secondary">Reservas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
