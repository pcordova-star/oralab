
"use client";

import { Navbar } from "@/components/navbar";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { Coins, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#1c68b6', '#19cccc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function InvestorsDashboardPage() {
  const db = useFirestore();

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const { data: investors, isLoading } = useCollection(investorsQuery);

  const totalInvestment = investors?.reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;

  const chartData = investors?.map((inv) => ({
    name: `Inversionista #${inv.investorNumber}`,
    value: inv.amount
  })) || [];

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold">DASHBOARD ESTRATÉGICO</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital Oralab</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Visualización transparente del financiamiento y aportes que impulsan la tecnología Sunvou® en Chile.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-white shadow-xl rounded-[2rem] border-none overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Coins className="h-24 w-24" />
            </div>
            <CardContent className="p-8 space-y-2 relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Inversión Total</p>
              <h3 className="text-4xl font-black italic">${totalInvestment.toLocaleString()}</h3>
              <p className="text-xs font-bold opacity-60 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> CLP Capital Semilla</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-[2rem] border-primary/5">
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">N° de Aportantes</p>
              <h3 className="text-4xl font-black text-primary italic">{investors?.length || 0}</h3>
              <p className="text-xs font-bold text-secondary flex items-center gap-1"><Users className="h-3 w-3" /> Socios Estratégicos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-[2rem] border-primary/5">
            <CardContent className="p-8 space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Estado</p>
              <h3 className="text-4xl font-black text-secondary italic">ACTIVO</h3>
              <p className="text-xs font-bold text-muted-foreground">Ronda de Financiamiento</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Gráfico de Proporciones */}
          <Card className="bg-white shadow-xl rounded-[2.5rem] border-primary/5 p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" /> Distribución de Participación
              </CardTitle>
            </CardHeader>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Skeleton className="h-64 w-64 rounded-full" /></div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Aporte']}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">No hay aportes registrados.</div>
              )}
            </div>
          </Card>

          {/* Listado Anonimizado */}
          <Card className="bg-white shadow-xl rounded-[2.5rem] border-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b">
              <CardTitle className="text-xl font-black text-primary">Detalle de Aportes</CardTitle>
              <CardDescription className="font-medium">Identificación por número de folio para proteger privacidad.</CardDescription>
            </CardHeader>
            <div className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-black text-[10px] uppercase pl-8">Identificador</TableHead>
                    <TableHead className="font-black text-[10px] uppercase text-right pr-8">Monto CLP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-12"><Skeleton className="h-4 w-full mx-auto" /></TableCell></TableRow>
                  ) : investors?.map((inv, idx) => (
                    <TableRow key={inv.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="pl-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                            #{inv.investorNumber}
                          </div>
                          <span className="font-black text-primary italic">Inversionista #{inv.investorNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <span className="text-xl font-black text-primary">${(inv.amount || 0).toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {investors?.length === 0 && (
                    <TableRow><TableCell colSpan={2} className="text-center py-20 text-muted-foreground italic">Esperando primeros inversionistas.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 italic">* Información técnica sujeta a auditoría interna Oralab.</p>
          <div className="flex justify-center gap-4">
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">Capital Semilla</Badge>
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">Representación Sunvou®</Badge>
             <Badge variant="outline" className="rounded-full bg-white border-primary/10 py-1 px-3">I+D Salud Digestiva</Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
