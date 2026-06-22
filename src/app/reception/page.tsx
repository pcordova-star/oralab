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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  
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

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const contractLeadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "contract_leads"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: rawBookings } = useCollection(bookingsQuery);
  const { data: investors } = useCollection(investorsQuery);
  const { data: contractLeads } = useCollection(contractLeadsQuery);

  const bookings = rawBookings ? [...rawBookings].sort((a, b) => 
    (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
  ) : [];

  const filteredBookings = bookings?.filter(b => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastNameFather?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!db || !confirm("¿Marcar como 'Procesado'?")) return;
    const docRef = doc(db, "contract_leads", lead.id);
    updateDocumentNonBlocking(docRef, {
      status: "fully_signed",
      adminSignedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    });
    toast({ title: "Estado Actualizado" });
  };

  const handleDeleteContractLead = (id: string) => {
    if (!db || !confirm("¿Eliminar registro del contrato?")) return;
    deleteDocumentNonBlocking(doc(db, "contract_leads", id));
    toast({ title: "Registro eliminado" });
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
    const amountInWords = numeroALetras(lead.amount);
    const returnAmount = lead.amount * 0.2;
    const equityPct = lead.equity.toFixed(4);

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;
    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, ambos domiciliados para estos efectos en la misma dirección, en adelante \"TRESNA\" o la \"Empresa\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${lead.name}, cédula nacional de identidad N° ${lead.rut}, domiciliado(a) en ${lead.address}, email ${lead.email}, en adelante el \"Inversionista\".`, 10, false, "justify");

    addText("Las partes acuerdan celebrar el presente Contrato Privado de Financiamiento y Participación Económica para el proyecto ORALAB, de acuerdo con las siguientes cláusulas:", 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA, destinada a la realización de exámenes de aire espirado para diagnóstico digestivo. Con el objeto de financiar la adquisición de equipamiento con los permisos y logística necesarios para operar en el laboratorio y capital de trabajo inicial, la Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${lead.amount.toLocaleString('es-CL')} (${amountInWords} pesos). La Empresa declara recibir dicho aporte a su entera satisfacción.`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo y gastos operacionales iniciales.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${lead.amount.toLocaleString('es-CL')}), y b) un retorno adicional equivalente al 20% del monto aportado ($${returnAmount.toLocaleString('es-CL')}).`, 10, false, "justify");
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
    checkPage(40);
    
    // Paulo Córdova (Admin) - Espacio Vacío para FEA
    doc.line(margin, signatureY, margin + 75, signatureY);
    doc.setFontSize(8);
    doc.text("PAULO CÓRDOVA", margin, signatureY + 5);
    doc.text("Representante Legal TRESNA SpA", margin, signatureY + 9);

    // Inversionista (Sello FES)
    const invX = pageWidth - margin - 75;
    doc.setFillColor(240, 247, 255);
    doc.roundedRect(invX, signatureY - 22, 75, 20, 2, 2, 'F');
    doc.setTextColor(28, 104, 182);
    doc.setFontSize(7);
    doc.text("FIRMADO ELECTRÓNICAMENTE", invX + 37.5, signatureY - 17, { align: "center" });
    doc.setFontSize(6);
    doc.text(`Nombre: ${lead.name.toUpperCase()}`, invX + 5, signatureY - 13);
    doc.text(`RUT: ${lead.rut}`, invX + 5, signatureY - 10);
    doc.text(`Fecha: ${format(new Date(lead.investorSignedAt), "dd/MM/yyyy HH:mm:ss")}`, invX + 5, signatureY - 7);
    doc.text(`IP: ${lead.metadata?.ip || 'Validada'}`, invX + 5, signatureY - 4);

    doc.setTextColor(0, 0, 0);
    doc.line(pageWidth - margin - 75, signatureY, pageWidth - margin, signatureY);
    doc.text("INVERSIONISTA", pageWidth - margin, signatureY + 5, { align: "right" });
    doc.text(lead.name.toUpperCase(), pageWidth - margin, signatureY + 9, { align: "right" });

    doc.save(`Contrato_Oralab_Final_${lead.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary italic">Panel Super Admin</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600">Salir</Button>
          </div>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-full max-w-2xl mx-auto grid grid-cols-3">
            <TabsTrigger value="patients" className="rounded-full font-black uppercase text-xs">Agenda</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-full font-black uppercase text-xs">Leads Sunvou</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black uppercase text-xs">Inversionistas</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] p-4">
                   <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={es} />
                </Card>
              </div>
              <div className="lg:col-span-8">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                   <Table>
                      <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Paciente</TableHead><TableHead>Examen</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {filteredBookings?.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-black">{b.scheduledTime}</TableCell>
                            <TableCell className="font-bold">{b.firstName} {b.lastNameFather}</TableCell>
                            <TableCell><Badge variant="outline">{b.examType}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </Card>
              </div>
             </div>
          </TabsContent>

          <TabsContent value="investors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-primary text-white p-6 rounded-2xl">
                 <p className="text-xs uppercase opacity-70">Total Invertido</p>
                 <h3 className="text-3xl font-black">${totalInvestment.toLocaleString('es-CL')}</h3>
                 <Progress value={progressPercentage} className="h-1.5 mt-4 bg-white/20" />
              </Card>
              <Card className="bg-white p-6 rounded-2xl border-primary/5 flex items-center justify-center">
                 <Button onClick={() => setIsInvestorDialogOpen(true)} className="rounded-full bg-secondary font-black">Registrar Aporte</Button>
              </Card>
            </div>

            <Tabs defaultValue="confirmed_investors" className="space-y-6">
              <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-2">
                <TabsTrigger value="confirmed_investors" className="rounded-full font-bold px-8">Socios Fundadores</TabsTrigger>
                <TabsTrigger value="contract_leads" className="rounded-full font-bold px-8">Contratos por Firmar</TabsTrigger>
              </TabsList>

              <TabsContent value="confirmed_investors">
                <Card className="bg-white shadow-xl border-primary/20 rounded-[2rem]">
                  <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nombre</TableHead><TableHead>Monto</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {investors?.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-black">#{inv.investorNumber}</TableCell>
                          <TableCell className="font-bold">{inv.realName}</TableCell>
                          <TableCell className="font-black text-primary">${inv.amount.toLocaleString('es-CL')}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "investors", inv.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="contract_leads">
                <Card className="bg-white shadow-xl border-secondary/20 rounded-[2rem]">
                  <Table>
                    <TableHeader><TableRow><TableHead>Socio</TableHead><TableHead>Monto</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {contractLeads?.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                             <div className="flex flex-col"><span className="font-black">{lead.name}</span><span className="text-[10px]">{lead.rut}</span></div>
                          </TableCell>
                          <TableCell className="font-black text-secondary">${lead.amount.toLocaleString('es-CL')}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                             <Button onClick={() => generateFullPDF(lead)} variant="outline" size="sm" className="rounded-full h-8"><Download className="h-3 w-3 mr-1" /> Descargar para Firma</Button>
                             {lead.status !== 'fully_signed' && <Button onClick={() => handleAdminMarkAsSigned(lead)} className="bg-primary h-8 text-[10px] rounded-full">Marcar Procesado</Button>}
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteContractLead(lead.id)}><Trash2 className="h-4 w-4 text-red-300" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isInvestorDialogOpen} onOpenChange={setIsInvestorDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black text-primary italic">Registrar Nuevo Aporte</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <Input value={investorName} onChange={(e) => setInvestorName(e.target.value)} placeholder="Nombre" />
            <Input type="number" value={investorAmount} onChange={(e) => setInvestorAmount(e.target.value)} placeholder="Monto" />
          </div>
          <DialogFooter>
            <Button onClick={handleInvestorSubmit} className="bg-primary font-black rounded-full">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
