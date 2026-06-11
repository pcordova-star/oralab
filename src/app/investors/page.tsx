
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Target, 
  Rocket, 
  Microscope, 
  Building2, 
  Briefcase, 
  ChevronRight,
  Info,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = ['#1c68b6', '#19cccc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const PENDING_COLOR = '#94a3b8';
const REMAINING_COLOR = '#f1f5f9'; 
const FUNDING_GOAL = 13500000;

const MILESTONES = [
  {
    id: "m1",
    title: "Equipo + importación",
    target: 9102116,
    percentage: 67,
    color: "bg-[#1c68b6]",
    textColor: "text-[#1c68b6]",
    icon: <Microscope className="h-8 w-8" />,
    items: [
      "Sunvou DA7349 FOB China: $6.734.600",
      "Logística importación (flete, seguro, arancel): $968.860",
      "IVA 19% importación (recuperable): $1.398.656"
    ]
  },
  {
    id: "m2",
    title: "Habilitación consulta",
    target: 1300000,
    percentage: 10,
    color: "bg-[#19cccc]",
    textColor: "text-[#19cccc]",
    icon: <Building2 className="h-8 w-8" />,
    items: [
      "Revestimiento vinílico piso y muro",
      "Televisión sala de espera",
      "Lavamanos portátil"
    ]
  },
  {
    id: "m3",
    title: "Capital de trabajo",
    target: 3097884,
    percentage: 23,
    color: "bg-[#065f46]",
    textColor: "text-[#065f46]",
    icon: <Briefcase className="h-8 w-8" />,
    items: [
      "Gastos operacionales primeros 3 meses",
      "Respaldo hasta completar $13.5M"
    ]
  }
];

export default function InvestorsDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const { data: investors, isLoading } = useCollection(investorsQuery);

  const totalConfirmed = investors?.filter(i => i.status !== "pending").reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const totalPending = investors?.filter(i => i.status === "pending").reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const totalInvestment = totalConfirmed + totalPending;

  const confirmedPercentage = Math.min((totalConfirmed / FUNDING_GOAL) * 100, 100);
  const pendingPercentage = Math.min((totalPending / FUNDING_GOAL) * 100, 100);
  const totalPercentage = Math.min((totalInvestment / FUNDING_GOAL) * 100, 100);
  const remainingCapital = Math.max(0, FUNDING_GOAL - totalInvestment);

  const chartData = [
    ...(investors?.map((inv, index) => ({
      name: `Inversionista #${inv.investorNumber}${inv.status === 'pending' ? ' (Por Confirmar)' : ''}`,
      value: inv.amount,
      status: inv.status || 'confirmed',
      color: inv.status === 'pending' ? PENDING_COLOR : COLORS[index % COLORS.length]
    })) || []),
  ];

  if (remainingCapital > 0) {
    chartData.push({
      name: "Disponible para Ronda",
      value: remainingCapital,
      status: 'available',
      color: REMAINING_COLOR
    } as any);
  }

  let tempRemaining = totalConfirmed;
  const milestonesWithProgress = MILESTONES.map(m => {
    const funded = Math.min(tempRemaining, m.target);
    tempRemaining = Math.max(0, tempRemaining - m.target);
    const progress = (funded / m.target) * 100;
    return { ...m, funded, progress };
  });

  const formatCurrency = (value: number) => {
    if (!mounted) return `$0`;
    return `$${value.toLocaleString()}`;
  };

  const getUpdateDate = () => {
    if (!mounted) return "";
    return format(new Date(), "dd 'de' MMMM, yyyy", { locale: es });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">DASHBOARD ESTRATÉGICO</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital Oralab</h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Visualización transparente del financiamiento y aportes que impulsan la tecnología Sunvou® en Chile.
          </p>
        </div>

        <Card className="bg-white shadow-xl rounded-[2rem] md:rounded-[2.5rem] border-primary/5 mb-12 overflow-hidden">
          <div className="bg-primary/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] md:text-xs tracking-widest">
                  <Target className="h-4 w-4 text-secondary" /> Meta de Recaudación
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary italic">Ronda de Levantamiento</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Estado de la Ronda</p>
                <div className="text-3xl md:text-4xl font-black text-secondary italic">
                  {mounted ? totalPercentage.toFixed(1) : "0"}%
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative h-4 md:h-5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${confirmedPercentage}%` }}
                   className="absolute h-full bg-primary z-20"
                 />
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${confirmedPercentage + pendingPercentage}%` }}
                   className="absolute h-full bg-primary/30 z-10"
                 />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Recaudado (Confirmado)
                  </p>
                  <p className="text-xl md:text-3xl font-black text-primary">{formatCurrency(totalConfirmed)}</p>
                </div>
                <div className="text-left md:text-right space-y-1">
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase flex items-center md:justify-end gap-1">
                    <AlertCircle className="h-3 w-3 text-primary/40" /> Comprometido (Por Confirmar)
                  </p>
                  <p className="text-xl md:text-3xl font-black text-primary/40">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary/10 p-2 rounded-xl">
              <Rocket className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Uso de los Fondos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {milestonesWithProgress.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col"
              >
                <Card className="flex-grow bg-white border-none shadow-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col">
                  <div className={cn("p-6 md:p-8 flex flex-col items-center text-center space-y-6 flex-grow", m.id === 'm1' ? 'bg-blue-50/30' : m.id === 'm2' ? 'bg-cyan-50/30' : 'bg-emerald-50/30')}>
                    <div className={cn("p-4 rounded-2xl bg-white shadow-sm", m.textColor)}>
                      {m.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-primary">{m.title}</h3>
                      <p className={cn("text-xl md:text-2xl font-black", m.textColor)}>{formatCurrency(m.target)}</p>
                    </div>
                    
                    <ul className="text-left w-full space-y-3">
                      {m.items.map((item, i) => (
                        <li key={i} className="text-xs font-medium text-muted-foreground flex items-start gap-2">
                          <ChevronRight className={cn("h-3 w-3 mt-0.5 shrink-0", m.textColor)} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="px-6 md:px-8 py-2">
                       <Progress value={mounted ? m.progress : 0} className="h-1.5" />
                    </div>
                    <div className={cn("p-4 text-center text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest", m.color)}>
                      {m.percentage}% del total {mounted && m.progress === 100 && "• COMPLETADO"}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="bg-white shadow-xl rounded-[2rem] md:rounded-[2.5rem] border-primary/5 p-4 md:p-8">
            <CardHeader className="p-4 md:p-0 mb-6 md:mb-8 text-center">
              <CardTitle className="text-xl md:text-2xl font-black text-primary flex items-center justify-center gap-2 italic">
                <TrendingUp className="h-6 w-6 text-secondary" /> Distribución de Participación
              </CardTitle>
              <CardDescription className="font-medium text-xs md:text-sm">Resumen de aportes frente a la meta de {formatCurrency(FUNDING_GOAL)}.</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              {!mounted || isLoading ? (
                <div className="h-[300px] md:h-[500px] flex items-center justify-center">
                  <Skeleton className="h-48 md:h-64 w-48 md:w-64 rounded-full" />
                </div>
              ) : chartData.length > 0 ? (
                <div className="w-full">
                  {isMobile ? (
                    <div className="overflow-hidden rounded-2xl border border-primary/5">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="font-black text-[9px] uppercase pl-4">Folio</TableHead>
                            <TableHead className="font-black text-[9px] uppercase">Estado</TableHead>
                            <TableHead className="font-black text-[9px] uppercase text-right pr-4">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.filter(e => e.status !== 'available').map((entry: any, index: number) => (
                            <TableRow key={`row-${index}`} className="hover:bg-primary/5 transition-colors">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                  <span className="font-bold text-[11px] text-primary">{entry.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 border-none",
                                  entry.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                                )}>
                                  {entry.status === "pending" ? "Por Confirmar" : "Confirmado"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-black text-[11px] text-primary pr-4">
                                {formatCurrency(entry.value)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={100}
                            outerRadius={160}
                            paddingAngle={8}
                            dataKey="value"
                            label={({ value }) => formatCurrency(value)}
                          >
                            {chartData.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                strokeWidth={entry.status === 'pending' ? 2 : 0}
                                stroke={entry.status === 'pending' ? '#fff' : 'none'}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number, name: string) => [formatCurrency(value), name]}
                          />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '30px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">No hay aportes registrados.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="mb-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Proyección de Retornos y Operación</h2>
          </div>

          <Card className="bg-white shadow-xl rounded-[1.5rem] md:rounded-[2rem] border-primary/10 overflow-hidden">
            <div className="p-5 md:p-6 bg-primary/5 border-b flex items-center gap-4">
               <AlertCircle className="h-5 md:h-6 w-5 md:w-6 text-secondary animate-pulse shrink-0" />
               <p className="text-[10px] md:text-xs font-bold text-primary leading-tight">
                 IMPORTANTE: Esta información se alimentará en tiempo real una vez que el laboratorio inicie sus funciones comerciales (Julio 2025).
               </p>
            </div>
            <div className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase pl-6 md:pl-8">Fecha Operación</TableHead>
                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase">Tests Proyectados</TableHead>
                    <TableHead className="font-black text-[9px] md:text-[10px] uppercase text-right">Recaudación (CLP)</TableHead>
                    <TableHead className="text-right font-black text-[9px] md:text-[10px] uppercase pr-6 md:pr-8">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-slate-50/50">
                    <TableCell className="pl-6 md:pl-8 font-black text-slate-400 italic text-xs">15 Julio, 2025</TableCell>
                    <TableCell className="font-bold text-slate-400 text-xs">---</TableCell>
                    <TableCell className="text-right font-black text-slate-400 text-xs">$0</TableCell>
                    <TableCell className="text-right pr-6 md:pr-8">
                      <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200 text-[9px] md:text-xs">INICIO PROGRAMADO</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 md:py-20">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <Clock className="h-8 md:h-10 w-8 md:w-10 text-muted-foreground" />
                        <p className="text-xs md:text-sm font-medium italic text-muted-foreground px-4">
                          Esperando inicio de actividades para mostrar el histórico de recaudación.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        <div className="mt-12 text-center px-4">
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-[10px] md:text-xs font-black text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Última actualización: {getUpdateDate()}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-primary max-w-2xl mx-auto leading-relaxed mt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
              * Dividendo anual estimado en régimen (10 pac/día). Año 1: capital + 20% en cuotas mes 6–12. Desde año 2: % del negocio genera dividendos permanentes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
