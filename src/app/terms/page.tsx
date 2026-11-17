"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, FileText, Scale, Gavel, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-primary text-white py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href="/" className="inline-flex items-center text-secondary hover:text-secondary/80 mb-6 font-bold transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
              </Link>
              <h1 className="text-3xl md:text-5xl font-black mb-4 italic flex items-center gap-4">
                <ShieldCheck className="h-10 w-10 text-secondary" /> Términos y Condiciones
              </h1>
              <p className="text-lg opacity-80 max-w-2xl font-medium">
                Este documento regula la relación contractual y el uso técnico de los servicios de procesamiento de Oralab.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-slate max-w-none space-y-12">
              
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 1. Aceptación de los Términos
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  El acceso y uso de los servicios de <strong>Oralab</strong> (en adelante, "el Laboratorio") implica la aceptación plena de estos Términos y Condiciones por parte de centros médicos, especialistas y pacientes.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 2. Objeto del Servicio
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  El Laboratorio tiene como fin el procesamiento de muestras de aire espirado para la detección de SIBO e intolerancias. El servicio está sujeto a la calidad de la muestra recolectada y enviada por el centro médico o paciente.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 3. Responsabilidad de la Muestra
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Es responsabilidad del remitente asegurar que la muestra haya sido recolectada siguiendo estrictamente los protocolos clínicos de Oralab y transportada en condiciones óptimas para garantizar la estabilidad de los gases (H2, CH4, CO2).
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <Scale className="h-6 w-6 text-secondary" /> 4. Propiedad Intelectual
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Todo el contenido, diseño, logotipos, narrativa clínica y software de la plataforma son propiedad exclusiva de <strong>Tresna SpA / Oralab</strong> y están protegidos por las leyes de propiedad intelectual chilenas e internacionales.
                </p>
              </div>

              <div className="space-y-4 p-8 bg-muted/30 rounded-[2rem] border border-primary/5">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <Gavel className="h-6 w-6 text-secondary" /> 5. Jurisdicción y Ley Aplicable
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios de justicia de la comuna de Santiago.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
               <MapPin className="h-5 w-5 text-secondary" />
               <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Apoquindo 3990, Las Condes. Chile.</p>
            </div>
            <p className="text-primary-foreground/50 text-xs font-medium">© 2024 Oralab Clinical Lab. Tecnología especializada Sunvou®.</p>
          </div>
          <div className="flex justify-center gap-8 text-xs font-bold opacity-60">
            <Link href="/" className="hover:text-secondary">Inicio</Link>
            <Link href="/sunvou" className="hover:text-secondary">Tecnología</Link>
            <Link href="/agreements" className="hover:text-secondary">Convenios</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}