
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { 
  Handshake, 
  CheckCircle2, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Send, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
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
import Link from "next/link";

const agreementSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  institution: z.string().min(2, "Institución o Clínica requerida"),
  phone: z.string().min(8, "Teléfono incompleto"),
  message: z.string().min(10, "Por favor, cuéntanos un poco más sobre tu requerimiento"),
});

type AgreementFormValues = z.infer<typeof agreementSchema>;

export default function AgreementsPage() {
  const [isSending, setIsSending] = useState(false);
  const db = useFirestore();
  const whatsappUrl = "https://wa.me/56936850468";

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: AgreementFormValues) {
    if (!db) return;
    setIsSending(true);
    
    try {
      const requestsRef = collection(db, "agreement_requests");
      await addDocumentNonBlocking(requestsRef, {
        ...values,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Solicitud de Convenio Enviada",
        description: "Nuestro equipo comercial revisará tu propuesta y te contactará a la brevedad.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "Hubo un problema técnico. Por favor, intenta de nuevo o contáctanos por WhatsApp.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const benefits = [
    {
      title: "Tarifas Preferenciales",
      desc: "Precios especiales y descuentos exclusivos para los pacientes derivados de tu centro médico.",
      icon: <Zap className="h-6 w-6 text-secondary" />
    },
    {
      title: "Reportes Prioritarios",
      desc: "Acceso a un canal de entrega de resultados más rápido y directo para el especialista tratante.",
      icon: <ShieldCheck className="h-6 w-6 text-secondary" />
    },
    {
      title: "Capacitación Técnica",
      desc: "Sesiones informativas sobre interpretación de curvas Sunvou® y protocolos de salud digestiva.",
      icon: <Users className="h-6 w-6 text-secondary" />
    },
    {
      title: "Material para Pacientes",
      desc: "Entrega de material educativo impreso y digital para facilitar la preparación del test.",
      icon: <CheckCircle2 className="h-6 w-6 text-secondary" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-primary text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Handshake className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-black uppercase tracking-widest text-secondary">Alianzas Estratégicas</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black italic leading-tight">
                  Convenios <br />
                  <span className="text-secondary">Institucionales</span>
                </h1>
                <p className="text-xl opacity-80 max-w-2xl leading-relaxed font-medium">
                  En Oralab buscamos fortalecer la red de salud digestiva en Chile. Si eres especialista o representas a un centro médico, únete a nuestra red de prestadores preferentes.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-primary italic">¿Por qué ser Partner Oralab?</h2>
              <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-muted/30 border border-primary/5 hover:border-secondary/50 transition-all group"
                >
                  <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {b.icon}
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3 italic">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-primary italic leading-tight">Solicita tu Convenio</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Completa el formulario y un ejecutivo de nuestra área comercial se pondrá en contacto para presentarte nuestra propuesta de colaboración.
                </p>
                
                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                  <h4 className="font-black text-primary italic mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" /> Proceso de Activación
                  </h4>
                  <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                    <li className="flex gap-3"><span className="text-secondary font-black">01.</span> Recepción de solicitud y validación de datos.</li>
                    <li className="flex gap-3"><span className="text-secondary font-black">02.</span> Reunión técnica para definir términos y tarifas.</li>
                    <li className="flex gap-3"><span className="text-secondary font-black">03.</span> Firma de convenio y entrega de material promocional.</li>
                    <li className="flex gap-3"><span className="text-secondary font-black">04.</span> ¡Listo! Tus pacientes ya pueden agendar con beneficios.</li>
                  </ul>
                </div>
              </div>

              <Card className="bg-white rounded-[2.5rem] shadow-2xl border-none p-4 md:p-8">
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Nombre o Contacto</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Ej: Dr. Juan Pérez" className="pl-10 h-12 rounded-xl" {...field} />
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
                              <FormLabel className="font-bold">Email Institucional</FormLabel>
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
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="institution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Centro / Institución</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Nombre de tu clínica" className="pl-10 h-12 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Teléfono de contacto</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="+56 9 ..." className="pl-10 h-12 rounded-xl" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Consulta o Requerimiento Especial</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Cuéntanos más sobre cómo te gustaría colaborar..." 
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
                          <span className="flex items-center gap-2">Enviando solicitud...</span>
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

        {/* Bottom CTA */}
        <section className="py-24 bg-primary text-white text-center">
          <div className="container mx-auto px-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="max-w-2xl mx-auto space-y-8"
             >
                <MessageCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h2 className="text-3xl md:text-5xl font-black italic">¿Dudas rápidas?</h2>
                <p className="text-xl opacity-80">Conversa directamente con nuestro equipo técnico y comercial vía WhatsApp para resolver inquietudes inmediatas.</p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full h-16 px-10 text-xl font-black bg-secondary hover:bg-white hover:text-primary transition-all shadow-2xl">
                     WhatsApp Especialista
                  </Button>
                </a>
             </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-primary font-black italic text-xl">Oralab Clinical Lab.</p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Alianzas y Convenios Preferentes</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-primary/60">
            <Link href="/" className="hover:text-secondary">Inicio</Link>
            <Link href="/sunvou" className="hover:text-secondary">Sunvou Chile</Link>
            <Link href="/booking" className="hover:text-secondary">Reservas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
