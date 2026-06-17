
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Target, 
  Rocket, 
  Microscope, 
  Building2, 
  Briefcase, 
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  User,
  MapPin,
  CreditCard,
  Percent,
  HandCoins,
  Mail,
  Banknote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

const COLORS = ['#1c68b6', '#19cccc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const PENDING_COLOR = '#94a3b8';
const REMAINING_COLOR = '#f1f5f9'; 

// Meta Ronda Family & Friends 01
const FUNDING_GOAL = 10800000;
const EQUITY_TOTAL = 8; // 8% total equity para esta fase de capital

const MILESTONES = [
  {
    id: "m1",
    title: "Equipo + Permisos + Logística",
    target: 8100000,
    percentage: 75,
    color: "bg-[#1c68b6]",
    textColor: "text-[#1c68b6]",
    icon: <Microscope className="h-8 w-8" />,
    items: [
      "Analizador Sunvou DA7349",
      "Permisos y certificaciones laboratorio",
      "Logística de importación y puesta en marcha"
    ]
  },
  {
    id: "m3",
    title: "Capital de trabajo inicial",
    target: 2700000,
    percentage: 25,
    color: "bg-[#065f46]",
    textColor: "text-[#065f46]",
    icon: <Briefcase className="h-8 w-8" />,
    items: [
      "Sustentabilidad operativa primeros meses",
      "Stock inicial de insumos diagnósticos",
      "Marketing y lanzamiento clínico"
    ]
  }
];

/**
 * Convierte un número a su representación en palabras (Español).
 */
function numeroALetras(num: number): string {
  const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const DIEZ_DIEZ = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const VEINTE_DIEZ = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const CENTENAS = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function leerTres(n: number): string {
    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) {
      if (c === 1 && d === 0 && u === 0) output += 'cien';
      else if (c === 1) output += 'ciento ';
      else output += CENTENAS[c] + ' ';
    }

    if (d > 0) {
      if (d === 1) output += DIEZ_DIEZ[u];
      else if (d === 2) output += VEINTE_DIEZ[u];
      else {
        output += DECENAS[d];
        if (u > 0) output += ' y ' + UNIDADES[u];
      }
    } else if (u > 0) {
      output += UNIDADES[u];
    }

    return output.trim();
  }

  if (num === 0) return 'cero';
  if (num < 0) return 'menos ' + numeroALetras(Math.abs(num));

  let total = '';
  const millones = Math.floor(num / 1000000);
  const miles = Math.floor((num % 1000000) / 1000);
  const unidades = num % 1000;

  if (millones > 0) {
    if (millones === 1) total += 'un millón ';
    else total += leerTres(millones) + ' millones ';
  }

  if (miles > 0) {
    if (miles === 1) total += 'mil ';
    else total += leerTres(miles) + ' mil ';
  }

  if (unidades > 0) {
    total += leerTres(unidades);
  }

  return total.trim();
}

