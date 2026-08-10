
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip, 
  Legend
} from "recharts";
import { 
  Target, 
  Microscope, 
  Building2, 
  CheckCircle2,
  Clock,
  HandCoins,
  Sparkles,
  Users,
  TrendingUp,
  CalendarDays,
  Newspaper,
  Image as ImageIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const FUNDING_GOAL = 13500000;

const MILESTONES_CATALOG = [
  {
    id: "m1",
    title: "Equipo + Importación",
    target: 9102116,
    percentage: 67,
    color: "bg-[#1c68b6]",
    textColor: "text-[#1c68b6]",
    icon: <Microscope className="h-8 w-8" />,
    items: [
      "Sunvou DA7349 FOB China: $6.734.600",
      "Logística y Aduana: $968.860",
      "IVA 19% importación: $1.398.656"
    ]
  },
  {
    id: "m2",
    title: "Habilitación Consulta",
    target: 1300000,
    percentage: 10,
    color: "bg-[#19cccc]",
    textColor: "text-[#19cccc]",
    icon: <Building2 className="h-8 w-8" />,
    items: [
      "Lavamanos y Fontanería",
      "Revestimientos y TV Clínica",
      "Mobiliario de Atención"
    ]
  },
  {
    id: "m3",
    title: "Capital de Trabajo",
    target: 3097884,
    percentage: 23,
    color: "bg-[#10b981]",
    textColor: "text-[#10b981]",
    icon: <TrendingUp className="h-8 w-8" />,
    items: [
      "Insumos iniciales (300 pacientes)",
      "Marketing digital lanzamiento",
      "Arriendos y gastos fijos M1"
    ]
  }
];

const chartData = MILESTONES_CATALOG.map(m => ({
  name: m.title,
  value: m.target,
  color: m.id === 'm1' ? '#1c68b6' : m.id === 'm2' ? '#19cccc' : '#10b981'
}));

export default function InvestorsDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const partnersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "contract_leads");
  }, [db]);

  const milestonesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "milestones"), orderBy("date", "asc"));
  }, [db]);

  const newsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investor_updates"), orderBy("date", "desc"));
  }, [db]);

  const { data: rawLeads, isLoading: loadingPartners } = useCollection(partnersQuery);
  const { data: milestones, isLoading: loadingMilestones } = useCollection(milestonesQuery);
  const { data: news, isLoading: loadingNews } = useCollection(newsQuery);

  const partners = (rawLeads || [])
    .filter(lead => lead.status === "fully_signed" || lead.status === "signed_by_investor")
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateA - dateB;
    });

  const totalRaised = partners.reduce((acc, p) => acc + (p.amount || 0), 0);
  const progressValue = Math.min((totalRaised / FUNDING_GOAL) * 100, 100);
  const partnersCount = partners.length;

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">DASHBOARD DE SOCIOS FF01</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight text-gradient">Portal de Transparencia Oralab</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Información en tiempo real sobre la ejecución del capital y avances del laboratorio.</p>
        </div>

        {/* Mural de Noticias (NUEVO) */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary/10 p-3 rounded-2xl">
              <Newspaper className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary italic">Mural de Noticias</h2>
              <p className="text-sm text-muted-foreground font-bold">Avances fotográficos y comunicados oficiales.</p>
            </div>
          </div>

          {loadingNews ? (
            <div className="py-20 text-center italic text-muted-foreground">Cargando mural...</div>
          ) : !news || news.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-muted bg-white/50 rounded-[3rem]">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-bold italic">No hay noticias publicadas todavía.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Card key={item.id} className="bg-white shadow-xl rounded-[2.5rem] border-primary/5 overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint="news photo"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-primary font-black text-[10px] border-none">
                        {format(new Date(item.date + 'T00:00:00'), "dd MMM yyyy", { locale: es }).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-black text-primary italic leading-tight group-hover:text-secondary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white shadow-xl rounded-[2.5rem] border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <Target className="h-6 w-6 text-secondary" /> Estado de Recaudación
                </CardTitle>
                <Badge className="bg-secondary font-black uppercase text-[10px]">Meta: $13.5M</Badge>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fondo Real en Banco</p>
                    <p className="text-4xl md:text-5xl font-black text-primary italic">${totalRaised.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-secondary">{progressValue.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={progressValue} className="h-4 rounded-full bg-muted border border-primary/5" />
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(v: number) => `$${v.toLocaleString('es-CL')}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">Asignación de Fondos</h4>
                  {MILESTONES_CATALOG.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", m.color)} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-muted-foreground">{m.title}</span>
                          <span className="text-xs font-black text-primary">{m.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-secondary text-white shadow-xl rounded-[2.5rem] border-none p-6 relative overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
               <Users className="h-10 w-10 mb-4 opacity-50" />
               <p className="text-xs font-bold uppercase tracking-widest opacity-80">Socios Cerrados</p>
               <h3 className="text-5xl font-black italic">{partnersCount}</h3>
               <p className="text-sm mt-2 font-medium opacity-80 italic">De un máximo de 10 socios.</p>
            </Card>

            <Card className="bg-white shadow-xl rounded-[2.5rem] border-primary/10 p-6">
               <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4 text-secondary" /> Socios Confirmados
               </h4>
               <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {loadingPartners ? (
                    <p className="text-xs text-muted-foreground italic">Cargando...</p>
                  ) : partners.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Esperando socios.</p>
                  ) : (
                    partners.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-primary/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">S{i + 1}</div>
                          <span className="text-xs font-black text-primary italic text-muted-foreground">Socio Estratégico #{i + 1}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black border-secondary/20 text-secondary">${(p.amount || 0).toLocaleString('es-CL')}</Badge>
                      </div>
                    ))
                  )}
               </div>
            </Card>
          </div>
        </section>

        {/* Timeline Dinámica */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-primary italic">Cronograma del Proyecto</h2>
            <p className="text-muted-foreground font-medium mt-2">Hitos y avances en tiempo real para nuestros socios.</p>
            <div className="h-1 w-20 bg-secondary mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2 rounded-full hidden sm:block" />
            
            <div className="space-y-12">
              {loadingMilestones ? (
                <div className="text-center py-20 italic text-muted-foreground">Cargando cronograma institucional...</div>
              ) : milestones?.length === 0 ? (
                <div className="text-center py-20 italic text-muted-foreground">No se han registrado hitos oficiales aún.</div>
              ) : (
                milestones?.map((milestone, idx) => (
                  <div key={milestone.id} className={cn(
                    "relative flex flex-col md:flex-row items-center gap-8",
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  )}>
                    {/* Punto de la línea */}
                    <div className="absolute left-8 md:left-1/2 w-6 h-6 rounded-full bg-white border-4 border-primary shadow-lg -translate-x-1/2 z-10 hidden sm:block" />
                    
                    {/* Contenido */}
                    <Card className="flex-1 w-full bg-white shadow-xl border-primary/5 rounded-[2rem] hover:border-secondary/30 transition-all group overflow-hidden">
                      <div className={cn(
                        "h-2 w-full",
                        milestone.status === 'completed' ? "bg-green-500" : "bg-primary"
                      )} />
                      <div className="p-6 md:p-8 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 flex items-center gap-2">
                              <CalendarDays className="h-3 w-3" /> {format(new Date(milestone.date + 'T00:00:00'), "MMMM yyyy", { locale: es }).toUpperCase()}
                            </p>
                            <h3 className="text-xl font-black text-primary italic leading-tight">{milestone.title}</h3>
                          </div>
                          <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'} className={cn(
                            "font-black text-[9px] uppercase",
                            milestone.status === 'completed' ? "bg-green-500" : "text-primary border-primary/20"
                          )}>
                            {milestone.status === 'completed' ? 'Logrado' : 'En Proceso'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">{milestone.description}</p>
                      </div>
                    </Card>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Footer Administrativo para socios */}
        <section className="text-center py-12 border-t border-primary/10">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Contacto Exclusivo Socios</p>
          <p className="text-primary font-black italic text-xl">pcordova@oralab.cl</p>
          <div className="flex justify-center gap-6 mt-8">
             <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground">
               <Building2 className="h-3 w-3 text-secondary" /> Apoquindo 3990, Las Condes.
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground">
               <Target className="h-3 w-3 text-secondary" /> Tresna SpA.
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
