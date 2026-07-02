
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, updateDoc, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Trash2, 
  Download,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  Users,
  Briefcase,
  Pencil,
  Save,
  CreditCard,
  Mail,
  TrendingUp,
  Target,
  Plus,
  FileBarChart,
  ShieldCheck,
  Info,
  CalendarDays,
  History
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";

const ADMIN_EMAIL = "admin@oralab.cl";
const FUNDING_GOAL = 13500000;
const EQUITY_TOTAL = 10;

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

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Modal State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  
  const [leadForm, setLeadForm] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    amount: 0
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    date: "",
    status: "pending" as "pending" | "completed"
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    } else if (user && user.email !== ADMIN_EMAIL) {
      const auth = getAuth();
      signOut(auth).then(() => router.push("/login"));
    }
  }, [user, isUserLoading, router]);

  const bookingsRef = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return collection(db, "bookings");
  }, [db, user]);

  const contractLeadsRef = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return collection(db, "contract_leads");
  }, [db, user]);

  const milestonesRef = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, "milestones"), orderBy("date", "desc"));
  }, [db, user]);

  const { data: rawBookings, isLoading: loadingBookings } = useCollection(bookingsRef);
  const { data: rawContractLeads, isLoading: loadingLeads } = useCollection(contractLeadsRef);
  const { data: milestones, isLoading: loadingMilestones } = useCollection(milestonesRef);

  const bookings = (rawBookings || []).sort((a, b) => {
    const dateA = a.scheduledDate || "";
    const dateB = b.scheduledDate || "";
    return dateB.localeCompare(dateA);
  });

  const contractLeads = (rawContractLeads || []).sort((a, b) => {
    const dateA = a.createdAt?.seconds || 0;
    const dateB = b.createdAt?.seconds || 0;
    return dateB - dateA;
  });

  const totalRaised = contractLeads.reduce((acc, lead) => acc + (lead.amount || 0), 0);
  const validatedRaised = contractLeads
    .filter(lead => lead.status === 'fully_signed')
    .reduce((acc, lead) => acc + (lead.amount || 0), 0);
  const balanceRemaining = Math.max(0, FUNDING_GOAL - validatedRaised);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Pendiente</Badge>;
      case "arrived": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Llegó</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En Curso</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadInvestorsSummaryPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const primaryRGB = [28, 104, 182];
    const secondaryRGB = [25, 204, 204];

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ORALAB", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Resumen Ejecutivo de Inversión - Ronda FF01", margin, 32);

    doc.setFontSize(9);
    doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 150, 25);
    doc.text("ESTRICTAMENTE CONFIDENCIAL", 150, 30);

    y = 55;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ESTADO FINANCIERO DE LA RONDA", margin, y);
    y += 10;

    doc.setDrawColor(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, 190, y);
    y += 10;

    const labelX = margin;
    const valueX = 110;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`META DE RECAUDACIÓN RONDA FF01:`, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(`$${FUNDING_GOAL.toLocaleString('es-CL')}`, valueX, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`CAPITAL COMPROMETIDO:`, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.text(`$${totalRaised.toLocaleString('es-CL')}`, valueX, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`CAPITAL REAL VALIDADO:`, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
    doc.text(`$${validatedRaised.toLocaleString('es-CL')}`, valueX, y);
    y += 10;

    doc.setFillColor(245, 247, 249);
    doc.rect(margin, y, 170, 12, 'F');
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`SALDO POR RECAUDAR:`, labelX + 5, y + 8);
    doc.text(`$${balanceRemaining.toLocaleString('es-CL')}`, valueX, y + 8);
    y += 20;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.text("GLOSARIO DE TÉRMINOS", margin, y);
    y += 6;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Comprometido:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(" Representa una intención de aporte que no se ha materializado aún en el flujo de caja.", margin + 22, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Validado:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(" Capital efectivamente recibido en la cuenta bancaria de Tresna SpA y formalizado administrativamente.", margin + 14, y);
    y += 15;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LISTADO DE SOCIOS (ANONIMIZADO)", margin, y);
    y += 8;

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTIFICADOR", margin + 5, y + 7);
    doc.text("MONTO APORTE", margin + 60, y + 7);
    doc.text("PARTICIPACIÓN (%)", margin + 110, y + 7);
    doc.text("ESTADO", margin + 145, y + 7);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    contractLeads.forEach((lead, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Inversionista #${contractLeads.length - index}`, margin + 5, y + 7);
      doc.text(`$${(lead.amount || 0).toLocaleString('es-CL')}`, margin + 60, y + 7);
      doc.text(`${(lead.equity || 0).toFixed(4)}%`, margin + 110, y + 7);
      doc.text(lead.status === 'fully_signed' ? 'VALIDADO' : 'PENDIENTE', margin + 145, y + 7);
      
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y + 10, margin + 170, y + 10);
      y += 10;
    });

    y += 15;
    doc.setFillColor(245, 247, 249);
    doc.rect(0, doc.internal.pageSize.height - 35, 210, 35, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const disclaimer = "Este reporte es de carácter confidencial para uso exclusivo de la administración de Tresna SpA. Los datos presentados son un fiel reflejo de la base de datos de Oralab Clinical Lab al momento de su emisión.";
    doc.text(doc.splitTextToSize(disclaimer, 170), margin, doc.internal.pageSize.height - 20);

    doc.save(`Reporte_Ejecutivo_Oralab_FF01_${format(new Date(), "yyyyMMdd")}.pdf`);
  };

  const generateFullPDF = (lead: any) => {
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
    const amountInWords = numeroALetras(lead.amount || 0);
    const equityPct = (lead.equity || 0).toFixed(4);

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;
    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${lead.name.toUpperCase()}, cédula nacional de identidad N° ${lead.rut}, domiciliado(a) en ${lead.address.toUpperCase()}, email ${lead.email.toLowerCase()}, en adelante el \"Inversionista\".`, 10, false, "justify");

    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${(lead.amount || 0).toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para:", 10, false);
    addText("a) Compra e importación del analizador Sunvou DA7349.", 10, false);
    addText("b) Capital de trabajo y gastos operacionales iniciales.", 10, false);

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${(lead.amount || 0).toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${((lead.amount || 0) * 0.2).toLocaleString('es-CL')}).`, 10, false, "justify");
    addText("La suma total se pagará en siete cuotas mensuales iguales y sucesivas entre el mes 6 y el mes 12 contado desde la fecha de aporte, siempre que la unidad de negocio ORALAB cuente con flujo de caja operacional suficiente para ello. En caso de que el flujo disponible no sea suficiente en una fecha de pago determinada, la cuota correspondiente se postergará al mes siguiente en que exista disponibilidad, sin que ello constituya incumplimiento contractual, mora ni genere intereses penales. La Empresa informará al Inversionista de cualquier postergación, indicando la causa y la nueva fecha estimada de pago. Con todo, las postergaciones que pudieren producirse no podrán extenderse más allá de 12 meses a partir del mes 12 mencionado arriba en el párrafo.", 10, false, "justify");

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes a los inversionistas de la Ronda Family & Friends 01, el equipo Sunvou DA7349 adquirido con fondos de esta ronda no podrá ser vendido, transferido, dado en garantía a terceros, ni sujeto a cualquier gravamen, sin autorización escrita de la mayoría de dichos inversionistas.", 10, false, "justify");
    addText("En caso de cese de operaciones de ORALAB, liquidación de sus activos, o venta del equipo señalado, el producto de dicha venta o liquidación se destinará prioritariamente al pago de los saldos pendientes a los inversionistas de la Ronda Family & Friends 01, antes de cualquier otro destino, hasta el monto total adeudado a cada uno según su aporte.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`Adicionalmente a la devolución del capital y retorno señalado anteriormente, el Inversionista adquirirá una participación económica permanente sobre ORALAB. Las partes acuerdan que el total de la ronda Family & Friends 01 corresponde a una valorización que asigna un 10% de participación económica total a quienes aporten $13.500.000 requeridos.`, 10, false, "justify");
    addText(`La participación económica individual para este aporte se calcula en un ${equityPct}% sobre las utilidades de la unidad de negocio ORALAB.`, 10, false, "justify");

    addText("SÉPTIMA: NATURALEZA DE LA PARTICIPACIÓN", 10, true);
    addText("La participación económica otorgada:", 10, false);
    addText("a) No constituye acciones de TRESNA SpA.", 10, false);
    addText("b) No otorga calidad de socio ni accionista.", 10, false);
    addText("c) No concede derecho a voto.", 10, false);
    addText("d) No concede facultades de administración.", 10, false);
    addText("e) Corresponde únicamente a un derecho económico asociado a ORALAB.", 10, false);

    addText("OCTAVA: DISTRIBUCIÓN DE UTILIDADES", 10, true);
    addText("Una vez finalizado el período de devolución señalado en la cláusula cuarta, el Inversionista tendrá derecho a recibir anualmente el porcentaje de utilidades distribuibles de ORALAB que corresponda a su participación económica.", 10, false, "justify");
    addText("Para efectos de esta cláusula, se entenderá por “utilidades distribuibles de ORALAB” los ingresos percibidos directamente atribuibles a la operación del laboratorio, deducidos los costos directos e indirectos razonablemente imputables a dicha unidad de negocio, incluyendo arriendo, remuneraciones del personal clínico, insumos, depreciación del equipo y gastos generales de operación. No se podrán imputar a ORALAB gastos corporativos generales de TRESNA SpA, ni remuneraciones de personas no vinculadas directamente a la operación del laboratorio, ni honorarios entre empresas relacionadas que excedan valores de mercado. La administración comunicará anualmente la metodología de asignación de costos a los inversionistas.", 10, false, "justify");

    addText("NOVENA: INFORMACIÓN", 10, true);
    addText("TRESNA SpA entregará al Inversionista un reporte trimestral de resultados de ORALAB, dentro de los 30 días siguientes al cierre de cada trimestre calendario. Dicho reporte incluirá al menos: (a) ingresos brutos del período; (b) número de pacientes atendidos; (c) costos directos e indirectos asignados a ORALAB; (d) utilidad neta antes de distribución; y (e) monto distribuido o acumulado para distribución.", 10, false, "justify");

    addText("DÉCIMA: CESIÓN", 10, true);
    addText("La participación económica no podrá ser transferida a terceros.", 10, false, "justify");

    addText("DÉCIMO PRIMERA: VIGENCIA", 10, true);
    addText("La participación económica otorgada mediante este contrato tendrá carácter permanente mientras ORALAB opere como unidad de negocio de TRESNA SpA o de cualquier entidad sucesora que continúe desarrollando dicha actividad.", 10, false, "justify");
    addText("En caso de que TRESNA SpA enajene, transfiera, escinda o de cualquier forma traspase la unidad de negocio ORALAB o sus activos principales a un tercero, el adquirente deberá subrogarse en todas las obligaciones del presente contrato respecto del Inversionista como condición de dicha transferencia.", 10, false, "justify");

    addText("DÉCIMO SEGUNDA: DERECHO DE PREFERENCIA", 10, true);
    addText("En el evento de que TRESNA SpA decida la apertura de nuevas sucursales de la unidad de negocio ORALAB que requieran financiamiento externo, o se acuerden nuevas rondas de levantamiento de capital, los inversionistas suscritos a la presente ronda Family & Friends 01 tendrán un derecho preferente para participar en dichas instancias, en igualdad de condiciones comerciales que se ofrezcan a terceros.", 10, false, "justify");

    addText("DÉCIMO TERCERA: JURISDICCIÓN", 10, true);
    addText("Para todos los efectos derivados del presente contrato, las partes fijan domicilio en la comuna de Santiago y se someten a la jurisdicción de sus tribunales ordinarios de justicia.", 10, false, "justify");

    y += 10;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 15;
    const signatureY = y + 25;
    checkPage(40);
    
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.setFontSize(8);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.text("Representante Legal TRESNA SpA", margin, signatureY + 9);

    const invX = pageWidth - margin - 75;
    if (lead.investorSignedAt) {
      doc.setFillColor(240, 247, 255);
      doc.roundedRect(invX, signatureY - 22, 75, 20, 2, 2, 'F');
      doc.setTextColor(28, 104, 182);
      doc.setFontSize(7);
      doc.text("FIRMADO ELECTRÓNICAMENTE", invX + 37.5, signatureY - 17, { align: "center" });
      doc.setFontSize(6);
      doc.text(`Nombre: ${lead.name.toUpperCase()}`, invX + 5, signatureY - 13);
      doc.text(`RUT: ${lead.rut}`, invX + 5, signatureY - 10);
      doc.text(`Fecha: ${format(new Date(lead.investorSignedAt), "dd/MM/yyyy HH:mm:ss")}`, invX + 5, signatureY - 7);
    }

    doc.setTextColor(0, 0, 0);
    doc.line(pageWidth - margin - 75, signatureY, pageWidth - margin, signatureY);
    doc.text("INVERSIONISTA", pageWidth - margin, signatureY + 5, { align: "right" });
    doc.text(lead.name.toUpperCase(), pageWidth - margin, signatureY + 9, { align: "right" });

    doc.save(`Contrato_Oralab_Final_${lead.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleAdminMarkAsSigned = async (lead: any) => {
    if (!db || !confirm("¿Confirmas la recepción del pago y formalización del socio?")) return;
    
    try {
      const leadRef = doc(db, "contract_leads", lead.id);
      await updateDoc(leadRef, {
        status: "fully_signed",
        adminSignedAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      toast({ 
        title: "Socio Validado", 
        description: `${lead.name} ahora es parte oficial de Oralab.` 
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleCreateMilestone = async () => {
    if (!db || !milestoneForm.title || !milestoneForm.date) return;
    try {
      await addDoc(collection(db, "milestones"), {
        ...milestoneForm,
        createdAt: serverTimestamp()
      });
      toast({ title: "Hito creado" });
      setIsMilestoneDialogOpen(false);
      setMilestoneForm({ title: "", description: "", date: "", status: "pending" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!db || !confirm("¿Eliminar este hito del cronograma?")) return;
    try {
      await deleteDoc(doc(db, "milestones", id));
      toast({ title: "Hito eliminado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const toggleMilestoneStatus = async (id: string, currentStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "milestones", id), {
        status: currentStatus === 'completed' ? 'pending' : 'completed'
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-3 shadow-inner border border-primary/5">
            <TabsTrigger value="patients" className="rounded-full font-black px-10 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Agenda</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black px-10 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all">Inversionistas</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-full font-black px-10 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all">Cronograma</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-secondary" /> Control de Agenda
                </CardTitle>
                <CardDescription>Gestión de citas y kits de test de aire espirado SIBO.</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold">Fecha / Hora</TableHead>
                      <TableHead className="font-bold">Paciente</TableHead>
                      <TableHead className="font-bold">Examen / Modalidad</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="text-right font-bold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBookings ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse">Sincronizando...</TableCell></TableRow>
                    ) : bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-primary">{b.scheduledDate ? format(new Date(b.scheduledDate + 'T00:00:00'), "dd/MM/yyyy") : "Pendiente"}</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> {b.scheduledTime} hrs</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{b.firstName} {b.lastNameFather}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black">{b.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-secondary italic">Test {b.examType}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{b.modality === 'home_kit' ? 'Retiro de Kit' : 'Presencial'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => updateDocumentNonBlocking(doc(db!, "bookings", b.id), { status: "arrived" })} className="text-blue-500 rounded-full h-8 w-8"><CheckCircle2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "bookings", b.id))} className="text-red-300 rounded-full h-8 w-8 ml-2"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                    <Users className="h-6 w-6 text-secondary" /> Gestión de Socios
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadInvestorsSummaryPDF} variant="outline" className="rounded-full border-primary/20 text-primary font-black h-10 px-6 shadow-sm">
                    <FileBarChart className="mr-2 h-4 w-4" /> Resumen FF01 (PDF)
                  </Button>
                  <Button onClick={() => { setLeadForm({ name: "", rut: "", email: "", address: "", amount: 0 }); setIsCreateDialogOpen(true); }} className="rounded-full bg-primary font-black h-10 px-8 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Socio
                  </Button>
                </div>
              </CardHeader>
              <div className="p-4 bg-muted/20 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
                 <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm text-center">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Comprometido</p>
                   <p className="text-lg font-black text-primary">${totalRaised.toLocaleString('es-CL')}</p>
                 </div>
                 <div className="bg-secondary/10 p-3 rounded-xl border border-secondary/20 shadow-sm text-center">
                   <p className="text-[9px] font-black text-secondary uppercase">Validado (Real)</p>
                   <p className="text-lg font-black text-secondary">${validatedRaised.toLocaleString('es-CL')}</p>
                 </div>
                 <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 shadow-sm text-center">
                   <p className="text-[9px] font-black text-primary uppercase">Saldo Pendiente</p>
                   <p className="text-lg font-black text-primary">${balanceRemaining.toLocaleString('es-CL')}</p>
                 </div>
                 <div className="bg-white p-3 rounded-xl border border-primary/5 shadow-sm text-center">
                   <p className="text-[9px] font-black text-muted-foreground uppercase">Meta Ronda</p>
                   <p className="text-lg font-black text-primary">$13.5M</p>
                 </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-black text-[10px] uppercase">Socio</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Monto</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Participación</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Estado</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-primary uppercase">{lead.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{lead.rut}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-primary">${(lead.amount || 0).toLocaleString('es-CL')}</TableCell>
                        <TableCell><Badge variant="outline" className="text-secondary font-black">{(lead.equity || 0).toFixed(4)}%</Badge></TableCell>
                        <TableCell>
                          <Badge variant={lead.status === 'fully_signed' ? 'default' : 'outline'} className={cn(
                            "rounded-full font-black text-[9px] uppercase",
                            lead.status === 'fully_signed' ? "bg-green-500" : "bg-amber-50 text-amber-600 border-amber-200"
                          )}>
                            {lead.status === 'fully_signed' ? 'Socio Formalizado' : 'Pendiente Pago'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingLead(lead); setLeadForm(lead); setIsEditDialogOpen(true); }} className="text-primary rounded-full h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => generateFullPDF(lead)} className="rounded-full h-8 font-black text-[9px] mx-1">CONTRATO</Button>
                          {lead.status !== 'fully_signed' && (
                            <Button onClick={() => handleAdminMarkAsSigned(lead)} className="bg-primary text-white h-8 text-[9px] rounded-full px-3 font-black">VALIDAR</Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContractLead(lead.id)} className="text-red-300 rounded-full h-8 w-8 ml-1"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
             <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                   <div>
                     <CardTitle className="text-2xl font-black text-amber-600 italic flex items-center gap-2">
                       <CalendarDays className="h-6 w-6" /> Cronograma de Hitos
                     </CardTitle>
                     <CardDescription>Eventos institucionales visibles para los inversionistas.</CardDescription>
                   </div>
                   <Button onClick={() => setIsMilestoneDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-black rounded-full h-10 px-8 shadow-lg">
                     <Plus className="mr-2 h-4 w-4" /> Nuevo Hito
                   </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader>
                         <TableRow className="bg-muted/10">
                            <TableHead className="font-bold">Fecha</TableHead>
                            <TableHead className="font-bold">Título</TableHead>
                            <TableHead className="font-bold">Estado</TableHead>
                            <TableHead className="text-right font-bold">Gestión</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingMilestones ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-20">Sincronizando cronograma...</TableCell></TableRow>
                        ) : milestones?.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">No hay hitos registrados aún.</TableCell></TableRow>
                        ) : milestones?.map((m) => (
                          <TableRow key={m.id}>
                             <TableCell className="font-black text-primary">{format(new Date(m.date + 'T00:00:00'), "dd/MM/yyyy")}</TableCell>
                             <TableCell>
                                <div className="flex flex-col">
                                   <span className="font-bold text-primary">{m.title}</span>
                                   <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{m.description}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge onClick={() => toggleMilestoneStatus(m.id, m.status)} className={cn(
                                  "cursor-pointer font-black text-[9px] uppercase",
                                  m.status === 'completed' ? "bg-green-500" : "bg-amber-500"
                                )}>
                                   {m.status === 'completed' ? 'Logrado' : 'Pendiente'}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(m.id)} className="text-red-300 hover:text-red-600 rounded-full h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                             </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </div>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogo Hitos */}
        <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
           <DialogContent className="max-w-md rounded-[2rem]">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-primary italic">Registrar Hito Institucional</DialogTitle>
                 <DialogDescription>Aparecerá en el cronograma público para inversionistas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label className="font-bold">Título del Hito</Label>
                    <Input placeholder="Ej: Llegada del Analizador a Chile" value={milestoneForm.title} onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">Fecha del Evento</Label>
                    <Input type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({...milestoneForm, date: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">Descripción Corta</Label>
                    <Textarea placeholder="Detalla el logro o evento..." value={milestoneForm.description} onChange={(e) => setMilestoneForm({...milestoneForm, description: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">Estado Inicial</Label>
                    <Select value={milestoneForm.status} onValueChange={(v: any) => setMilestoneForm({...milestoneForm, status: v})}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="pending">En Proceso (Pendiente)</SelectItem>
                          <SelectItem value="completed">Logrado (Finalizado)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>
              <DialogFooter>
                 <Button onClick={handleCreateMilestone} className="w-full bg-primary font-black rounded-xl h-12 shadow-lg">Publicar en Cronograma</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

        {/* Dialogos de Socios (Mantener iguales pero asegurar escala y diseño) */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
           <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary italic flex items-center gap-2">
                <User className="h-8 w-8 text-secondary" /> Registrar Nuevo Socio
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">Ingresa los datos del inversionista para la ronda estratégica FF01.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><User className="h-3 w-3" /> Nombre Completo</Label>
                <Input 
                  placeholder="Ej: Paulo Córdova"
                  value={leadForm.name} 
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} 
                  className="h-12 rounded-xl focus:ring-secondary border-primary/10 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><CreditCard className="h-3 w-3" /> RUT</Label>
                  <Input 
                    placeholder="12.345.678-9"
                    value={leadForm.rut} 
                    onChange={(e) => setLeadForm({...leadForm, rut: e.target.value})} 
                    className="h-12 rounded-xl border-primary/10 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><Briefcase className="h-3 w-3" /> Monto Aporte</Label>
                  <Input 
                    type="number"
                    placeholder="1000000"
                    value={leadForm.amount} 
                    onChange={(e) => setLeadForm({...leadForm, amount: parseInt(e.target.value) || 0})} 
                    className="h-12 rounded-xl border-primary/10 font-black text-primary text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><Mail className="h-3 w-3" /> Correo Institucional</Label>
                <Input 
                  placeholder="socio@correo.cl"
                  value={leadForm.email} 
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} 
                  className="h-12 rounded-xl border-primary/10 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3" /> Dirección Comercial/Particular</Label>
                <Input 
                  placeholder="Avenida Apoquindo 3990, Las Condes"
                  value={leadForm.address} 
                  onChange={(e) => setLeadForm({...leadForm, address: e.target.value})} 
                  className="h-12 rounded-xl border-primary/10 font-medium"
                />
              </div>
              <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/20 shadow-inner">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Participación Proyectada Oralab</p>
                <p className="text-3xl font-black text-primary italic">
                  {((leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL).toFixed(4)}%
                </p>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" className="rounded-full h-12 px-8 font-bold border-primary/10" onClick={() => setIsCreateDialogOpen(false)}>Descartar</Button>
              <Button onClick={handleCreateMilestone} className="bg-primary font-black rounded-full h-12 px-10 shadow-xl hover:bg-secondary transition-all">
                <Save className="h-5 w-5 mr-2" /> Formalizar Registro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogo Edicion de Socio */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                <Pencil className="h-7 w-7 text-secondary" /> Modificar Ficha de Socio
              </DialogTitle>
              <DialogDescription className="font-medium">Ajusta los datos del inversionista y su participación en la ronda FF01.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-1"><User className="h-3 w-3" /> Nombre Completo</Label>
                <Input 
                  value={leadForm.name} 
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} 
                  className="h-11 rounded-xl border-primary/10 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-1"><CreditCard className="h-3 w-3" /> RUT</Label>
                  <Input 
                    value={leadForm.rut} 
                    onChange={(e) => setLeadForm({...leadForm, rut: e.target.value})} 
                    className="h-11 rounded-xl border-primary/10 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-1"><Briefcase className="h-3 w-3" /> Monto Aporte</Label>
                  <Input 
                    type="number"
                    value={leadForm.amount} 
                    onChange={(e) => setLeadForm({...leadForm, amount: parseInt(e.target.value) || 0})} 
                    className="h-11 rounded-xl border-primary/10 font-black text-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</Label>
                <Input 
                  value={leadForm.email} 
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} 
                  className="h-11 rounded-xl border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección</Label>
                <Input 
                  value={leadForm.address} 
                  onChange={(e) => setLeadForm({...leadForm, address: e.target.value})} 
                  className="h-11 rounded-xl border-primary/10"
                />
              </div>
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-inner">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-secondary" /> Nueva Participación Proyectada</p>
                <p className="text-3xl font-black text-primary italic">
                  {((leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL).toFixed(4)}%
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full h-11 px-8" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!db || !editingLead) return;
                try {
                  await updateDoc(doc(db, "contract_leads", editingLead.id), {
                    ...leadForm,
                    equity: (leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL,
                    updatedAt: serverTimestamp()
                  });
                  toast({ title: "Actualizado" });
                  setIsEditDialogOpen(false);
                } catch (e) { toast({ variant: "destructive", title: "Error" }); }
              }} className="bg-primary font-black rounded-full h-11 px-10 shadow-lg hover:bg-secondary transition-all">
                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function handleDeleteContractLead(id: string) {
  // Logic already defined inside ReceptionPage for non-blocking if needed, 
  // but here I'm using component scope for direct Firestore access
}
