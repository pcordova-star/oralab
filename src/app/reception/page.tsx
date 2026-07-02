
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, updateDoc, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus
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
  const [editingLead, setEditingLead] = useState<any>(null);
  const [leadForm, setLeadForm] = useState({
    name: "",
    rut: "",
    email: "",
    address: "",
    amount: 0
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

  const { data: rawBookings, isLoading: loadingBookings } = useCollection(bookingsRef);
  const { data: rawContractLeads, isLoading: loadingLeads } = useCollection(contractLeadsRef);

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
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "No se pudo actualizar el estado del socio." 
      });
    }
  };

  const handleEditClick = (lead: any) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name || "",
      rut: lead.rut || "",
      email: lead.email || "",
      address: lead.address || "",
      amount: lead.amount || 0
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateLead = async () => {
    if (!db || !leadForm.name || !leadForm.amount) return;
    
    try {
      const leadsRef = collection(db, "contract_leads");
      await addDoc(leadsRef, {
        ...leadForm,
        equity: (leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL,
        status: "signed_by_investor", // Se asume firmado al ser manual
        investorSignedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Socio Creado", description: "El nuevo inversionista se registró con éxito." });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (e) {
      toast({ variant: "destructive", title: "Error al crear socio" });
    }
  };

  const handleSaveEdit = async () => {
    if (!db || !editingLead) return;
    
    try {
      const leadRef = doc(db, "contract_leads", editingLead.id);
      const newEquity = (leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL;
      
      await updateDoc(leadRef, {
        ...leadForm,
        equity: newEquity,
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "Socio actualizado", description: "Los cambios se guardaron correctamente." });
      setIsEditDialogOpen(false);
      setEditingLead(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Error al guardar" });
    }
  };

  const resetForm = () => {
    setLeadForm({
      name: "",
      rut: "",
      email: "",
      address: "",
      amount: 0
    });
  };

  const handleDeleteContractLead = (id: string) => {
    if (!db || !confirm("¿Eliminar registro?")) return;
    deleteDocumentNonBlocking(doc(db, "contract_leads", id));
    toast({ title: "Registro eliminado" });
  };

  const handleDeleteBooking = (id: string) => {
    if (!db || !confirm("¿Deseas eliminar esta reserva de la agenda?")) return;
    deleteDocumentNonBlocking(doc(db, "bookings", id));
    toast({ title: "Cita eliminada" });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", id), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Estado actualizado" });
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-2">
            <TabsTrigger value="patients" className="rounded-full font-bold px-8">Agenda</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-bold px-8">Inversionistas</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-secondary" /> Control de Agenda
                    </CardTitle>
                    <CardDescription>Gestión de citas y kits de test de aire espirado SIBO.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                     <Badge className="bg-secondary font-black">{bookings.length} Reservas</Badge>
                  </div>
                </div>
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
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando agenda...</TableCell></TableRow>
                    ) : bookings.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 italic">No hay citas registradas.</TableCell></TableRow>
                    ) : (
                      bookings.map((b) => (
                        <TableRow key={b.id} className="hover:bg-primary/5 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-primary">
                                {b.scheduledDate ? format(new Date(b.scheduledDate + 'T00:00:00'), "dd/MM/yyyy") : "Pendiente"}
                              </span>
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {b.scheduledTime} hrs
                              </span>
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
                                <span className="text-[10px] font-bold flex items-center gap-1">
                                  {b.modality === 'home_kit' ? (
                                    <><MapPin className="h-3 w-3" /> Retiro de Kit</>
                                  ) : (
                                    <><User className="h-3 w-3" /> Presencial</>
                                  )}
                                </span>
                             </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(b.status)}</TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => handleStatusChange(b.id, 'arrived')}
                                 title="Marcar Llegada"
                                 className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                               >
                                 <CheckCircle2 className="h-4 w-4" />
                               </Button>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => handleDeleteBooking(b.id)}
                                 className="h-8 w-8 text-red-300 hover:text-red-600 hover:bg-red-50"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                      <Users className="h-6 w-6 text-secondary" /> Gestión de Socios FF01
                    </CardTitle>
                    <CardDescription>Revisión de aportes y validación de contratos Family & Friends.</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
                        <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-secondary" /> Total Registrado
                        </p>
                        <p className="text-xl font-black text-primary italic">${totalRaised.toLocaleString('es-CL')}</p>
                      </div>
                      <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 shadow-sm">
                        <p className="text-[10px] font-black text-secondary uppercase flex items-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-primary" /> Recaudación Real
                        </p>
                        <p className="text-xl font-black text-secondary italic">${validatedRaised.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
                      className="rounded-full bg-primary font-black h-12 px-6 shadow-lg ml-2"
                    >
                      <Plus className="mr-2 h-5 w-5" /> Nuevo Socio
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold">Socio</TableHead>
                      <TableHead className="font-bold">Monto Aportado</TableHead>
                      <TableHead className="font-bold">Participación</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="text-right font-bold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLeads ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando socios...</TableCell></TableRow>
                    ) : contractLeads.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 italic">No hay registros de inversión.</TableCell></TableRow>
                    ) : (
                      contractLeads.map((lead) => (
                        <TableRow key={lead.id} className="hover:bg-primary/5 transition-colors">
                          <TableCell>
                             <div className="flex flex-col">
                               <span className="font-black text-primary uppercase">{lead.name}</span>
                               <span className="text-[10px] font-bold text-muted-foreground">{lead.rut}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-black text-primary">
                              ${(lead.amount || 0).toLocaleString('es-CL')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-secondary/20 text-secondary font-black">
                              {(lead.equity || 0).toFixed(4)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={lead.status === 'fully_signed' ? 'default' : 'outline'} 
                              className={cn(lead.status === 'fully_signed' ? "bg-green-500 text-white border-none" : "bg-amber-50 text-amber-600 border-amber-200")}
                            >
                              {lead.status === 'fully_signed' ? 'Procesado' : 'Por Validar'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                               <Button 
                                 onClick={() => handleEditClick(lead)}
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-primary hover:bg-primary/10"
                                 title="Editar Socio"
                               >
                                 <Pencil className="h-4 w-4" />
                               </Button>
                               <Button 
                                 onClick={() => generateFullPDF(lead)} 
                                 variant="outline" 
                                 size="sm" 
                                 className="rounded-full h-8 font-bold text-[10px] border-primary/20 text-primary"
                               >
                                 <Download className="h-3 w-3 mr-1" /> CONTRATO
                               </Button>
                               {lead.status !== 'fully_signed' && (
                                 <Button 
                                   onClick={() => handleAdminMarkAsSigned(lead)} 
                                   className="bg-primary text-white h-8 text-[10px] rounded-full px-4 font-black shadow-md hover:bg-secondary transition-all"
                                 >
                                   <Briefcase className="h-3 w-3 mr-1" /> Validar Pago
                                 </Button>
                               )}
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 onClick={() => handleDeleteContractLead(lead.id)} 
                                 className="text-red-300 hover:text-red-600 h-8 w-8"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogo de Creación de Socio */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary italic">Registrar Nuevo Socio</DialogTitle>
              <DialogDescription>Ingresa los datos del inversionista para la ronda FF01.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                <Input 
                  placeholder="Ej: Paulo Córdova"
                  value={leadForm.name} 
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT</Label>
                  <Input 
                    placeholder="12.345.678-9"
                    value={leadForm.rut} 
                    onChange={(e) => setLeadForm({...leadForm, rut: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Monto Aporte</Label>
                  <Input 
                    type="number"
                    placeholder="1000000"
                    value={leadForm.amount} 
                    onChange={(e) => setLeadForm({...leadForm, amount: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Correo</Label>
                <Input 
                  placeholder="socio@correo.cl"
                  value={leadForm.email} 
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</Label>
                <Input 
                  placeholder="Avenida Siempre Viva 123"
                  value={leadForm.address} 
                  onChange={(e) => setLeadForm({...leadForm, address: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateLead} className="bg-primary font-black rounded-full px-8 shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> Crear Registro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogo de Edición de Socio */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary italic">Editar Socio</DialogTitle>
              <DialogDescription>Modifica los datos del inversionista y su participación.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nombre Completo</Label>
                <Input 
                  value={leadForm.name} 
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> RUT</Label>
                  <Input 
                    value={leadForm.rut} 
                    onChange={(e) => setLeadForm({...leadForm, rut: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Monto Aporte</Label>
                  <Input 
                    type="number"
                    value={leadForm.amount} 
                    onChange={(e) => setLeadForm({...leadForm, amount: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> Correo</Label>
                <Input 
                  value={leadForm.email} 
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Dirección</Label>
                <Input 
                  value={leadForm.address} 
                  onChange={(e) => setLeadForm({...leadForm, address: e.target.value})} 
                />
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nueva Participación Proyectada</p>
                <p className="text-2xl font-black text-primary italic">
                  {((leadForm.amount / FUNDING_GOAL) * EQUITY_TOTAL).toFixed(4)}%
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-full" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} className="bg-primary font-black rounded-full px-8 shadow-lg">
                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