export default function InvestorsDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const isMobile = useIsMobile();

  // Form State para el contrato
  const [invName, setInvName] = useState("");
  const [invRut, setInvRut] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invAddress, setInvAddress] = useState("");
  const [invAmount, setInvAmount] = useState<number | "">("");

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
    return `$${value.toLocaleString('es-CL')}`;
  };

  const calculateEquity = (amount: number) => {
    return (amount / FUNDING_GOAL) * EQUITY_TOTAL;
  };

  const formatRut = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, "");
    if (!clean) return "";
    const dv = clean.slice(-1).toUpperCase();
    const body = clean.slice(0, -1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return body.length > 0 ? `${formattedBody}-${dv}` : dv;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvRut(formatRut(e.target.value));
  };

  const generateContractPDF = async () => {
    if (!invName || !invRut || !invAddress || !invAmount || !invEmail) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Por favor completa todos los campos para generar tu contrato." });
      return;
    }

    if (db) {
      const equityPct = calculateEquity(Number(invAmount));
      addDocumentNonBlocking(collection(db, "contract_leads"), {
        name: invName,
        rut: invRut,
        email: invEmail,
        address: invAddress,
        amount: Number(invAmount),
        equity: equityPct,
        createdAt: serverTimestamp()
      });
    }

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addText = (text: string, fontSize = 10, isBold = false, align: "left" | "center" | "justify" = "left") => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      if (align === "justify") {
        const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
        doc.text(lines, margin, y);
        y += (lines.length * (fontSize / 2.5)) + 5;
      } else if (align === "center") {
        doc.text(text, pageWidth / 2, y, { align: "center" });
        y += fontSize / 2 + 5;
      } else {
        doc.text(text, margin, y, { align: "left" });
        y += fontSize / 2 + 5;
      }
    };

    const currentDay = format(new Date(), "d");
    const currentMonth = format(new Date(), "MMMM", { locale: es });
    const equityPctStr = calculateEquity(Number(invAmount)).toFixed(4);
    const returnAmount = Number(invAmount) * 0.2;
    const totalReturn = Number(invAmount) + returnAmount;
    const amountInWords = numeroALetras(Number(invAmount));

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 10;

    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${invName}, cédula nacional de identidad N° ${invRut}, domiciliado(a) en ${invAddress}, email ${invEmail}, en adelante el \"Inversionista\".`, 10, false, "justify");
    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${Number(invAmount).toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo y gastos operacionales iniciales.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${Number(invAmount).toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${returnAmount.toLocaleString('es-CL')}).`, 10, false, "justify");
    addText("La suma total se pagará en siete cuotas mensuales iguales y sucesivas entre el mes 6 y el mes 12 contado desde la fecha de aporte, siempre que la unidad de negocio ORALAB cuente con flujo de caja operacional suficiente para ello. En caso de que el flujo disponible no sea suficiente en una fecha de pago determinada, la cuota correspondiente se postergará al mes siguiente en que exista disponibilidad, sin que ello constituya incumplimiento contractual, mora ni genere intereses penales. La Empresa informará al Inversionista de cualquier postergación, indicando la causa y la nueva fecha estimada de pago.", 10, false, "justify");

    addText("QUINTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`Adicionalmente a la devolución del capital y retorno señalado anteriormente, el Inversionista adquirirá una participación económica permanente sobre ORALAB. Las partes acuerdan que el total de la ronda Family & Friends 01 corresponde a una valorización que asigna un 8% de participación económica total a quienes aporten $10.800.000 requeridos.`, 10, false, "justify");
    addText(`La participación económica individual para este aporte se calcula en un ${equityPctStr}% sobre las utilidades de la unidad de negocio ORALAB.`, 10, true, "justify");

    if (y > 250) { doc.addPage(); y = 20; }

    addText("SEXTA: NATURALEZA DE LA PARTICIPACIÓN", 10, true);
    addText("La participación económica otorgada: a) No constituye acciones de TRESNA SpA. b) No otorga calidad de socio ni accionista. c) No concede derecho a voto. d) No concede facultades de administración. e) Corresponde únicamente a un derecho económico asociado a ORALAB.", 10, false, "justify");

    addText("SÉPTIMA: DISTRIBUCIÓN DE UTILIDADES", 10, true);
    addText("Una vez finalizado el período de devolución señalado en la cláusula cuarta, el Inversionista tendrá derecho a recibir anualmente el porcentaje de utilidades distribuibles de ORALAB que corresponda a su participación económica. La determinación de dichas utilidades será realizada por la administración de TRESNA SpA sobre la base de los estados financieros y resultados del negocio.", 10, false, "justify");

    addText("OCTAVA: INFORMACIÓN", 10, true);
    addText("La Empresa enviará al Inversionista un resumen anual de resultados de ORALAB, indicando ingresos, costos, utilidad y monto distribuido.", 10, false, "justify");

    addText("NOVENA: CESIÓN", 10, true);
    addText("La participación económica no podrá ser transferida a terceros.", 10, false, "justify");

    addText("DÉCIMA: VIGENCIA", 10, true);
    addText("La participación económica otorgada mediante este contrato tendrá carácter permanente mientras ORALAB opere como unidad de negocio de TRESNA SpA o de cualquier entidad sucesora que continúe desarrollando dicha actividad.", 10, false, "justify");

    addText("DÉCIMO PRIMERA: JURISDICCIÓN", 10, true);
    addText("Para todos los efectos derivados del presente contrato, las partes fijan domicilio en la comuna de Santiago y se someten a la jurisdicción de sus tribunales ordinarios de justicia.", 10, false, "justify");

    y += 15;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 25;
    doc.line(margin, y, margin + 70, y);
    doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.text("PAULO CÓRDOVA", margin, y);
    doc.text("INVERSIONISTA", pageWidth - margin, y, { align: "right" });
    y += 4;
    doc.text("Representante Legal TRESNA SpA", margin, y);
    doc.text("Nombre: " + invName.toUpperCase(), pageWidth - margin, y, { align: "right" });
    y += 4;
    doc.text("RUT 77.023.697-5", margin, y);
    doc.text("RUT: " + invRut, pageWidth - margin, y, { align: "right" });
    y += 4;
    doc.text("Fecha: " + format(new Date(), "dd/MM/yyyy"), pageWidth - margin, y, { align: "right" });

    doc.save(`Contrato_Oralab_FF01_${invName.replace(/\s+/g, '_')}.pdf`);
    toast({ title: "Documento Generado", description: "Se ha descargado tu borrador de contrato. Por favor envíalo firmado a pcordova@oralab.cl" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">RONDA FAMILY & FRIENDS 01</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital Oralab</h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Visualización transparente del financiamiento que impulsa la tecnología Sunvou® en Chile.
          </p>
        </div>

        {/* 1. Meta y Progreso */}
        <Card className="bg-white shadow-xl rounded-[2rem] md:rounded-[2.5rem] border-primary/5 mb-12 overflow-hidden">
          <div className="bg-primary/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] md:text-xs tracking-widest">
                  <Target className="h-4 w-4 text-secondary" /> Meta Fase Equipamiento (FF01)
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary italic">Recaudación de Capital</h2>
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

        {/* 2. Uso de Fondos */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary/10 p-2 rounded-xl">
              <Rocket className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Uso de los Fondos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className={cn("p-6 md:p-8 flex flex-col items-center text-center space-y-6 flex-grow", m.id === 'm1' ? 'bg-blue-50/30' : 'bg-emerald-50/30')}>
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
                      {m.percentage}% del total FF01 {mounted && m.progress === 100 && "• COMPLETADO"}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Distribución Visual */}
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

        {/* 4. Formalización del Aporte */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Formalización del Aporte</h2>
          </div>

          <Card className="bg-white shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden mb-8">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12 space-y-8 bg-muted/20">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary">Generar Contrato de Participación</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Completa tus datos para generar el contrato de la ronda FF01. La devolución y retorno están sujetos al flujo de caja de ORALAB.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                    <Input placeholder="Ej: Juan Pérez González" value={invName} onChange={(e) => setInvName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT / Identificación</Label>
                      <Input placeholder="12.345.678-9" value={invRut} onChange={handleRutChange} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Correo Electrónico</Label>
                      <Input type="email" placeholder="inversionista@correo.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><HandCoins className="h-4 w-4" /> Monto del Aporte (CLP)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground font-bold">$</span>
                        <Input type="number" placeholder="1.000.000" className="pl-7" value={invAmount} onChange={(e) => setInvAmount(Number(e.target.value) || "")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Domicilio</Label>
                      <Input placeholder="Calle, número, comuna" value={invAddress} onChange={(e) => setInvAddress(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={generateContractPDF} 
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-secondary transition-all font-black text-lg shadow-xl"
                    disabled={!invName || !invAmount || !invEmail}
                  >
                    Generar y Descargar Contrato PDF <Download className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-[10px] text-center font-bold text-muted-foreground italic">
                    * El documento generado debe ser enviado firmado a <span className="text-primary font-black">pcordova@oralab.cl</span>
                  </p>
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                 <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10">
                       <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2 flex items-center gap-1">
                         <Percent className="h-3 w-3" /> Participación Permanente FF01 (Est.)
                       </p>
                       <p className="text-4xl font-black text-primary italic">
                         {invAmount ? calculateEquity(Number(invAmount)).toFixed(4) : "0.0000"}%
                       </p>
                       <p className="text-xs font-medium text-muted-foreground mt-2">Sobre las utilidades de la unidad de negocio Oralab.</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                         <Clock className="h-3 w-3" /> Retorno Proyectado (Mes 6-12)
                       </p>
                       <p className="text-3xl font-black text-primary italic">
                         {invAmount ? formatCurrency(Number(invAmount) * 1.2) : "$0"}
                       </p>
                       <p className="text-xs font-medium text-muted-foreground mt-2">Devolución del capital + 20% según flujo de caja.</p>
                    </div>

                    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200/50">
                       <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Instrucciones de Firma</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              Una vez descargado el contrato, puede firmarlo digitalmente o imprimirlo para firma física. <strong>El documento final debe enviarse a pcordova@oralab.cl</strong>.
                            </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* Datos de Transferencia */}
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payment-data" className="border-none">
                <AccordionTrigger className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-primary/5 rounded-2xl shadow-lg transition-all no-underline hover:no-underline border border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-black text-primary italic">Ver Datos para Depósito / Transferencia</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-white rounded-2xl border border-primary/10 shadow-inner grid gap-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Titular</p>
                        <p className="font-bold text-primary">Tresna SpA</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">RUT</p>
                        <p className="font-bold text-primary">77.023.697-5</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Banco</p>
                        <p className="font-bold text-primary">Itaú</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tipo de Cuenta</p>
                        <p className="font-bold text-primary">Cuenta Corriente</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Número de Cuenta</p>
                      <p className="text-xl font-black text-primary tracking-tighter">0 002 15 07469 6</p>
                    </div>
                    <div className="pt-4 border-t border-dashed">
                      <p className="text-[11px] font-medium text-muted-foreground italic">
                        * Por favor enviar comprobante a <span className="font-bold text-primary">pcordova@oralab.cl</span> indicando el nombre del inversionista.
                      </p>
                    </div>
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* 5. Footer Text */}
        <div className="mt-12 text-center px-4">
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-[10px] md:text-xs font-black text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Última actualización Ronda FF01: {mounted ? format(new Date(), "dd 'de' MMMM, yyyy", { locale: es }) : ""}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-primary max-w-2xl mx-auto leading-relaxed mt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
              * Nota: La participación permanente es sobre utilidades líquidas del negocio. La rentabilidad y devolución de capital dependen de los resultados operacionales reales de la unidad ORALAB.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
