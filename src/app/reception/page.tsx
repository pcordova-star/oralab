
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, deleteDoc, doc, updateDoc, where, orderBy, serverTimestamp, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
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
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  LogOut,
  UserCheck,
  Trash2,
  CalendarDays,
  Clock,
  Pencil,
  FileText,
  Mail,
  Coins,
  Plus,
  Target,
  TrendingUp,
  Calendar as CalendarViewIcon,
  CheckCircle2,
  History,
  PenTool,
  Download
} from "lucide-react";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";

const ADMIN_EMAIL = "admin@oralab.cl";
const FUNDING_GOAL = 13500000;

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

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  
  // Create States
  const [isInvestorDialogOpen, setIsInvestorDialogOpen] = useState(false);
  const [investorName, setInvestorName] = useState("");
  const [investorAmount, setInvestorAmount] = useState("");
  const [investorStatus, setInvestorStatus] = useState<"confirmed" | "pending">("confirmed");

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    } else if (user && user.email !== ADMIN_EMAIL) {
      const auth = getAuth();
      signOut(auth).then(() => router.push("/login"));
    }
  }, [user, isUserLoading, router]);

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "";

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !dateString) return null;
    return query(collection(db, "bookings"), where("scheduledDate", "==", dateString));
  }, [db, dateString]);

  const allBookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "bookings"), where("status", "not-in", ["cancelled"]));
  }, [db]);

  const leadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "leads"), orderBy("createdAt", "desc"));
  }, [db]);

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const contractLeadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "contract_leads"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: rawBookings } = useCollection(bookingsQuery);
  const { data: allBookingsData } = useCollection(allBookingsQuery);
  const { data: leads } = useCollection(leadsQuery);
  const { data: investors } = useCollection(investorsQuery);
  const { data: contractLeads } = useCollection(contractLeadsQuery);

  const bookings = rawBookings ? [...rawBookings].sort((a, b) => 
    (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
  ) : [];

  const filteredBookings = bookings?.filter(b => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastNameFather?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestment = investors?.reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0;
  const progressPercentage = Math.min((totalInvestment / FUNDING_GOAL) * 100, 100);

  async function handleLogout() {
    const auth = getAuth();
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  }

  async function handleInvestorSubmit() {
    if (!db || !investorName || !investorAmount) return;
    const newNumber = (investors?.length || 0) + 1;
    await addDoc(collection(db, "investors"), {
      realName: investorName,
      investorNumber: newNumber,
      amount: parseInt(investorAmount),
      status: investorStatus,
      createdAt: serverTimestamp(),
    });
    toast({ title: "Inversionista agregado" });
    setIsInvestorDialogOpen(false);
    setInvestorName("");
    setInvestorAmount("");
  }

  const handleAdminMarkAsSigned = (lead: any) => {
    if (!db || !confirm("¿Marcar este contrato como 'Procesado'? (Recuerda que debes haberlo firmado en tu plataforma externa)")) return;
    const docRef = doc(db, "contract_leads", lead.id);
    updateDocumentNonBlocking(docRef, {
      status: "fully_signed",
      adminSignedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
    toast({ title: "Estado Actualizado", description: "El contrato se ha marcado como procesado." });
  };

  const handleDeleteContractLead = (id: string) => {
    if (!db || !confirm("¿Eliminar este registro de contrato? Esta acción es permanente.")) return;
    deleteDocumentNonBlocking(doc(db, "contract_leads", id));
    toast({ title: "Contrato eliminado" });
  };

  const generateFullPDF = (lead: any) => {
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
        doc.text(text, margin, y, { align: "left" });
        y += fontSize / 2 + 5;
      }
    };

    const currentDay = format(new Date(), "d");
    const currentMonth = format(new Date(), "MMMM", { locale: es });
    const amountInWords = numeroALetras(lead.amount);
    const returnAmount = lead.amount * 0.2;

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;

    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${lead.name}, cédula nacional de identidad N° ${lead.rut}, domiciliado(a) en ${lead.address}, email ${lead.email}, en adelante el \"Inversionista\".`, 10, false, "justify");
    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio. y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${lead.amount.toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo y gastos operacionales iniciales.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${lead.amount.toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${returnAmount.toLocaleString('es-CL')}).`, 10, false, "justify");
    addText("La suma total se pagará en siete cuotas mensuales iguales y sucesivas entre el mes 6 y el mes 12 contado desde la fecha de aporte, siempre que la unidad de negocio ORALAB cuente con flujo de caja operacional suficiente para ello. En caso de que el flujo disponible no sea suficiente en una fecha de pago determinada, la cuota correspondiente se postergará al mes siguiente en que exista disponibilidad, sin que ello constituya incumplimiento contractual, mora ni genere intereses penales. Se establece un plazo máximo para estas postergaciones de hasta 12 meses adicionales posteriores a los 12 meses mencionados al inicio de este párrafo. La Empresa informará al Inversionista de cualquier postergación.", 10, false, "justify");

    if (y > 250) { doc.addPage(); y = 20; }

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes a los inversionistas de la Ronda Family & Friends 01, el equipo Sunvou DA7349 adquirido con fondos de esta ronda no podrá ser vendido, transferido, dado en garantía a terceros, ni sujeto a cualquier gravamen, sin autorización escrita de la mayoría de dichos inversionistas. En caso de cese de operaciones de ORALAB, liquidación de sus activos, o venta del equipo señalado, el producto de dicha venta o liquidación se destinará prioritariamente al pago de los saldos pendientes.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`Adicionalmente a la devolución del capital y retorno señalado anteriormente, el Inversionista adquirirá una participación económica permanente sobre ORALAB. Las partes acuerdan que el total de la ronda Family & Friends 01 corresponde a una valorización que asigna un 10% de participación económica total a quienes aporten $13.500.000 requeridos. La participación económica individual para este aporte se calcula en un ${lead.equity.toFixed(4)}% sobre las utilidades de la unidad de negocio ORALAB.`, 10, false, "justify");

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

    addText("DÉCIMO TERCERA: DERECHO DE PREFERENCIA", 10, true);
    addText("En el evento de que TRESNA SpA decida la apertura de nuevas sucursales de la unidad de negocio ORALAB que requieran financiamiento externo, o se acuerden nuevas rondas de levantamiento de capital para la expansión de la misma, los inversionistas suscritos a la presente ronda Family & Friends 01 tendrán un derecho preferente para participar en dichas instancias, en igualdad de condiciones comerciales que se ofrezcan a terceros.", 10, false, "justify");

    y += 10;
    addText("Firmado en dos ejemplares del mismo tenor y fecha.", 10, false);
    
    y += 15;
    const signatureY = y + 25;
    
    // FIRMA ADMIN (Izquierda - Vacía para firma externa FEA)
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.setFontSize(8);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.text("Representante Legal TRESNA SpA", margin, signatureY + 9);
    doc.text("RUT 12.901.912-3", margin, signatureY + 13);

    // FIRMA INVERSIONISTA (Derecha - Sello de Validación FES)
    const invX = pageWidth - margin - 75;
    doc.setFillColor(240, 247, 255);
    doc.roundedRect(invX, signatureY - 22, 75, 20, 2, 2, 'F');
    doc.setTextColor(28, 104, 182);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("FIRMADO ELECTRÓNICAMENTE", invX + 37.5, signatureY - 17, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(`Identidad: ${lead.name.toUpperCase()}`, invX + 5, signatureY - 13);
    doc.text(`RUT: ${lead.rut}`, invX + 5, signatureY - 10);
    doc.text(`Timestamp: ${format(new Date(lead.investorSignedAt), "dd/MM/yyyy HH:mm:ss")}`, invX + 5, signatureY - 7);
    doc.text(`IP: ${lead.metadata?.ip || 'Validada'}`, invX + 5, signatureY - 4);

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - margin - 75, signatureY, pageWidth - margin, signatureY);
    doc.setFontSize(8);
    doc.text("INVERSIONISTA", pageWidth - margin, signatureY + 5, { align: "right" });
    doc.text(lead.name.toUpperCase(), pageWidth - margin, signatureY + 9, { align: "right" });

    doc.save(`Contrato_Para_Firmar_Oralab_${lead.name.replace(/\s+/g, '_')}.pdf`);
  };

  const hasBookingsOnDay = (date: Date) => {
    if (!allBookingsData) return false;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return allBookingsData.some(b => b.scheduledDate === formattedDate);
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3 italic">
              <UserCheck className="h-8 w-8 text-secondary" /> Panel Super Admin
            </h1>
            <p className="text-muted-foreground font-medium">Gestión de agenda, leads y formalización de capital.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/quotations">
              <Button variant="outline" className="rounded-full border-secondary text-secondary hover:bg-secondary/5 font-bold">
                <FileText className="mr-2 h-4 w-4" /> CRM Sunvou
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600 hover:bg-red-50 font-bold">
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          </div>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-full max-w-2xl mx-auto grid grid-cols-3">
            <TabsTrigger value="patients" className="rounded-full font-black uppercase text-xs flex items-center gap-2">
              <CalendarViewIcon className="h-3 w-3" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="leads" className="rounded-full font-black uppercase text-xs">Leads Sunvou</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black uppercase text-xs flex items-center gap-2">
              <Coins className="h-3 w-3" /> Inversionistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden sticky top-24">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-secondary" /> Selector de Fecha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border-none"
                      locale={es}
                      modifiers={{ booked: (date) => hasBookingsOnDay(date) }}
                      modifiersClassNames={{
                        booked: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-secondary after:rounded-full"
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem] min-h-[600px]">
                  <div className="p-6 border-b bg-primary/5 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-black text-primary italic">
                        {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: es }) : "Seleccione un día"}
                      </h2>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary font-black">
                        {filteredBookings?.length || 0} Pacientes
                      </Badge>
                    </div>
                    <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por nombre..." className="pl-10 rounded-full h-11 border-primary/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/10">
                        <TableHead className="font-black text-[10px] uppercase">Hora</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Paciente</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Examen</TableHead>
                        <TableHead className="font-black text-[10px] uppercase text-right pr-8">Acciones</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {filteredBookings?.map((b) => (
                          <TableRow key={b.id} className="group hover:bg-primary/5 transition-colors">
                            <TableCell className="font-black text-primary text-lg pl-6 italic">{b.scheduledTime} hrs</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-black text-primary">{b.firstName} {b.lastNameFather}</span>
                                <span className="text-[11px] font-bold text-muted-foreground">{b.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="bg-secondary/5 font-bold">{b.examType}</Badge></TableCell>
                            <TableCell className="text-right pr-6">
                               <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="bg-white shadow-xl border-secondary/20 overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-secondary/5 border-b">
                <CardTitle className="text-xl text-secondary font-black flex items-center gap-2 italic"><Mail className="h-6 w-6" /> Consultas Sunvou</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader><TableRow className="bg-muted/10">
                  <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Institución</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Mensaje</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {leads?.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-bold text-xs">{l.createdAt?.seconds ? format(new Date(l.createdAt.seconds * 1000), "dd/MM/yy") : "-"}</TableCell>
                      <TableCell><span className="font-black text-primary">{l.institution}</span></TableCell>
                      <TableCell className="text-xs italic text-muted-foreground">{l.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-primary text-white shadow-lg rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-20 w-20" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Invertido</p>
                  <h3 className="text-3xl font-black italic">${totalInvestment.toLocaleString('es-CL')}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Progreso Meta ($13.5M)</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5 bg-white/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg rounded-2xl border-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-secondary/10 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-secondary" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Socios Registrados</p>
                  </div>
                  <h3 className="text-3xl font-black text-primary italic">{investors?.length || 0}</h3>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg rounded-2xl border-primary/5 flex items-center justify-center">
                <Button onClick={() => setIsInvestorDialogOpen(true)} className="rounded-full bg-secondary font-black h-14 px-8 shadow-lg hover:scale-105 transition-transform">
                  <Plus className="mr-2 h-6 w-6" /> Registrar Aporte
                </Button>
              </Card>
            </div>

            <Tabs defaultValue="confirmed_investors" className="space-y-6">
              <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-2">
                <TabsTrigger value="confirmed_investors" className="rounded-full font-bold px-8">Socios Fundadores</TabsTrigger>
                <TabsTrigger value="contract_leads" className="rounded-full font-bold px-8 flex items-center gap-2">
                  <PenTool className="h-4 w-4" /> Contratos por Firmar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="confirmed_investors">
                <Card className="bg-white shadow-xl border-primary/20 overflow-hidden rounded-[2rem]">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-xl text-primary font-black flex items-center gap-2 italic"><Coins className="h-6 w-6 text-secondary" /> Registro Privado de Socios</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10">
                          <TableHead className="font-black text-[10px] uppercase pl-8"># Folio</TableHead>
                          <TableHead className="font-black text-[10px] uppercase">Inversionista</TableHead>
                          <TableHead className="font-black text-[10px] uppercase">Monto</TableHead>
                          <TableHead className="font-black text-[10px] uppercase text-center">Estado</TableHead>
                          <TableHead className="text-right font-black text-[10px] uppercase pr-8">Gestión</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investors?.map((inv) => (
                          <TableRow key={inv.id} className="hover:bg-primary/5 group">
                            <TableCell className="font-black text-primary pl-8 italic">#{inv.investorNumber}</TableCell>
                            <TableCell><span className="font-bold">{inv.realName}</span></TableCell>
                            <TableCell><span className="font-black text-primary">${(inv.amount || 0).toLocaleString('es-CL')}</span></TableCell>
                            <TableCell className="text-center">
                              <Badge className={cn("text-[9px] font-black uppercase", inv.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
                                {inv.status === "pending" ? "Por Confirmar" : "Confirmado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                               <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-300 hover:text-red-600 rounded-full h-8 w-8" 
                                  onClick={() => deleteDocumentNonBlocking(doc(db!, "investors", inv.id))}
                               >
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="contract_leads">
                <Card className="bg-white shadow-xl border-secondary/20 overflow-hidden rounded-[2rem]">
                  <CardHeader className="bg-secondary/5 border-b">
                    <CardTitle className="text-xl text-secondary font-black flex items-center gap-2 italic">
                      <PenTool className="h-6 w-6" /> Formalización de Contratos (FES)
                    </CardTitle>
                    <CardDescription>Descarga el contrato con la firma del socio para firmarlo externamente.</CardDescription>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10">
                          <TableHead className="font-black text-[10px] uppercase pl-8">Estado</TableHead>
                          <TableHead className="font-black text-[10px] uppercase">Inversionista</TableHead>
                          <TableHead className="font-black text-[10px] uppercase">Monto / Equity</TableHead>
                          <TableHead className="text-right font-black text-[10px] uppercase pr-8">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractLeads?.map((lead) => (
                          <TableRow key={lead.id} className="hover:bg-secondary/5 group">
                            <TableCell className="pl-8">
                              {lead.status === 'fully_signed' ? (
                                <Badge className="bg-green-100 text-green-700 text-[8px] font-black uppercase"><CheckCircle2 className="h-3 w-3 mr-1" /> Procesado</Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase"><Clock className="h-3 w-3 mr-1" /> Esperando Firma Admin</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-black text-primary">{lead.name}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{lead.rut}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex flex-col">
                                  <span className="font-black text-secondary">${lead.amount.toLocaleString('es-CL')}</span>
                                  <span className="text-[9px] font-bold text-muted-foreground">{lead.equity.toFixed(4)}% Participación</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                               <div className="flex justify-end gap-2">
                                  <Button 
                                    onClick={() => generateFullPDF(lead)} 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-full border-primary/20 text-primary h-8"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> Descargar para Firma
                                  </Button>
                                  {lead.status !== 'fully_signed' && (
                                    <Button onClick={() => handleAdminMarkAsSigned(lead)} className="bg-primary h-8 text-[10px] font-black uppercase rounded-full">
                                      Marcar como Listo
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-300 hover:text-red-600 rounded-full h-8 w-8"
                                    onClick={() => handleDeleteContractLead(lead.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo Registrar Nuevo Inversionista */}
      <Dialog open={isInvestorDialogOpen} onOpenChange={setIsInvestorDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black text-primary italic">Registrar Nuevo Aporte</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Nombre Real</label>
              <Input value={investorName} onChange={(e) => setInvestorName(e.target.value)} placeholder="Ej: Roberto Sánchez" className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Monto (CLP)</label>
                <Input type="number" value={investorAmount} onChange={(e) => setInvestorAmount(e.target.value)} placeholder="1.000.000" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Estado</label>
                <Select value={investorStatus} onValueChange={(v) => setInvestorStatus(v as "confirmed" | "pending")}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Por Confirmar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsInvestorDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvestorSubmit} className="bg-primary font-black rounded-full px-8 h-12">Guardar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
