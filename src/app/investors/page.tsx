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
  Building2, 
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  User,
  MapPin,
  CreditCard,
  HandCoins,
  Mail,
  ShieldCheck,
  PenTool,
  Sparkles,
  ArrowUpRight,
  Users,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

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
        const estimatedHeight = (lines.length * (fontSize / 2.2)) + 4;
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
    const equityPct = calculateEquity(invAmount || 0).toFixed(4);

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;
    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${invName || '________________'}, cédula nacional de identidad N° ${invRut || '___________'}, domiciliado(a) en ${invAddress || '__________________________________'}, email ${invEmail || '___________'}, en adelante el \"Inversionista\".`, 10, false, "justify");

    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${(invAmount || 0).toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo y gastos operacionales iniciales.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${(invAmount || 0).toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${((invAmount || 0) * 0.2).toLocaleString('es-CL')}).`, 10, false, "justify");
    addText("La suma total se pagará en siete cuotas mensuales iguales y sucesivas entre el mes 6 y el mes 12 contado desde la fecha de aporte, siempre que la unidad de negocio ORALAB cuente con flujo de caja operacional suficiente para ello. En caso de que el flujo disponible no sea suficiente en una fecha de pago determinada, la cuota correspondiente se postergará al mes siguiente en que exista disponibilidad, sin que ello constituya incumplimiento contractual, mora ni genere intereses penales. La Empresa informará al Inversionista de cualquier postergación, indicando la causa y la nueva fecha estimada de pago. Con todo, las postergaciones que pudieren producirse no podrán extenderse más allá de 12 meses a partir del mes 12 mencionado arriba en el párrafo.", 10, false, "justify");

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes a los inversionistas de la Ronda Family & Friends 01, el equipo Sunvou DA7349 adquirido con fondos de esta ronda no podrá ser vendido, transferido, dado en garantía a terceros, ni sujeto a cualquier gravamen, sin autorización escrita de la mayoría de dichos inversionistas. En caso de cese de operaciones de ORALAB, liquidación de sus activos, o venta del equipo señalado, el producto de dicha venta o liquidación se destinará prioritariamente al pago de los saldos pendientes a los inversionistas de la Ronda Family & Friends 01, antes de cualquier otro destino, hasta el monto total adeudado a cada uno según su aporte.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`Adicionalmente a la devolución del capital y retorno señalado anteriormente, el Inversionista adquirirá una participación económica permanente sobre ORALAB. Las partes acuerdan que el total de la ronda Family & Friends 01 corresponde a una valorización que asigna un 10% de participación económica total a quienes aporten $13.500.000 requeridos. La participación económica individual para este aporte se calcula en un ${equityPct}% sobre las utilidades de la unidad de negocio ORALAB.`, 10, false, "justify");

    addText("SÉPTIMA: NATURALEZA DE LA PARTICIPACIÓN", 10, true);
    addText("La participación económica otorgada: a) No constituye acciones de TRESNA SpA. b) No otorga calidad de socio ni accionista. c) No concede derecho a voto. d) No concede facultades de administración. e) Corresponde únicamente a un derecho económico asociado a ORALAB.", 10, false, "justify");

    addText("OCTAVA: DISTRIBUCIÓN DE UTILIDADES", 10, true);
    addText("Una vez finalizado el período de devolución señalado en la cláusula cuarta, el Inversionista tendrá derecho a recibir anualmente el porcentaje de utilidades distribuibles de ORALAB que corresponda a su participación económica. Para efectos de esta cláusula, se entenderá por \"utilidades distribuibles de ORALAB\" los ingresos percibidos directamente atribuibles a la operación del laboratorio, deducidos los costos directos e indirectos razonablemente imputables a dicha unidad de negocio, incluyendo arriendo, remuneraciones del personal clínico, insumos, depreciación del equipo y gastos generales de operación. La administración comunicará anualmente la metodología de asignación de costos a los inversionistas.", 10, false, "justify");

    addText("NOVENA: INFORMACIÓN", 10, true);
    addText("TRESNA SpA entregará al Inversionista un reporte trimestral de resultados de ORALAB, dentro de los 30 días siguientes al cierre de cada trimestre calendario. Dicho reporte incluirá al menos: (a) ingresos brutos del período; (b) número de pacientes atendidos; (c) costos directos e indirectos asignados a ORALAB; (d) utilidad neta antes de distribución; y (e) monto distribuido o acumulado para distribución.", 10, false, "justify");

    addText("DÉCIMA: CESIÓN", 10, true);
    addText("La participación económica no podrá ser transferida a terceros.", 10, false, "justify");

    addText("DÉCIMO PRIMERA: VIGENCIA", 10, true);
    addText("La participación económica otorgada mediante este contrato tendrá carácter permanente mientras ORALAB opere como unidad de negocio de TRESNA SpA o de cualquier entidad sucesora que continúe desarrollando dicha actividad. En caso de que TRESNA SpA enajene, transfiera, escinda o de cualquier forma traspase la unidad de negocio ORALAB o sus activos principales a un tercero, el adquirente deberá subrogarse en todas las obligaciones del presente contrato respecto del Inversionista como condición de dicha transferencia.", 10, false, "justify");

    addText("DÉCIMO SEGUNDA: DERECHO DE PREFERENCIA", 10, true);
    addText("En el evento de que TRESNA SpA decida la apertura de nuevas sucursales de la unidad de negocio ORALAB que requieran financiamiento externo, o se acuerden nuevas rondas de levantamiento de capital, los inversionistas suscritos a la presente ronda Family & Friends 01 tendrán un derecho preferente para participar en dichas instancias, en igualdad de condiciones comerciales que se ofrezcan a terceros.", 10, false, "justify");

    addText("DÉCIMO TERCERA: JURISDICCIÓN", 10, true);
    addText("Para todos los efectos derivados del presente contrato, las partes fijan domicilio en la comuna de Santiago y se someten a la jurisdicción de sus tribunales ordinarios de justicia.", 10, false, "justify");

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

  const handleFormalize = async () => {
    if (!invName || !invRut || !invEmail || !invAddress || !invAmount || !isAgreed) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Asegúrate de llenar todos los campos y aceptar la declaración." });
      return;
    }
    
    setIsSubmitting(true);
    if (db) {
      try {
        await addDocumentNonBlocking(collection(db, "contract_leads"), {
          name: invName,
          rut: invRut,
          email: invEmail,
          address: invAddress,
          amount: invAmount,
          equity: calculateEquity(invAmount),
          status: "signed_by_investor",
          investorSignedAt: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            ip: "Validada"
          },
          createdAt: serverTimestamp()
        });
        toast({ title: "Firma Registrada", description: "Tu compromiso ha sido enviado." });
        setInvName(""); setInvRut(""); setInvEmail(""); setInvAddress(""); setInvAmount(0); setInvAmountDisplay(""); setIsAgreed(false);
      } catch (e) {
        toast({ variant: "destructive", title: "Error" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="text-secondary border-secondary px-4 py-1 font-bold uppercase tracking-widest">RONDA FAMILY & FRIENDS 01</Badge>
          <h1 className="text-3xl md:text-6xl font-black text-primary italic leading-tight">Estructura de Capital FF01</h1>
        </div>

        <section id="formalize" className="mb-24 scroll-mt-20">
          <Card className="bg-white shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden">
            <div className="p-8 lg:p-12 space-y-10">
              <div className="grid gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                    <Input placeholder="Ej: Juan Pérez" value={invName} onChange={(e) => setInvName(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT</Label>
                    <Input placeholder="12.345.678-9" value={invRut} onChange={handleRutChange} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Correo Electrónico</Label>
                    <Input type="email" placeholder="ejemplo@correo.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección Domiciliaria</Label>
                    <Input placeholder="Calle, número, comuna" value={invAddress} onChange={(e) => setInvAddress(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4 space-y-3">
                      <Label className="font-black flex items-center gap-2 text-primary">
                        <HandCoins className="h-5 w-5 text-secondary" /> Monto Aporte (CLP)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-primary">$</span>
                        <Input type="text" className="h-16 pl-10 rounded-2xl text-2xl font-black border-primary/20 shadow-inner" placeholder="0" value={invAmountDisplay} onChange={handleAmountChange} />
                      </div>
                    </div>
                    
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-primary/5">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mb-1"><Sparkles className="h-3 w-3 text-secondary" /> Participación Permanente</p>
                          <p className="text-4xl font-black text-primary italic">{invAmount ? calculateEquity(invAmount).toFixed(4) : "0.0000"}%</p>
                        </div>
                        <div className="bg-primary text-white p-6 rounded-2xl shadow-xl">
                          <p className="text-[10px] font-black text-white/70 uppercase flex items-center gap-1 mb-1"><Clock className="h-3 w-3 text-secondary" /> Retorno Proyectado</p>
                          <p className="text-3xl font-black italic">{invAmount ? `$${(invAmount * 1.2).toLocaleString('es-CL')}` : "$0"}</p>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-primary/10">
                  <div className="flex items-start space-x-3 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <Checkbox id="terms" checked={isAgreed} onCheckedChange={(v) => setIsAgreed(!!v)} className="mt-1 h-5 w-5" />
                    <label htmlFor="terms" className="text-sm font-medium text-primary/80 leading-relaxed">
                      Yo, <span className="font-black text-primary underline">{invName || "________________"}</span>, RUT <span className="font-black text-primary">{invRut || "___________"}</span>, declaro mi voluntad de suscribir este contrato mediante <strong>Firma Electrónica Simple</strong>.
                    </label>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" onClick={generatePDF} className="h-16 flex-1 rounded-2xl font-bold border-2">
                      <Download className="mr-2 h-5 w-5" /> Revisar Borrador
                    </Button>
                    <Button onClick={handleFormalize} className="h-16 flex-[2] rounded-2xl bg-primary hover:bg-secondary font-black text-xl shadow-2xl transition-all" disabled={isSubmitting}>
                      {isSubmitting ? "Procesando..." : "Firmar y Formalizar Aporte"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
