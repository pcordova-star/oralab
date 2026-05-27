
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Activity, 
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
  MapPin,
  Package,
  MessageCircle,
  Lock,
  ChevronRight,
  Wind,
  Sparkles
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Apoquindo+3992+oficina+605+Las+Condes+Santiago+Chile";
  const whatsappUrl = "https://wa.me/56936850468";
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-lab');
  const techImage = PlaceHolderImages.find(img => img.id === 'medical-device');

  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-blob animation-delay-4000" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="space-y-8"
              >
                <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-bold border border-secondary/20 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" /> Tecnología Sunvou® Certificada
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 backdrop-blur-sm">
                    <Package className="h-4 w-4" /> Kit Ambulatorio disponible
                  </span>
                </motion.div>
                
                <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black text-primary leading-[1.1]">
                  Recupera tu <span className="text-gradient">bienestar digestivo</span> con precisión molecular.
                </motion.h1>
                
                <motion.p variants={fadeIn} className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  ¿Sufres de hinchazón o molestias persistentes? Descubre el origen de tus síntomas con el test de aire espirado líder en el mundo. Sin agujas, sin dolor, resultados exactos.
                </motion.p>
                
                <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-6">
                  <Link href="/booking">
                    <Button size="lg" className="rounded-full h-16 px-10 text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 group">
                      Agendar mi examen <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="outline" size="lg" className="rounded-full h-16 px-8 text-lg font-bold border-2 hover:bg-secondary/5">
                      Ver cómo funciona
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={fadeIn} className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted overflow-hidden">
                        <Image 
                          src={`https://picsum.photos/seed/face${i}/100/100`} 
                          width={40} height={40} 
                          alt="Paciente" 
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <span className="text-primary font-bold">+12 Millones</span> de tests realizados globalmente
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white/50 backdrop-blur-xl animate-float">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/oralab-hero/800/600"} 
                    width={800} height={600} 
                    alt="Laboratorio Oralab" 
                    className="object-cover"
                    data-ai-hint="clinical laboratory"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
                </div>
                
                {/* Floating Cards */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 glass-panel p-6 rounded-2xl z-20 hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Precisión</p>
                      <p className="text-lg font-black text-primary">99.8%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 glass-panel p-6 rounded-2xl z-20 hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wind className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Resultado</p>
                      <p className="text-lg font-black text-primary">Inmediato</p>
                    </div>
                  </div>
                </motion.div>

                {/* Background decorative ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/10 rounded-full -z-10 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Symptoms Grid - Improved Visuals */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-primary">¿Cuándo consultarnos?</h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
              <p className="text-xl text-muted-foreground">Si experimentas estos síntomas de forma recurrente, tu microbiota podría estar enviando señales importantes.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: "Hinchazón", icon: <Zap />, color: "bg-blue-50 text-blue-600" },
                { name: "Diarrea", icon: <Activity />, color: "bg-emerald-50 text-emerald-600" },
                { name: "Constipación", icon: <AlertCircle />, color: "bg-amber-50 text-amber-600" },
                { name: "Dolor Abdom.", icon: <Search />, color: "bg-purple-50 text-purple-600" },
                { name: "Reflujo", icon: <Beaker />, color: "bg-pink-50 text-pink-600" },
                { name: "Fatiga", icon: <ShieldCheck />, color: "bg-indigo-50 text-indigo-600" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center p-8 rounded-[2rem] bg-white border border-border shadow-sm hover:shadow-xl transition-all group cursor-default"
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Authority Section - Dark Mode "Wooo" */}
        <section className="py-40 bg-primary text-white relative overflow-hidden">
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-6xl font-black mb-8 leading-tight italic"
                >
                  "Tecnología de la <span className="text-secondary">NASA</span> al servicio de tu intestino"
                </motion.h2>
                <p className="text-xl opacity-80 mb-12 leading-relaxed">
                  Utilizamos sensores de grafeno y tecnología Sunvou®, la única validada por expertos del MIT y UC Berkeley. Somos el laboratorio con la tecnología de detección de gases más sensible del país.
                </p>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Globe className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Estándar Global</h4>
                      <p className="text-sm opacity-60">En más de 4,000 centros médicos nivel mundial.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Award className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Certificado</h4>
                      <p className="text-sm opacity-60">ISO 13485 e IVD para diagnósticos clínicos.</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative flex justify-center"
              >
                <div className="w-[400px] h-[400px] bg-secondary/20 rounded-full absolute blur-[80px] animate-pulse" />
                <div className="relative glass-panel !bg-white/10 rounded-[3rem] p-12 overflow-hidden border-white/20">
                  <Image 
                    src={techImage?.imageUrl || "https://picsum.photos/seed/sunvou/600/600"} 
                    width={400} height={400} 
                    alt="Sensor Sunvou" 
                    className="object-cover rounded-2xl grayscale brightness-110"
                    data-ai-hint="medical technology"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-secondary">Sensor de Grafeno de Alta Precisión</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Steps Section - Interactive Cards */}
        <section className="py-32 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">Tu camino hacia el alivio</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Un proceso diseñado para tu comodidad y exactitud diagnóstica.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  title: "1. Agenda Online", 
                  desc: "Elige modalidad presencial o kit para casa. Recibe instrucciones de preparación al instante.", 
                  icon: <CalendarDays className="h-10 w-10" />,
                  link: "/booking"
                },
                { 
                  title: "2. Realiza el Test", 
                  desc: "Un simple soplido en intervalos regulares permite medir los gases que produce tu microbiota.", 
                  icon: <Activity className="h-10 w-10" />,
                  link: "/how-it-works"
                },
                { 
                  title: "3. Obtén Resultados", 
                  desc: "Informe clínico detallado para que tu especialista inicie el tratamiento con evidencia real.", 
                  icon: <ClipboardCheck className="h-10 w-10" />
                },
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative glass-panel p-10 rounded-[2.5rem] flex flex-col items-center text-center group h-full"
                >
                  <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{step.desc}</p>
                  {step.link && (
                    <Link href={step.link} className="mt-auto">
                      <Button variant="link" className="text-secondary font-bold hover:gap-2 transition-all">
                        Saber más <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {/* Decorative number background */}
                  <span className="absolute -top-6 -left-6 text-8xl font-black text-primary/5 select-none">{idx + 1}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Super "Wooo" */}
        <section className="py-32 container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="rounded-[3rem] p-12 md:p-24 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(28,104,182,0.4)]"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </div>

            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-7xl font-black text-white leading-tight">
                ¿Listo para dejar atrás la hinchazón?
              </h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Únete a miles de pacientes que ya han descubierto la clave de su salud digestiva. Estamos en Las Condes, esperándote.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-8">
                <Link href="/booking">
                  <Button size="lg" className="rounded-full h-20 px-12 text-2xl font-black shadow-2xl bg-white text-primary hover:bg-secondary hover:text-white transition-all hover:scale-105 active:scale-95">
                    Reservar mi Cita Ahora
                  </Button>
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full h-20 px-10 text-xl font-bold border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md">
                    <MessageCircle className="h-6 w-6 mr-3" /> Escríbenos
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 lg:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-black text-primary tracking-tighter italic">Oralab</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Expertos en Salud Digestiva Avanzada. Pioneros en tecnología Sunvou® en Chile para un diagnóstico preciso y humano.
              </p>
              <div className="flex gap-4">
                <div className="p-3 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border border-primary/10">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="p-3 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer border border-primary/10">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-black text-primary mb-8 text-xl">Nuestra Sede</h5>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="group space-y-4 block">
                <div className="flex items-start gap-3 text-muted-foreground group-hover:text-primary transition-colors text-lg">
                  <MapPin className="h-6 w-6 text-secondary shrink-0 mt-1" />
                  <span>Apoquindo 3992, Of. 605, Las Condes. <br /> Centro Médico Alcántara.</span>
                </div>
              </a>
            </div>
            <div>
              <h5 className="font-black text-primary mb-8 text-xl">Accesos</h5>
              <ul className="space-y-4 text-lg">
                <li><Link href="/booking" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Agendar Cita</Link></li>
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-secondary transition-colors font-medium">Cómo Funciona</Link></li>
                <li><Link href="/login" className="text-muted-foreground/30 hover:text-primary transition-colors inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Personal</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground text-sm font-medium">
            <p>© 2024 Oralab Clinical Lab. Innovación en Diagnóstico Digestivo.</p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> ISO 13485</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Sunvou Official Partner</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
