
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { 
  TrendingUp, 
  Target, 
  Rocket, 
  Microscope, 
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
  Banknote,
  ShieldCheck,
  PenTool,
  Building2,
  Sparkles,
  ArrowUpRight,
  Users,
  LayoutDashboard,
  MonitorPlay
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

const COLORS = ['#1c68b6', '#19cccc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const PENDING_COLOR = '#94a3b8';
const REMAINING_COLOR = '#f1f5f9'; 

const FUNDING_GOAL = 10800000;
const EQUITY_TOTAL = 8; 

const MILESTONES = [
  {
    id: "m1",
    title: "Equipo + Importación",
    target: 9102116,
    percentage: 84,
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
    title: "Operación Inicial",
    target: 1697884,
    percentage: 16,
    color: "bg-[#19cccc]",
    textColor: "text-[#19cccc]",
    icon: <Briefcase className="h-8 w-8" />,
    items: [
      "Insumos primeros pacientes",
      "Márgenes de capital de trabajo",
      "Marketing digital lanzamiento"
    ]
  }
];

const MOCK_OPS_DATA = [
  { day: 'Lun', exams: 8, income: 480000 },
  { day: 'Mar', exams: 12, income: 720000 },
  { day: 'Mie', exams: 10, income: 600000 },
  { day: 'Jue', exams: 15, income: 900000 },
  { day: 'Vie', exams: 14, income: 840000 },
  { day: 'Sab', exams: 6, income: 360000 },
];

const MOCK_PATIENTS_TODAY = [
  { time: '08:30', name: 'Claudia R.', test: 'Lactulosa', status: 'completed' },
  { time: '09:15', name: 'Andrés M.', test: 'Fructosa', status: 'in_progress' },
  { time: '10:00', name: 'Sofía G.', test: 'Lactulosa', status: 'arrived' },
  { time: '11:30', name: 'Javier L.', test: 'Lactosa', status: 'pending' },
];

function numeroALetras(num: number): string {
  const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const DIEZ_DIEZ = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'diecinueve'];
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
    } else if (u > 0) output += UNIDADES[u];
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
  if (unidades > 0) total += leerTres(unidades);
  return total.trim();
}

