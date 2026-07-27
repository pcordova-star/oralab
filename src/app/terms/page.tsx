"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, FileText, Scale, Gavel } from "lucide-react";
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
                Este documento regula la relación contractual y el uso técnico de la plataforma de agendamiento de Oralab.
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
                  El acceso y uso de la plataforma de agendamiento web de <strong>Oralab</strong> (en adelante, "la Plataforma") atribuye la condición de Usuario e implica la aceptación plena de estos Términos y Condiciones. Si no está de acuerdo, debe abstenerse de utilizar el sitio.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 2. Objeto de la Plataforma
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  La Plataforma tiene como único fin facilitar la reserva de horas para tests de aire espirado y servicios de salud digestiva especializada en la consulta de Oralab. El agendamiento está sujeto a disponibilidad técnica y clínica del laboratorio.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 3. Registro y Responsabilidad de la Cuenta
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  El Usuario es responsable de la veracidad y exactitud de los datos ingresados al momento del agendamiento. Oralab no se hace responsable por errores en la comunicación derivados de datos de contacto incorrectamente suministrados o por el uso indebido de la cuenta por parte de terceros debido a negligencia del Usuario.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 4. Política de Cancelación y Modificación
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Oralab se reserva el derecho de reagendar o cancelar citas por motivos de fuerza mayor o mantenimiento de equipos Sunvou®, notificando al Usuario oportunamente. El Usuario deberá cancelar o modificar su cita con al menos <strong>24 horas de anticipación</strong> a través de nuestros canales oficiales o vía WhatsApp para permitir la liberación del cupo.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <Scale className="h-6 w-6 text-secondary" /> 5. Propiedad Intelectual
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Todo el contenido, diseño, logotipos, narrativa clínica y software de la plataforma son propiedad exclusiva de <strong>Tresna SpA / Oralab</strong> y están protegidos por las leyes de propiedad intelectual chilenas e internacionales. Queda prohibida la reproducción total o parcial sin autorización expresa.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <FileText className="h-6 w-6 text-secondary" /> 6. Limitación de Responsabilidad
                </h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Oralab no garantiza la disponibilidad ininterrumpida de la Plataforma debido a factores técnicos externos. No seremos responsables por daños derivados de interferencias, omisiones, virus informáticos o desconexiones en el sistema operativo que sean ajenos a nuestro control directo.
                </p>
              </div>

              <div className="space-y-4 p-8 bg-muted/30 rounded-[2rem] border border-primary/5">
                <h2 className="text-2xl font-black text-primary italic flex items-center gap-3">
                  <Gavel className="h-6 w-6 text-secondary" /> 7. Jurisdicción y Ley Aplicable
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
          <p className="text-primary-foreground/50 text-xs font-medium">© 2024 Oralab Clinical Lab. Tecnología especializada Sunvou®.</p>
        </div>
      </footer>
    </div>
  );
}
