
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, updateDoc, addDoc, query, orderBy, deleteDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
  Calendar as CalendarIcon,
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
  History,
  LayoutGrid,
  Activity,
  UserCheck,
  AlertCircle,
  Beaker,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Wind,
  Stethoscope
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";

const ADMIN_EMAIL = "admin@oralab.cl";
const FUNDING_GOAL = 13500000;
const EQUITY_TOTAL = 10;

// Protocolos de tiempo para entrada de datos
const PROTOCOL_TIMES = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Interpretación de Resultados State
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<any>(null);
  const [ppmValues, setPpmValues] = useState<{time: number, h2: number, ch4: number, co2: number}[]>(
    PROTOCOL_TIMES.map(t => ({ time: t, h2: 0, ch4: 0, co2: 15 }))
  );
  
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
    return query(collection(db, "milestones"), orderBy("date", "asc"));
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

  // Citas del día seleccionado para la vista de calendario
  const filteredBookings = bookings.filter((b) => {
    if (!selectedDate || !b.scheduledDate) return false;
    return b.scheduledDate === format(selectedDate, "yyyy-MM-dd");
  });

  const totalRaised = contractLeads.reduce((acc, lead) => acc + (lead.amount || 0), 0);
  const validatedRaised = contractLeads
    .filter(lead => lead.status === 'fully_signed')
    .reduce((acc, lead) => acc + (lead.amount || 0), 0);
  const balanceRemaining = Math.max(0, FUNDING_GOAL - validatedRaised);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 uppercase font-black text-[9px]"><Clock className="h-3 w-3 mr-1" /> Agendado</Badge>;
      case "arrived": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-black text-[9px]"><UserCheck className="h-3 w-3 mr-1" /> En Espera</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase font-black text-[9px]"><Activity className="h-3 w-3 mr-1" /> En Curso</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase font-black text-[9px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Finalizado</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase font-black text-[9px]"><AlertCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default: return <Badge variant="outline" className="text-[9px] uppercase font-black">{status}</Badge>;
    }
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    if (!db) return;
    const bookingRef = doc(db, "bookings", bookingId);
    updateDocumentNonBlocking(bookingRef, { status: newStatus, updatedAt: serverTimestamp() });
    toast({
      title: "Estado actualizado",
      description: "El flujo del paciente ha sido modificado.",
    });
  };

  const calculateInterpretation = () => {
    if (!ppmValues || ppmValues.length === 0) return { h2: false, ch4: false };
    
    const baselineH2 = ppmValues[0].h2;
    const maxH2In90 = Math.max(...ppmValues.filter(p => p.time <= 90).map(p => p.h2));
    const maxCH4 = Math.max(...ppmValues.map(p => p.ch4));

    const isH2Positive = baselineH2 >= 20 || (maxH2In90 - baselineH2 >= 20);
    const isCH4Positive = maxCH4 >= 10;

    return { h2: isH2Positive, ch4: isCH4Positive, baselineH2, maxH2In90, maxCH4 };
  };

  const generateDiagnosticPDF = () => {
    if (!selectedPatientForReport) return;

    const { h2, ch4, baselineH2, maxH2In90, maxCH4 } = calculateInterpretation();
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    const primaryRGB = [28, 104, 182];
    const secondaryRGB = [25, 204, 204];

    // Header
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("ORALAB", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Laboratorio Clínico de Salud Digestiva Avanzada", margin, 32);
    doc.text("Tecnología Breath Diagnostics Sunvou®", 140, 32);

    y = 55;
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME TÉCNICO DE AIRE ESPIRADO", margin, y);
    y += 15;

    // Patient Info
    doc.setFillColor(245, 247, 249);
    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(margin, y, 170, 45, 3, 3, 'FD');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL PACIENTE", margin + 5, y + 10);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${selectedPatientForReport.firstName} ${selectedPatientForReport.lastNameFather}`, margin + 5, y + 20);
    doc.text(`Email: ${selectedPatientForReport.email}`, margin + 5, y + 28);
    doc.text(`Procedimiento: Test de Aire Espirado (${selectedPatientForReport.examType})`, margin + 5, y + 36);
    
    doc.text(`Fecha Test: ${format(parseISO(selectedPatientForReport.scheduledDate), "dd/MM/yyyy")}`, 110, y + 20);
    doc.text(`Médico: ${selectedPatientForReport.doctor || 'No especificado'}`, 110, y + 28);
    doc.text(`ID Informe: ORL-${selectedPatientForReport.id.substr(0,8).toUpperCase()}`, 110, y + 36);

    y += 60;

    // Results Table
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text("VALORES DE CONCENTRACIÓN DE GASES", margin, y);
    y += 8;

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Tiempo (min)", margin + 5, y + 7);
    doc.text("Hidrógeno (H2) ppm", margin + 50, y + 7);
    doc.text("Metano (CH4) ppm", margin + 95, y + 7);
    doc.text("CO2 Corregido", margin + 140, y + 7);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    ppmValues.forEach((val, i) => {
      doc.text(val.time.toString(), margin + 12, y + 7);
      doc.text(val.h2.toString(), margin + 65, y + 7);
      doc.text(val.ch4.toString(), margin + 110, y + 7);
      doc.text(val.co2.toString() + "%", margin + 150, y + 7);
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y + 10, margin + 170, y + 10);
      y += 10;
    });

    y += 10;

    // Interpretation Block
    doc.setFillColor(240, 247, 255);
    doc.roundedRect(margin, y, 170, 50, 3, 3, 'F');
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INTERPRETACIÓN DIAGNÓSTICA", margin + 5, y + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Logic H2
    const h2Result = h2 ? "POSITIVO" : "NEGATIVO";
    doc.text(`SIBO Hidrógeno (H2):`, margin + 5, y + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(h2 ? 200 : 60, 0, 0);
    doc.text(h2Result, margin + 55, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`(Basal: ${baselineH2} ppm | Alza en 90m: ${maxH2In90 - baselineH2} ppm)`, margin + 85, y + 22);

    // Logic CH4
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const ch4Result = ch4 ? "POSITIVO" : "NEGATIVO";
    doc.text(`IMO Metano (CH4):`, margin + 5, y + 32);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ch4 ? 200 : 60, 0, 0);
    doc.text(ch4Result, margin + 55, y + 32);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`(Valor máximo detectado: ${maxCH4} ppm)`, margin + 85, y + 32);

    // Final Recommendation
    doc.setFontSize(10);
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFont("helvetica", "bold");
    const summaryText = (h2 || ch4) 
      ? "Sugerencia: Se evidencia sobrecrecimiento bacteriano. Correlacionar con sintomatología clínica." 
      : "Sugerencia: Test dentro de rangos normales. No se evidencia sobrecrecimiento significativo.";
    doc.text(summaryText, margin + 5, y + 42);

    y += 65;

    // Footer and Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "Nota: Este informe es una interpretación técnica basada en los criterios del Consenso de Norteamérica de 2017. El diagnóstico definitivo debe ser realizado por el médico tratante integrando la historia clínica del paciente.";
    doc.text(doc.splitTextToSize(disclaimer, 170), margin, y);

    y += 15;
    doc.setDrawColor(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]);
    doc.line(margin, y, 70, y);
    doc.text("Validación Técnica Oralab", margin, y + 5);

    doc.save(`Informe_SIBO_${selectedPatientForReport.firstName}_${selectedPatientForReport.lastNameFather}.pdf`);
    toast({ title: "Informe Generado", description: "El PDF se ha descargado exitosamente." });
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

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo.", 10, false, "justify");

    y += 10;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 15;
    const signatureY = y + 25;
    checkPage(40);
    
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.text("Representante Legal TRESNA SpA", margin, signatureY + 9);

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
      toast({ title: "Socio Validado" });
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
    if (!db || !confirm("¿Eliminar este hito?")) return;
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

  const daysWithBookings = bookings.map(b => b.scheduledDate).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-5 shadow-inner border border-primary/5">
            <TabsTrigger value="patients" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[10px]">Agenda</TabsTrigger>
            <TabsTrigger value="calendar-view" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px]">Calendario</TabsTrigger>
            <TabsTrigger value="diagnostics" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white transition-all text-[10px]">Informes</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white transition-all text-[10px]">Socios</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-full font-black px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all text-[10px]">Hitos</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <LayoutGrid className="h-6 w-6 text-secondary" /> Control de Agenda
                </CardTitle>
                <CardDescription>Gestión de citas y kits de test de aire espirado SIBO.</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold">Fecha / Hora</TableHead>
                      <TableHead className="font-bold">Paciente</TableHead>
                      <TableHead className="font-bold">Examen</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="text-right font-bold">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBookings ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse">Sincronizando...</TableCell></TableRow>
                    ) : bookings.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No hay reservas registradas.</TableCell></TableRow>
                    ) : bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-primary">{b.scheduledDate ? format(parseISO(b.scheduledDate), "dd/MM/yyyy") : "Pendiente"}</span>
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
                          <div className="flex items-center justify-end gap-2">
                            <Select 
                              value={b.status} 
                              onValueChange={(val) => handleUpdateStatus(b.id, val)}
                            >
                              <SelectTrigger className="w-[180px] h-8 text-[10px] font-bold rounded-full border-primary/20">
                                <SelectValue placeholder="Estado..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Agendado</SelectItem>
                                <SelectItem value="arrived">En sala de espera</SelectItem>
                                <SelectItem value="in_progress">Test iniciado</SelectItem>
                                <SelectItem value="completed">Finalizado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                <SelectItem value="rescheduled">Reagendado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="calendar-view">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-4 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-secondary/5 border-b">
                  <CardTitle className="text-xl font-black text-secondary italic flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" /> Selector de Día
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    className="rounded-xl border border-primary/5"
                    modifiers={{
                      booked: (date) => daysWithBookings.includes(format(date, "yyyy-MM-dd"))
                    }}
                    modifiersClassNames={{
                      booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-black text-primary italic">
                      Citas para el {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : "..."}
                    </CardTitle>
                  </div>
                  <Badge className="bg-primary font-black px-4">{filteredBookings.length} Citas</Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Hora</TableHead>
                        <TableHead className="font-bold">Paciente</TableHead>
                        <TableHead className="font-bold">Examen</TableHead>
                        <TableHead className="font-bold">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground font-medium">
                            No hay horas agendadas para este día.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-black text-primary">{b.scheduledTime} hrs</TableCell>
                            <TableCell className="font-bold">{b.firstName} {b.lastNameFather}</TableCell>
                            <TableCell className="italic text-secondary font-medium">Test {b.examType}</TableCell>
                            <TableCell>{getStatusBadge(b.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <Card className="lg:col-span-4 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-xl font-black text-primary italic flex items-center gap-2">
                       <Search className="h-5 w-5 text-secondary" /> Buscar Paciente
                    </CardTitle>
                    <CardDescription>Selecciona un test finalizado para interpretar.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="max-h-[500px] overflow-y-auto">
                        {bookings.filter(b => b.status === 'completed').length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground italic text-xs">No hay tests finalizados pendientes de informe.</div>
                        ) : (
                          bookings.filter(b => b.status === 'completed').map((b) => (
                            <div 
                              key={b.id} 
                              onClick={() => setSelectedPatientForReport(b)}
                              className={cn(
                                "p-4 border-b cursor-pointer transition-colors hover:bg-muted/50",
                                selectedPatientForReport?.id === b.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                              )}
                            >
                               <p className="font-black text-primary text-sm uppercase">{b.firstName} {b.lastNameFather}</p>
                               <div className="flex justify-between items-center mt-1">
                                  <Badge variant="outline" className="text-[9px] font-bold">Test {b.examType}</Badge>
                                  <span className="text-[9px] font-bold text-muted-foreground">{format(parseISO(b.scheduledDate), "dd/MM/yy")}</span>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </CardContent>
               </Card>

               <Card className="lg:col-span-8 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden min-h-[600px]">
                  {selectedPatientForReport ? (
                    <>
                      <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="bg-secondary/20 p-3 rounded-2xl">
                               <Beaker className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                               <CardTitle className="text-xl font-black text-primary italic">Interpretación Clínica</CardTitle>
                               <p className="text-xs font-bold text-muted-foreground uppercase">{selectedPatientForReport.firstName} {selectedPatientForReport.lastNameFather}</p>
                            </div>
                         </div>
                         <Button onClick={generateDiagnosticPDF} className="bg-primary font-black rounded-full shadow-lg">
                            <FileText className="mr-2 h-4 w-4" /> Generar Informe Final
                         </Button>
                      </CardHeader>
                      <CardContent className="p-6">
                         <div className="grid gap-6">
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                               <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                               <p className="text-[11px] font-bold text-amber-800 leading-relaxed italic">
                                  Instrucciones: Ingrese los valores de PPM (partes por millón) del ticket impreso por el analizador Sunvou. 
                                  El sistema aplicará automáticamente los criterios diagnósticos internacionales.
                               </p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-primary/5">
                               <Table>
                                  <TableHeader className="bg-muted/50">
                                     <TableRow>
                                        <TableHead className="font-black text-[10px] uppercase">Tiempo (min)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-blue-600 flex items-center gap-1"><Wind className="h-3 w-3" /> H2 (ppm)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-emerald-600 flex items-center gap-1"><Wind className="h-3 w-3" /> CH4 (ppm)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-muted-foreground">CO2 (%)</TableHead>
                                     </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                     {ppmValues.map((val, idx) => (
                                       <TableRow key={idx} className="hover:bg-primary/5 transition-colors">
                                          <TableCell className="font-black text-primary">{val.time} min</TableCell>
                                          <TableCell>
                                             <Input 
                                               type="number" 
                                               className="h-8 w-20 font-black text-blue-600 focus:ring-blue-600" 
                                               value={val.h2} 
                                               onChange={(e) => {
                                                  const newVal = [...ppmValues];
                                                  newVal[idx].h2 = parseInt(e.target.value) || 0;
                                                  setPpmValues(newVal);
                                               }}
                                             />
                                          </TableCell>
                                          <TableCell>
                                             <Input 
                                               type="number" 
                                               className="h-8 w-20 font-black text-emerald-600 focus:ring-emerald-600" 
                                               value={val.ch4}
                                               onChange={(e) => {
                                                  const newVal = [...ppmValues];
                                                  newVal[idx].ch4 = parseInt(e.target.value) || 0;
                                                  setPpmValues(newVal);
                                               }}
                                             />
                                          </TableCell>
                                          <TableCell>
                                             <Input 
                                               type="number" 
                                               className="h-8 w-16 text-xs text-muted-foreground" 
                                               value={val.co2}
                                               onChange={(e) => {
                                                  const newVal = [...ppmValues];
                                                  newVal[idx].co2 = parseInt(e.target.value) || 0;
                                                  setPpmValues(newVal);
                                               }}
                                             />
                                          </TableCell>
                                       </TableRow>
                                     ))}
                                  </TableBody>
                               </Table>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className={cn(
                                 "p-6 rounded-[2rem] border-2 transition-all shadow-xl flex flex-col items-center justify-center text-center gap-2",
                                 calculateInterpretation().h2 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                               )}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interpretación Hidrógeno (H2)</p>
                                  <div className="flex items-center gap-2">
                                     {calculateInterpretation().h2 ? <XCircle className="h-6 w-6 text-red-600" /> : <CheckCircle className="h-6 w-6 text-green-600" />}
                                     <h4 className={cn("text-2xl font-black italic", calculateInterpretation().h2 ? "text-red-700" : "text-green-700")}>
                                        {calculateInterpretation().h2 ? "SIBO POSITIVO" : "NORMAL"}
                                     </h4>
                                  </div>
                                  <p className="text-[10px] font-bold text-muted-foreground mt-1">Basal: {calculateInterpretation().baselineH2} | Alza 90m: {calculateInterpretation().maxH2In90 - calculateInterpretation().baselineH2} ppm</p>
                               </div>

                               <div className={cn(
                                 "p-6 rounded-[2rem] border-2 transition-all shadow-xl flex flex-col items-center justify-center text-center gap-2",
                                 calculateInterpretation().ch4 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                               )}>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interpretación Metano (CH4)</p>
                                  <div className="flex items-center gap-2">
                                     {calculateInterpretation().ch4 ? <XCircle className="h-6 w-6 text-red-600" /> : <CheckCircle className="h-6 w-6 text-green-600" />}
                                     <h4 className={cn("text-2xl font-black italic", calculateInterpretation().ch4 ? "text-red-700" : "text-green-700")}>
                                        {calculateInterpretation().ch4 ? "IMO POSITIVO" : "NORMAL"}
                                     </h4>
                                  </div>
                                  <p className="text-[10px] font-bold text-muted-foreground mt-1">Valor Máximo: {calculateInterpretation().maxCH4} ppm</p>
                               </div>
                            </div>
                         </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                       <div className="bg-muted/50 p-6 rounded-full">
                          <Stethoscope className="h-12 w-12 text-muted-foreground/40" />
                       </div>
                       <div className="max-w-xs">
                          <h3 className="text-xl font-black text-primary/40 italic">Módulo de Resultados</h3>
                          <p className="text-sm text-muted-foreground font-medium">Seleccione un paciente del panel lateral para ingresar los datos del analizador y generar el informe clínico.</p>
                       </div>
                    </div>
                  )}
               </Card>
            </div>
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
                          <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "contract_leads", lead.id))} className="text-red-300 rounded-full h-8 w-8 ml-1"><Trash2 className="h-4 w-4" /></Button>
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
                             <TableCell className="font-black text-primary">{format(parseISO(m.date), "dd/MM/yyyy")}</TableCell>
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

        {/* Dialogos de Socios */}
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
                <Label className="font-black text-[10px] uppercase text-primary tracking-widest flex items-center gap-2"><Mail className="h-3 w-3" /> Correo Electrónico</Label>
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
              <Button onClick={async () => {
                if (!db || !leadForm.name || !leadForm.amount) return;
                try {
                  await addDoc(collection(db, "contract_leads"), {
                    ...leadForm,
                    equity: (leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL,
                    status: "signed_by_investor",
                    createdAt: serverTimestamp()
                  });
                  toast({ title: "Socio Registrado" });
                  setIsCreateDialogOpen(false);
                } catch (e) { toast({ variant: "destructive", title: "Error" }); }
              }} className="bg-primary font-black rounded-full h-12 px-10 shadow-xl hover:bg-secondary transition-all">
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