export default function InvestorsDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const isMobile = useIsMobile();

  // Form State
  const [invName, setInvName] = useState("");
  const [invRut, setInvRut] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invAddress, setInvAddress] = useState("");
  const [invAmount, setInvAmount] = useState<number | "">("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const totalPercentage = Math.min((totalInvestment / FUNDING_GOAL) * 100, 100);
  const remainingCapital = Math.max(0, FUNDING_GOAL - totalInvestment);

  const chartData = [
    ...(investors?.map((inv, index) => ({
      name: `Inversionista #${inv.investorNumber}`,
      value: inv.amount,
      status: inv.status || 'confirmed',
      color: inv.status === 'pending' ? PENDING_COLOR : COLORS[index % COLORS.length]
    })) || []),
  ];

  if (remainingCapital > 0) {
    chartData.push({
      name: "Disponible",
      value: remainingCapital,
      status: 'available',
      color: REMAINING_COLOR
    } as any);
  }

  const formatCurrency = (value: number) => {
    if (!mounted) return `$0`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const calculateEquity = (amount: number) => {
    return (amount / FUNDING_GOAL) * EQUITY_TOTAL;
  };

  const handleFormalize = async () => {
    if (!invName || !invRut || !invAddress || !invAmount || !invEmail || !isAgreed) {
      toast({ variant: "destructive", title: "Campos incompletos" });
      return;
    }
    setIsSubmitting(true);
    if (db) {
      const equityPct = calculateEquity(Number(invAmount));
      try {
        await addDocumentNonBlocking(collection(db, "contract_leads"), {
          name: invName,
          rut: invRut,
          email: invEmail,
          address: invAddress,
          amount: Number(invAmount),
          equity: equityPct,
          status: "signed_by_investor",
          investorSignedAt: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            ip: "Validada por Sistema"
          },
          createdAt: serverTimestamp()
        });
        toast({ title: "Firma Registrada", description: "Tu contrato ha sido enviado para validación final." });
        setInvName("");
        setInvRut("");
        setInvEmail("");
        setInvAddress("");
        setInvAmount("");
        setIsAgreed(false);
      } catch (e) {
        toast({ variant: "destructive", title: "Error" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const generatePDF = () => {
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
        y += (lines.length * (fontSize / 2.5)) + 4;
      } else if (align === "center") {
        doc.text(text, pageWidth / 2, y, { align: "center" });
        y += fontSize / 2 + 5;
      } else {
        doc.text(text, margin, y);
        y += fontSize / 2 + 5;
      }
    };

    const currentDay = format(new Date(), "d");
    const currentMonth = format(new Date(), "MMMM", { locale: es });
    const amountInWords = numeroALetras(Number(invAmount));
    const returnAmount = Number(invAmount) * 0.2;

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;

    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${invName}, cédula nacional de identidad N° ${invRut}, domiciliado(a) en ${invAddress}, email ${invEmail}, en adelante el \"Inversionista\".`, 10, false, "justify");
    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio. y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${Number(invAmount).toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo y gastos operacionales iniciales.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${Number(invAmount).toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${returnAmount.toLocaleString('es-CL')}).`, 10, false, "justify");
    addText("La suma total se pagará en siete cuotas mensuales iguales y sucesivas entre el mes 6 y el mes 12 contado desde la fecha de aporte, siempre que la unidad de negocio ORALAB cuente con flujo de caja operacional suficiente para ello. En caso de que el flujo disponible no sea suficiente en una fecha de pago determinada, la cuota correspondiente se postergará al mes siguiente en que exista disponibilidad, sin que ello constituya incumplimiento contractual, mora ni genere intereses penales. Se establece un plazo máximo para estas postergaciones de hasta 12 meses adicionales posteriores a los 12 meses mencionados al inicio de este párrafo. La Empresa informará al Inversionista de cualquier postergación.", 10, false, "justify");

    if (y > 250) { doc.addPage(); y = 20; }

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes a los inversionistas de la Ronda Family & Friends 01, el equipo Sunvou DA7349 adquirido con fondos de esta ronda no podrá ser vendido, transferido, dado en garantía a terceros, ni sujeto a cualquier gravamen, sin autorización escrita de la mayoría de dichos inversionistas. En caso de cese de operaciones de ORALAB, liquidación de sus activos, o venta del equipo señalado, el producto de dicha venta o liquidación se destinará prioritariamente al pago de los saldos pendientes.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`Adicionalmente a la devolución del capital y retorno señalado anteriormente, el Inversionista adquirirá una participación económica permanente sobre ORALAB. Las partes acuerdan que el total de la ronda Family & Friends 01 corresponde a una valorización que asigna un 8% de participación económica total a quienes aporten $10.800.000 requeridos. La participación económica individual para este aporte se calcula en un ${calculateEquity(Number(invAmount)).toFixed(4)}% sobre las utilidades de la unidad de negocio ORALAB.`, 10, false, "justify");

    addText("SÉPTIMA: NATURALEZA DE LA PARTICIPACIÓN", 10, true);
    addText("La participación económica otorgada: a) No constituye acciones de TRESNA SpA. b) No otorga calidad de socio ni accionista. c) No concede derecho a voto. d) No concede facultades de administración. e) Corresponde únicamente a un derecho económico asociado a ORALAB.", 10, false, "justify");

    addText("OCTAVA: DISTRIBUCIÓN DE UTILIDADES", 10, true);
    addText("Una vez finalizado el período de devolución, el Inversionista tendrá derecho a recibir anualmente el porcentaje de utilidades distribuibles de ORALAB. Se entenderá por “utilidades distribuibles” los ingresos percibidos directamente atribuibles a la operación del laboratorio, deducidos los costos directos e indirectos. No se podrán imputar gastos corporativos generales de TRESNA SpA ajenos al laboratorio.", 10, false, "justify");

    if (y > 250) { doc.addPage(); y = 20; }

    addText("NOVENA: INFORMACIÓN", 10, true);
    addText("TRESNA SpA entregará al Inversionista un reporte trimestral de resultados de ORALAB, dentro de los 30 días siguientes al cierre de cada trimestre calendario.", 10, false, "justify");

    addText("DÉCIMA: CESIÓN", 10, true);
    addText("La participación económica no podrá ser transferida a terceros.", 10, false, "justify");

    addText("DÉCIMO PRIMERA: VIGENCIA", 10, true);
    addText("La participación económica tendrá carácter permanente mientras ORALAB opere como unidad de negocio de TRESNA SpA. En caso de enajenación del negocio, el adquirente deberá subrogarse en las obligaciones.", 10, false, "justify");

    addText("DÉCIMO SEGUNDA: JURISDICCIÓN", 10, true);
    addText("Para todos los efectos derivados del presente contrato, las partes fijan domicilio en la comuna de Santiago y se someten a la jurisdicción de sus tribunales ordinarios de justicia.", 10, false, "justify");

    y += 10;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 15;
    const signatureY = y + 25;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.setFontSize(8);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.text("Representante Legal TRESNA SpA", margin, signatureY + 9);

    doc.line(pageWidth - margin - 75, signatureY, pageWidth - margin, signatureY);
    doc.text("INVERSIONISTA", pageWidth - margin, signatureY + 5, { align: "right" });
    doc.text(invName.toUpperCase(), pageWidth - margin, signatureY + 9, { align: "right" });

    doc.save(`Borrador_Contrato_Oralab_${invName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">RONDA FAMILY & FRIENDS 01</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital Oralab</h1>
        </div>

        <Card className="bg-white shadow-xl rounded-[2rem] border-primary/5 mb-12 overflow-hidden">
          <div className="bg-primary/5 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-primary italic">Recaudación de Capital</h2>
              <div className="text-center md:text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Meta Global: {formatCurrency(FUNDING_GOAL)}</p>
                <div className="text-3xl md:text-4xl font-black text-secondary italic">{mounted ? totalPercentage.toFixed(1) : "0"}%</div>
              </div>
            </div>
            <Progress value={mounted ? totalPercentage : 0} className="h-4" />
          </div>
        </Card>

        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl"><FileText className="h-6 w-6 text-primary" /></div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Formalización del Aporte</h2>
          </div>
          <Card className="bg-white shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden">
            <div className="p-8 lg:p-12 space-y-10">
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-primary italic">Suscribir Contrato de Participación</h3>
                <p className="text-sm text-muted-foreground">
                  Completa tus datos para formalizar digitalmente. Tu <strong>Firma Electrónica Simple (FES)</strong> es vinculante. Luego, Paulo Córdova suscribirá mediante <strong>Firma Electrónica Avanzada (FEA)</strong>.
                </p>
              </div>

              <div className="grid gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                    <Input placeholder="Ej: Juan Pérez" value={invName} onChange={(e) => setInvName(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT</Label>
                    <Input placeholder="12.345.678-9" value={invRut} onChange={(e) => setInvRut(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] border border-primary/10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4 space-y-3">
                      <Label className="font-black flex items-center gap-2 text-primary">
                        <HandCoins className="h-5 w-5 text-secondary" /> Monto Aporte (CLP)
                      </Label>
                      <Input type="number" className="h-16 rounded-2xl text-2xl font-black" value={invAmount} onChange={(e) => setInvAmount(Number(e.target.value) || "")} />
                    </div>
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <AnimatePresence mode="wait">
                        <motion.div key={invAmount ? 'e' : 'n'} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-lg">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Sparkles className="h-3 w-3 text-secondary" /> Participación Est.</p>
                          <p className="text-3xl font-black text-primary italic">{invAmount ? calculateEquity(Number(invAmount)).toFixed(4) : "0.0000"}%</p>
                        </motion.div>
                        <motion.div key={invAmount ? 'r' : 'm'} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-primary text-white p-6 rounded-2xl shadow-lg">
                          <p className="text-[10px] font-black text-white/70 uppercase flex items-center gap-1"><Clock className="h-3 w-3 text-secondary" /> Retorno Proyectado</p>
                          <p className="text-2xl font-black italic">{invAmount ? formatCurrency(Number(invAmount) * 1.2) : "$0"}</p>
                        </motion.div>
                       </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-primary/10">
                  <div className="flex items-start space-x-3 bg-blue-50/30 p-5 rounded-2xl">
                    <Checkbox id="terms" checked={isAgreed} onCheckedChange={(v) => setIsAgreed(!!v)} className="mt-1" />
                    <label htmlFor="terms" className="text-xs font-medium text-primary/70 cursor-pointer">
                      Yo, <span className="font-black text-primary underline">{invName || "_________________"}</span>, declaro mi voluntad de suscribir este contrato mediante <strong>Firma Electrónica Simple</strong>.
                    </label>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" onClick={generatePDF} className="h-16 flex-1 rounded-2xl font-bold" disabled={!invName || !invAmount}>
                      <Download className="mr-2 h-5 w-5" /> Revisar Borrador
                    </Button>
                    <Button onClick={handleFormalize} className="h-16 flex-[2] rounded-2xl bg-primary hover:bg-secondary font-black text-xl shadow-2xl" disabled={!invName || !invAmount || !isAgreed || isSubmitting}>
                      {isSubmitting ? "Procesando..." : "Firmar y Formalizar Aporte"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Simulador Operacional */}
        <section className="mt-32 mb-16 space-y-12">
          <div className="border-b border-primary/20 pb-6">
            <Badge className="bg-secondary text-primary font-black uppercase text-[10px] mb-2">Simulación en Vivo</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-primary italic">Live ROI & Seguimiento</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Consultas Mes", value: "142", icon: <Users className="h-5 w-5" />, color: "text-blue-600" },
                  { label: "Ocupación Sala", value: "85%", icon: <MonitorPlay className="h-5 w-5" />, color: "text-emerald-600" },
                  { label: "Ingreso Bruto Est.", value: "$8.520.000", icon: <ArrowUpRight className="h-5 w-5" />, color: "text-primary" },
                ].map((stat, i) => (
                  <Card key={i} className="bg-white border-primary/5 shadow-lg rounded-2xl p-6">
                    <div className={cn("p-2 rounded-lg bg-slate-50 w-fit mb-4", stat.color)}>{stat.icon}</div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{stat.label}</p>
                    <p className={cn("text-2xl font-black italic", stat.color)}>{stat.value}</p>
                  </Card>
                ))}
                <Card className="sm:col-span-3 bg-white p-8 rounded-[2rem]">
                   <div className="flex justify-between mb-8">
                      <h3 className="font-black text-primary italic flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary" /> Flujo Diario</h3>
                      <Select defaultValue="week">
                         <SelectTrigger className="w-[140px] rounded-full h-8"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Mes Pasado</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_OPS_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <YAxis axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} hide={isMobile} />
                          <ChartTooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                          <Bar dataKey="exams" fill="#1c68b6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                </Card>
             </div>
             <div className="lg:col-span-4">
                <Card className="bg-primary text-white shadow-2xl rounded-[2rem] h-full flex flex-col overflow-hidden border-none">
                   <div className="p-8 border-b border-white/10">
                      <h3 className="text-xl font-black italic flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-secondary" /> Agenda Hoy</h3>
                   </div>
                   <div className="flex-grow p-4 space-y-3">
                      {MOCK_PATIENTS_TODAY.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                           <span className="text-xs font-black text-secondary font-mono">{p.time}</span>
                           <span className="text-sm font-bold">{p.name}</span>
                           <Badge className="bg-white/10 text-[8px]">{p.status === 'completed' ? 'Listo' : 'En Test'}</Badge>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
