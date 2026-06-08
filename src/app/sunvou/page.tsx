
"use client";

import { useState } from "react";
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
  Database,
  Mail,
  User,
  Building2,
  Send
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  institution: z.string().min(2, "Institución requerida"),
  message: z.string().min(10, "El mensaje debe ser más detallado"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function SunvouPage() {
  const medicalDeviceImg = PlaceHolderImages.find(img => img.id === 'medical-device');
  const whatsappUrl = "https://wa.me/56936850468";
  const [isSending, setIsSending] = useState(false);
  const db = useFirestore();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      message: "",
    },
  });

  async function onContactSubmit(values: ContactFormValues) {
    if (!db) return;
    setIsSending(true);
    
    try {
      // 1. Guardamos el lead en Firestore para respaldo
      const leadsRef = collection(db, "leads");
      await addDocumentNonBlocking(leadsRef, {
        ...values,
        createdAt: serverTimestamp()
      });

      // 2. Simulamos el éxito del envío al correo pcordova@oralab.cl
      // Nota: En un entorno real, aquí se llamaría a una Server Action que use un servicio de email (Resend/SendGrid)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "¡Solicitud Recibida!",
        description: "Tu consulta ha sido enviada con éxito. Un especialista te contactará pronto.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pudimos procesar tu solicitud. Por favor intenta vía WhatsApp.",
      });
    } finally {
      setIsSending(false);
    }
  }

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
                  <Link href="#contact-form">
                    <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-secondary hover:bg-secondary/90 shadow-xl">
                      Solicitar Cotización Técnica
                    </Button>
                  </Link>
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

        {/* Contact Form Section */}
        <section id="contact-form" className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block p-4 rounded-3xl bg-secondary/10 text-secondary border border-secondary/20">
                  <Mail className="h-8 w-8" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-primary italic leading-tight">Implementa Sunvou en tu Centro Médico</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Completa el formulario y nuestro equipo comercial te enviará una propuesta técnica detallada y los beneficios de ser un centro asociado Oralab.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-primary font-bold italic">
                    <CheckCircle2 className="h-6 w-6 text-secondary" /> Capacitación Clínica Certificada
                  </div>
                  <div className="flex items-center gap-4 text-primary font-bold italic">
                    <CheckCircle2 className="h-6 w-6 text-secondary" /> Soporte Técnico en Chile
                  </div>
                  <div className="flex items-center gap-4 text-primary font-bold italic">
                    <CheckCircle2 className="h-6 w-6 text-secondary" /> Entrega Inmediata de Insumos
                  </div>
                </div>
              </div>

              <Card className="bg-white rounded-[2.5rem] shadow-2xl border-none p-4 md:p-8">
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onContactSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Nombre Completo</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Ej: Dr. Ricardo Pérez" className="pl-10 h-12 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Correo Electrónico</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="ejemplo@clinica.cl" className="pl-10 h-12 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Institución / Clínica / Laboratorio</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Nombre de tu centro de salud" className="pl-10 h-12 rounded-xl" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Consulta o Requerimiento</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Cuéntanos sobre tu interés en la tecnología Sunvou..." 
                                className="min-h-[120px] rounded-xl resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full h-14 rounded-xl text-lg font-black bg-primary hover:bg-secondary transition-all shadow-lg active:scale-95"
                      >
                        {isSending ? (
                          <span className="flex items-center gap-2">Procesando...</span>
                        ) : (
                          <span className="flex items-center gap-2">Enviar Solicitud <Send className="h-5 w-5" /></span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Lead Capture Section (WhatsApp) */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-6xl font-black italic">¿Prefieres contacto directo?</h2>
              <p className="text-xl opacity-80 font-medium">
                Atención técnica inmediata vía WhatsApp para resolver dudas sobre equipos y protocolos.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full h-16 px-12 text-xl font-black bg-secondary hover:bg-white hover:text-primary transition-all shadow-2xl">
                    <MessageCircle className="h-6 w-6 mr-2" /> WhatsApp Especialista
                  </Button>
                </a>
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
