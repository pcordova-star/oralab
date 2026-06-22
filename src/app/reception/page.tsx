
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
    const amountInWords = numeroALetras(lead.amount);
    const returnAmount = lead.amount * 0.2;

    addText("CONTRATO PRIVADO DE FINANCIAMIENTO Y PARTICIPACIÓN ECONÓMICA", 12, true, "center");
    y += 5;
    addText(`En Santiago de Chile, a ${currentDay} de ${currentMonth} de 2026, comparecen:`, 10, false, "justify");
    addText("Por una parte, TRESNA SpA, RUT N° 77.023.697-5, domiciliada en Avenida Apoquindo N° 3990, Oficina 605, comuna de Las Condes, Región Metropolitana, representada legalmente por don PAULO CÓRDOVA, cédula nacional de identidad N° 12.901.912-3, en adelante \"TRESNA\".", 10, false, "justify");
    addText("Y por la otra:", 10, true);
    addText(`Don(ña) ${lead.name}, RUT N° ${lead.rut}, domiciliado(a) en ${lead.address}, email ${lead.email}, en adelante el \"Inversionista\".`, 10, false, "justify");

    addText("PRIMERA: ANTECEDENTES", 10, true);
    addText("ORALAB es una unidad de negocio desarrollada y operada por TRESNA SpA. La Empresa ha abierto una ronda privada de financiamiento denominada \"Family & Friends 01\".", 10, false, "justify");

    addText("SEGUNDA: APORTE", 10, true);
    addText(`El Inversionista aporta a TRESNA SpA la suma de $${lead.amount.toLocaleString('es-CL')} (${amountInWords} pesos).`, 10, false, "justify");

    addText("TERCERA: DESTINO DE LOS FONDOS", 10, true);
    addText("Los recursos serán utilizados para: a) Compra e importación del analizador Sunvou DA7349. b) Capital de trabajo inicial.", 10, false, "justify");

    addText("CUARTA: DEVOLUCIÓN DEL CAPITAL Y RETORNO FIJO", 10, true);
    addText(`La Empresa destinará los ingresos operacionales de ORALAB al pago al Inversionista de: a) el 100% del capital aportado ($${lead.amount.toLocaleString('es-CL')}), y b) un retorno adicional del 20% ($${returnAmount.toLocaleString('es-CL')}). Se establece un plazo máximo para postergaciones de hasta 12 meses adicionales posteriores a los 12 meses mencionados al inicio de este párrafo.`, 10, false, "justify");

    addText("QUINTA: RESGUARDO SOBRE EL EQUIPO", 10, true);
    addText("Mientras existan pagos pendientes, el equipo Sunvou DA7349 no podrá ser vendido ni transferido sin autorización de los inversionistas.", 10, false, "justify");

    addText("SEXTA: PARTICIPACIÓN ECONÓMICA ORALAB", 10, true);
    addText(`El Inversionista adquirirá una participación económica permanente sobre ORALAB del ${lead.equity.toFixed(4)}% sobre las utilidades, calculada sobre la meta total de $13.500.000 para un 10% total de la ronda.`, 10, false, "justify");

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
