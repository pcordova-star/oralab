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
  CheckCircle2,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  Table as TableIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = ['#1c68b6', '#19cccc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const REMAINING_COLOR = '#e2e8f0'; 
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const { data: investors, isLoading } = useCollection(investorsQuery);

  const totalInvestment = investors?.reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const progressPercentage = Math.min((totalInvestment / FUNDING_GOAL) * 100, 100);
  const remainingCapital = Math.max(0, FUNDING_GOAL - totalInvestment);

  const chartData = [
    ...(investors?.map((inv) => ({
      name: `Inversionista #${inv.investorNumber}`,
      value: inv.amount,
      isInvestor: true
    })) || []),
  ];

  if (remainingCapital > 0) {
    chartData.push({
      name: "Capital por Recaudar",
      value: remainingCapital,
      isInvestor: false
    } as any);
  }

  let tempRemaining = totalInvestment;
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
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold">DASHBOARD ESTRATÉGICO</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital Oralab</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Visualización transparente del financiamiento y aportes que impulsan la tecnología Sunvou® en Chile.
          </p>
        </div>

        <Card className="bg-white shadow-xl rounded-[2.5rem] border-primary/5 mb-12 overflow-hidden">
          <div className="bg-primary/5 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                  <Target className="h-4 w-4 text-secondary" /> Meta de Recaudación
                </div>
                <h2 className="text-3xl font-black text-primary italic">Ronda de Capital</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Progreso de la Ronda</p>
                <div className="text-4xl font-black text-secondary italic">{mounted ? progressPercentage.toFixed(1) : "0"}%</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Progress value={mounted ? progressPercentage : 0} className="h-5 rounded-full bg-slate-200" />
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Recaudado Actual</p>
                  <p className="text-3xl font-black text-primary">{formatCurrency(totalInvestment)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Objetivo Final</p>
                  <p className="text-3xl font-black text-slate-400">{formatCurrency(FUNDING_GOAL)}</p>
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
            <h2 className="text-3xl font-black text-primary italic">Uso de los Fondos</h2>
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
                <Card className="flex-grow bg-white border-none shadow-xl rounded-[2rem] overflow-hidden flex flex-col">
                  <div className={cn("p-8 flex flex-col items-center text-center space-y-6 flex-grow", m.id === 'm1' ? 'bg-blue-50/30' : m.id === 'm2' ? 'bg-cyan-50/30' : 'bg-emerald-50/30')}>
                    <div className={cn("p-4 rounded-2xl bg-white shadow-sm", m.textColor)}>
                      {m.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-primary">{m.title}</h3>
                      <p className={cn("text-2xl font-black", m.textColor)}>{formatCurrency(m.target)}</p>
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
                    <div className="px-8 py-2">
                       <Progress value={mounted ? m.progress : 0} className="h-1.5" />
                    </div>
                    <div className={cn("p-4 text-center text-white font-black uppercase text-[10px] tracking-widest", m.color)}>
                      {m.percentage}% del total {mounted && m.progress === 100 && "• COMPLETADO"}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 bg-primary p-4 rounded-2xl text-center text-white font-black italic shadow-lg">
            TOTAL A LEVANTAR: {formatCurrency(FUNDING_GOAL)} CLP
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-white shadow-xl rounded-[2rem] border-none overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Coins className="h-24 w-24" />
            </div>
            <CardContent className="p-8 space-y-2 relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Capital Vigente</p>
              <h3 className="text-4xl font-black italic">{formatCurrency(totalInvestment)}</h3>
              <p className="text-xs font-bold opacity-60 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> CLP Inversión Privada</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-[2rem] border-primary/5">
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">N° de Aportantes</p>
              <h3 className="text-4xl font-black text-primary italic">{mounted ? (investors?.length || 0) : "0"}</h3>
              <p className="text-xs font-bold text-secondary flex items-center gap-1"><Users className="h-3 w-3" /> Socios Fundadores</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-[2rem] border-primary/5">
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Estado de Ronda</p>
              <h3 className="text-4xl font-black text-secondary italic">ABIERTA</h3>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Rocket className="h-3 w-3" /> Levantamiento I+D</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="bg-white shadow-xl rounded-[2.5rem] border-primary/5 p-8">
            <CardHeader className="p-0 mb-8 text-center">
              <CardTitle className="text-2xl font-black text-primary flex items-center justify-center gap-2 italic">
                <TrendingUp className="h-6 w-6 text-secondary" /> Distribución de Participación
              </CardTitle>
              <CardDescription className="font-medium">Resumen visual de los aportes frente a la meta de {formatCurrency(FUNDING_GOAL)}.</CardDescription>
            </CardHeader>
            <div className="h-[500px] w-full">
              {!mounted || isLoading ? (
                <div className="h-full flex items-center justify-center"><Skeleton className="h-64 w-64 rounded-full" /></div>
              ) : chartData.length > 0 ? (
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
                          fill={entry.isInvestor ? COLORS[index % COLORS.length] : REMAINING_COLOR} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '30px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">No hay aportes registrados.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Sección de Retornos y Operación */}
        <section className="mb-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-primary italic">Proyección de Retornos y Operación</h2>
          </div>

          <Card className="bg-white shadow-xl rounded-[2rem] border-primary/10 overflow-hidden">
            <div className="p-6 bg-primary/5 border-b flex items-center gap-4">
               <AlertCircle className="h-6 w-6 text-secondary animate-pulse" />
               <p className="text-xs font-bold text-primary">
                 IMPORTANTE: Esta información se alimentará en tiempo real una vez que el laboratorio inicie sus funciones comerciales (Julio 2025).
               </p>
            </div>
            <div className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="font-black text-[10px] uppercase pl-8">Fecha de Operación</TableHead>
                    <TableHead className="font-black text-[10px] uppercase">N° de Tests Proyectados</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-right">Recaudación Día (CLP)</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-right pr-8">Status Operativo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-slate-50/50">
                    <TableCell className="pl-8 font-black text-slate-400 italic">15 de Julio, 2025</TableCell>
                    <TableCell className="font-bold text-slate-400">---</TableCell>
                    <TableCell className="text-right font-black text-slate-400">$0</TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge variant="outline" className="bg-slate-100 text-slate-400 border-slate-200">INICIO PROGRAMADO</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                        <Clock className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium italic text-muted-foreground">
                          Esperando inicio de actividades para mostrar el histórico de recaudación.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="p-6 border-t bg-muted/20">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-primary uppercase flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" /> Métricas Proyectadas de Retorno
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El modelo de negocio estima un punto de equilibrio operativo al alcanzar los 40 tests mensuales. Los dividendos se calcularán semestralmente tras el primer año de operación continua.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-primary/10 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-muted-foreground uppercase">Tasa de Retorno Est. (Anual)</p>
                     <p className="text-2xl font-black text-secondary italic">18% - 24%</p>
                   </div>
                   <TrendingUp className="h-8 w-8 text-secondary/30" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        <div className="mt-12 text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-xs font-black text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Última actualización: {getUpdateDate()}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
              <Info className="h-3 w-3 inline mr-1" /> Información financiera y operativa sujeta a cambios según plan de despliegue 2025.
            </p>
          </div>
          <div className="flex justify-center gap-4">
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">Capital Inversión</Badge>
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">Representación Sunvou®</Badge>
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">I+D Salud Digestiva</Badge>
          </div>
        </div>
      </main>
    </div>
  );
}