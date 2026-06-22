
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
  MonitorPlay,
  RotateCcw
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
const FUNDING_GOAL = 13500000;
const EQUITY_TOTAL = 10; 

const MILESTONES = [
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

const MOCK_OPS_DATA = [
  { day: 'Lun', exams: 8 },
  { day: 'Mar', exams: 12 },
  { day: 'Mie', exams: 10 },
  { day: 'Jue', exams: 15 },
  { day: 'Vie', exams: 14 },
  { day: 'Sab', exams: 6 },
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

function formatRut(value: string) {
  let rut = value.replace(/\./g, "").replace("-", "");
  if (!rut) return "";
  const dv = rut.slice(-1);
  const cuerpo = rut.slice(0, -1);
  const cuerpoFormateado = cuerpo.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return cuerpo.length > 0 ? `${cuerpoFormateado}-${dv}` : dv;
}

function formatCurrencyInput(value: string) {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return parseInt(numericValue).toLocaleString('es-CL');
}

export default function InvestorsDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();
  const isMobile = useIsMobile();

  const [invName, setInvName] = useState("");
  const [invRut, setInvRut] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invAddress, setInvAddress] = useState("");
  const [invAmount, setInvAmount] = useState<number>(0);
  const [invAmountDisplay, setInvAmountDisplay] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const { data: investors } = useCollection(investorsQuery);

  const totalConfirmed = investors?.filter(i => i.status !== "pending").reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const totalPending = investors?.filter(i => i.status === "pending").reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const totalInvestment = totalConfirmed + totalPending;

  const totalPercentage = Math.min((totalInvestment / FUNDING_GOAL) * 100, 100);
  const remainingCapital = Math.max(0, FUNDING_GOAL - totalInvestment);

  const formatCurrency = (value: number) => {
    if (!mounted) return `$0`;
    return `$${value.toLocaleString('es-CL')}`;
  };

  const calculateEquity = (amount: number) => {
    return (amount / FUNDING_GOAL) * EQUITY_TOTAL;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    if (formatted.length <= 12) setInvRut(formatted);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numeric = raw ? parseInt(raw) : 0;
    setInvAmount(numeric);
    setInvAmountDisplay(formatCurrencyInput(e.target.value));
  };

  const handleFormalize = async () => {
    if (!invName) { toast({ variant: "destructive", title: "Falta Nombre Completo" }); return; }
    if (!invRut) { toast({ variant: "destructive", title: "Falta RUT" }); return; }
    if (!invEmail) { toast({ variant: "destructive", title: "Falta Email" }); return; }
    if (!invAddress) { toast({ variant: "destructive", title: "Falta Dirección" }); return; }
    if (!invAmount) { toast({ variant: "destructive", title: "Falta Monto de Aporte" }); return; }
    if (!isAgreed) { toast({ variant: "destructive", title: "Debes marcar la casilla de aceptación" }); return; }
    
    setIsSubmitting(true);
    if (db) {
      const equityPct = calculateEquity(invAmount);
      try {
        await addDocumentNonBlocking(collection(db, "contract_leads"), {
          name: invName,
          rut: invRut,
          email: invEmail,
          address: invAddress,
          amount: invAmount,
          equity: equityPct,
          status: "signed_by_investor",
          investorSignedAt: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            ip: "Validada por Sistema FES"
          },
          createdAt: serverTimestamp()
        });
        toast({ title: "Firma Registrada", description: "Tu compromiso ha sido enviado a la administración." });
        setInvName(""); setInvRut(""); setInvEmail(""); setInvAddress(""); setInvAmount(0); setInvAmountDisplay(""); setIsAgreed(false);
      } catch (e) {
        toast({ variant: "destructive", title: "Error al guardar" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const checkPage = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addText = (text: string, fontSize = 10, isBold = false, align: "left" | "center" | "justify" = "left") => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      
      if (align === "justify") {
        const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
        const estimatedHeight = lines.length * (fontSize / 2.5) + 4;
        checkPage(estimatedHeight);
        doc.text(lines, margin, y);
        y += estimatedHeight;
      } else if (align === "center") {
        checkPage(fontSize / 2 + 5);
        doc.text(text, pageWidth / 2, y, { align: "center" });
        y += fontSize / 2 + 5;
      } else {
        checkPage(fontSize / 2 + 5);
        doc.text(text, margin, y);
        y += fontSize / 2 + 5;
      }
    };

    const currentDay = format(new Date(), "d");
    const currentMonth = format(new Date(), "MMMM", { locale: es });
    const amountInWords = numeroALetras(invAmount || 0);
    const returnAmount = (invAmount || 0) * 0.2;

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;
    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, en adelante \"TRESNA\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${invName || '________________'}, RUT N° ${invRut || '___________'}, domiciliado(a) en ${invAddress || '__________________________________'}, email ${invEmail || '___________'}, en adelante el \"Inversionista\".`, 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA. La Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${(invAmount || 0).toLocaleString('es-CL')} (${amountInWords} pesos).`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo inicial.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${(invAmount || 0).toLocaleString('es-CL')}), y b) un retorno adicional del 20% ($${returnAmount.toLocaleString('es-CL')}). Se establece un plazo máximo para postergaciones de hasta 12 meses adicionales posteriores a los 12 meses mencionados al inicio de este párrafo.`, 10, false, "justify");

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes, el equipo Sunvou DA7349 no podrá ser vendido ni transferido sin autorización de los inversionistas.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`El Inversionista adquirirá una participación económica permanente sobre ORALAB del ${calculateEquity(invAmount || 0).toFixed(4)}% sobre las utilidades, calculada sobre la meta total de $13.500.000 para un 10% total de la ronda.`, 10, false, "justify");

    addText("SÉPTIMA: INFORMACIÓN Y TRANSPARENCIA", 10, true);
    addText("La Empresa se compromete a mantener un sistema de información digital (Dashboard) donde el Inversionista podrá consultar en tiempo real el flujo de pacientes y el rendimiento operacional de la unidad Oralab.", 10, false, "justify");

    addText("OCTAVA: PLAZOS DE PAGO", 10, true);
    addText("El pago de las utilidades correspondientes a la participación económica se realizará de forma trimestral, dentro de los primeros 15 días del mes siguiente al cierre de cada trimestre calendario.", 10, false, "justify");

    addText("NOVENA: NATURALEZA DEL ACUERDO", 10, true);
    addText("El presente instrumento constituye un contrato de financiamiento con participación económica sobre los flujos de una unidad de negocio específica, y no otorga al Inversionista la calidad de socio accionista de TRESNA SpA ni responsabilidad sobre sus deudas legales.", 10, false, "justify");

    addText("DÉCIMA: CONFIDENCIALIDAD", 10, true);
    addText("Las partes se obligan a mantener estricta reserva sobre los términos de este contrato y sobre la información técnica y comercial de Oralab a la que tengan acceso.", 10, false, "justify");

    addText("UNDÉCIMA: DOMICILIO Y COMPETENCIA", 10, true);
    addText("Para todos los efectos legales, las partes fijan su domicilio en la ciudad y comuna de Santiago y se someten a la jurisdicción de sus Tribunales Ordinarios de Justicia.", 10, false, "justify");

    addText("DUODÉCIMA: PERSONERÍA", 10, true);
    addText("La personería de don PAULO CÓRDOVA para representar a TRESNA SpA consta en la escritura pública de constitución de la sociedad.", 10, false, "justify");

    addText("DÉCIMO TERCERA: DERECHO DE PREFERENCIA", 10, true);
    addText("En el evento de que TRESNA SpA decida la apertura de nuevas sucursales de la unidad de negocio ORALAB que requieran financiamiento externo, o se acuerden nuevas rondas de levantamiento de capital, los inversionistas suscritos a la presente ronda Family & Friends 01 tendrán un derecho preferente para participar en dichas instancias, en igualdad de condiciones comerciales que se ofrezcan a terceros.", 10, false, "justify");

    y += 10;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 15;
    const signatureY = y + 25;
    checkPage(30);
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.line(pageWidth - margin - 75, signatureY, pageWidth - margin, signatureY);
    doc.text("INVERSIONISTA", pageWidth - margin, signatureY + 5, { align: "right" });

    doc.save(`Borrador_Contrato_Oralab_${invName.replace(/\s+/g, '_') || 'Nuevo_Socio'}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">RONDA FAMILY & FRIENDS 01</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital FF01</h1>
        </div>

        <Card className="bg-white shadow-xl rounded-[2rem] border-primary/5 mb-12 overflow-hidden">
          <div className="bg-primary/5 p-8 lg:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black text-primary italic">Meta Global FF01</h2>
                <p className="text-lg text-muted-foreground font-bold italic">Presupuesto total requerido: {formatCurrency(FUNDING_GOAL)}</p>
              </div>
              <div className="text-center md:text-right bg-white p-6 rounded-3xl shadow-lg border border-primary/10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Estado de la Ronda</p>
                <div className="text-4xl md:text-5xl font-black text-secondary italic">{mounted ? totalPercentage.toFixed(1) : "0"}%</div>
              </div>
            </div>
            
            <div className="space-y-8">
              <Progress value={mounted ? totalPercentage : 0} className="h-6 rounded-full bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Recaudado (Confirmado)</p>
                  <p className="text-2xl font-black text-primary italic">{formatCurrency(totalConfirmed)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Comprometido (Pendiente)</p>
                  <p className="text-2xl font-black text-amber-500 italic">{formatCurrency(totalPending)}</p>
                </div>
                <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">Disponible para Ronda</p>
                  <p className="text-2xl font-black text-primary italic">{formatCurrency(remainingCapital)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {MILESTONES.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full bg-white shadow-lg border-primary/5 rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all">
                <div className={cn("p-8 text-white", m.color)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl">{m.icon}</div>
                    <Badge className="bg-white/20 text-white border-none font-bold">{m.percentage}%</Badge>
                  </div>
                  <h3 className="text-xl font-black italic">{m.title}</h3>
                  <p className="text-2xl font-black mt-2">{formatCurrency(m.target)}</p>
                </div>
                <CardContent className="p-8">
                   <ul className="space-y-4">
                     {m.items.map((item, idx) => (
                       <li key={idx} className="flex items-start gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
                         <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", m.textColor)} />
                         {item}
                       </li>
                     ))}
                   </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section id="formalize" className="mb-24 scroll-mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-xl"><PenTool className="h-6 w-6 text-primary" /></div>
            <h2 className="text-2xl md:text-3xl font-black text-primary italic">Formalización del Aporte</h2>
          </div>
          
          <Card className="bg-white shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden">
            <div className="p-8 lg:p-12 space-y-10">
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-black text-amber-800 italic">Marco Legal</h4>
                  <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                    Completa tus datos para formalizar digitalmente. Basta con la <strong>Firma Electrónica Simple (FES)</strong>. El Representante Legal firmará con <strong>Firma Electrónica Avanzada (FEA)</strong>.
                  </p>
                </div>
              </div>

              <div className="grid gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                    <Input placeholder="Ej: Juan Pablo Pérez Soto" value={invName} onChange={(e) => setInvName(e.target.value)} className="h-12 rounded-xl border-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT</Label>
                    <Input placeholder="12.345.678-9" value={invRut} onChange={handleRutChange} className="h-12 rounded-xl border-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Correo Electrónico</Label>
                    <Input type="email" placeholder="ejemplo@correo.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} className="h-12 rounded-xl border-primary/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección Domiciliaria</Label>
                    <Input placeholder="Calle, número, comuna" value={invAddress} onChange={(e) => setInvAddress(e.target.value)} className="h-12 rounded-xl border-primary/10" />
                  </div>
                </div>

                <div className="bg-primary/5 p-6 md:p-8 rounded-[2rem] border border-primary/10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4 space-y-3">
                      <Label className="font-black flex items-center gap-2 text-primary">
                        <HandCoins className="h-5 w-5 text-secondary" /> Monto Aporte (CLP)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-primary">$</span>
                        <Input type="text" className="h-16 pl-10 rounded-2xl text-2xl font-black border-primary/20 shadow-inner focus:ring-secondary" placeholder="0" value={invAmountDisplay} onChange={handleAmountChange} />
                      </div>
                    </div>
                    
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <AnimatePresence mode="wait">
                        <motion.div key={invAmount ? 'e-active' : 'e-empty'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl shadow-xl border border-primary/5 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mb-1"><Sparkles className="h-3 w-3 text-secondary" /> Participación Permanente FF01</p>
                          <p className="text-4xl font-black text-primary italic">{invAmount ? calculateEquity(invAmount).toFixed(4) : "0.0000"}%</p>
                        </motion.div>
                        <motion.div key={invAmount ? 'r-active' : 'r-empty'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center">
                          <p className="text-[10px] font-black text-white/70 uppercase flex items-center gap-1 mb-1"><Clock className="h-3 w-3 text-secondary" /> Retorno Proyectado</p>
                          <p className="text-3xl font-black italic">{invAmount ? formatCurrency(invAmount * 1.2) : "$0"}</p>
                        </motion.div>
                       </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-primary/10">
                  <div className="flex items-start space-x-3 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <Checkbox id="terms" checked={isAgreed} onCheckedChange={(v) => setIsAgreed(!!v)} className="mt-1 h-5 w-5 rounded-md border-primary" />
                    <label htmlFor="terms" className="text-sm font-medium text-primary/80 cursor-pointer select-none leading-relaxed">
                      Yo, <span className="font-black text-primary underline underline-offset-4">{invName || "________________"}</span>, RUT <span className="font-black text-primary">{invRut || "___________"}</span>, declaro mi voluntad de suscribir este contrato mediante <strong>Firma Electrónica Simple</strong>.
                    </label>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" onClick={generatePDF} className="h-16 flex-1 rounded-2xl font-bold border-2 border-primary/20 text-primary">
                      <Download className="mr-2 h-5 w-5" /> Revisar Borrador
                    </Button>
                    <Button onClick={handleFormalize} className="h-16 flex-[2] rounded-2xl bg-primary hover:bg-secondary font-black text-xl shadow-2xl transition-all" disabled={isSubmitting}>
                      {isSubmitting ? "Procesando Firma..." : "Firmar y Formalizar Aporte"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-32 mb-16 space-y-12 bg-white p-8 md:p-16 rounded-[3rem] border border-primary/5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-primary/10 pb-8">
            <div className="space-y-2">
              <Badge className="bg-secondary text-primary font-black uppercase text-[10px] mb-2 px-3 py-1">Simulación Transparencia ROI</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-primary italic">Live ROI & Seguimiento</h2>
              <p className="text-muted-foreground font-medium italic">Concepto del panel de control que tendrá cada socio.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Exámenes Mes", value: "142", icon: <Users className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Ocupación Sala", value: "85%", icon: <MonitorPlay className="h-5 w-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Ingreso Bruto Est.", value: "$8.520.000", icon: <ArrowUpRight className="h-5 w-5" />, color: "text-primary", bg: "bg-primary/5" },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-white border-primary/5 shadow-lg rounded-[2rem] p-6">
                      <div className={cn("p-3 rounded-2xl w-fit mb-4", stat.bg, stat.color)}>{stat.icon}</div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{stat.label}</p>
                      <p className={cn("text-2xl font-black italic", stat.color)}>{stat.value}</p>
                    </Card>
                  ))}
                </div>

                <Card className="bg-white p-8 rounded-[2.5rem] shadow-xl border-primary/5">
                   <div className="flex items-center justify-between mb-10">
                      <h3 className="font-black text-primary italic flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary" /> Flujo Diario de Exámenes</h3>
                      <Select defaultValue="week">
                         <SelectTrigger className="w-[140px] h-8 text-[10px] font-bold rounded-full">
                           <SelectValue placeholder="Periodo" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Mes Pasado</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_OPS_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} hide={isMobile} />
                          <ChartTooltip cursor={{ fill: 'rgba(28, 104, 182, 0.05)', radius: 10 }} />
                          <Bar dataKey="exams" fill="#1c68b6" radius={[6, 6, 0, 0]} barSize={isMobile ? 25 : 40} />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                </Card>
             </div>

             <div className="lg:col-span-4">
                <Card className="bg-primary text-white shadow-2xl rounded-[2.5rem] h-full flex flex-col overflow-hidden border-none">
                   <div className="p-8 bg-white/5 border-b border-white/10">
                      <h3 className="text-xl font-black italic flex items-center gap-3"><LayoutDashboard className="h-6 w-6 text-secondary" /> Agenda Hoy (Real)</h3>
                   </div>
                   <div className="flex-grow p-6 space-y-4">
                      {MOCK_PATIENTS_TODAY.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                           <div className="flex items-center gap-4">
                             <span className="text-xs font-black text-secondary font-mono bg-white/10 px-3 py-1 rounded-full">{p.time}</span>
                             <div className="flex flex-col">
                               <span className="text-sm font-bold">{p.name}</span>
                               <span className="text-[9px] font-black text-white/40 uppercase">{p.test}</span>
                             </div>
                           </div>
                           <Badge className={cn("text-[8px] font-black uppercase border-none", p.status === 'completed' ? "bg-emerald-500" : p.status === 'in_progress' ? "bg-amber-500 animate-pulse" : "bg-white/20")}>
                             {p.status === 'completed' ? 'Listo' : p.status === 'in_progress' ? 'En Test' : 'Por Llegar'}
                           </Badge>
                        </div>
                      ))}
                   </div>
                   <div className="p-8 bg-black/10 text-center">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Tecnología Operativa Sunvou®</p>
                   </div>
                </Card>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
