
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
  DialogDescription,
  DialogTrigger
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
  Clock,
  CheckCircle2,
  Users,
  Pencil,
  Plus,
  Info,
  CalendarDays,
  LayoutGrid,
  Activity,
  UserCheck,
  AlertCircle,
  FileText,
  Search,
  Wind,
  ShoppingCart,
  ImageIcon,
  DollarSign,
  Package,
  Calculator,
  ShieldCheck,
  Send,
  Calendar as CalendarIcon
} from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";

const ADMIN_EMAIL = "admin@oralab.cl";
const IVA_RATE = 0.19;
const DEFAULT_USD_RATE = 950;
const COMMERCIAL_MARKUP = 2;

const SUNVOU_CATALOG = [
  { description: "Analizador Breath Diagnostics Sunvou-DA7349 (H2/CH4/H2S/CO2)", unitPriceUSD: 5000 },
  { description: "Sensor Hidrógeno SV-eH2-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 900 },
  { description: "Sensor Metano SV-eCH4-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Sensor Sulfuro de Hidrógeno SV-eH2S-03 (Incluye boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 4 Bolsas)", unitPriceUSD: 2 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 7 Bolsas)", unitPriceUSD: 3.5 },
  { description: "Capacitación Técnica y Protocolos Clínicos Sunvou Chile", unitPriceUSD: 0 }
];

const DEFAULT_NOTES = "Vigencia de cotización: 15 días.\n- Plazo de Entrega: 15 a 20 días hábiles tras recepción de orden de compra y pago de anticipo.\n- Forma de pago: 50% contra orden de compra y 50% contra entrega.\n- Garantía: 2 años.\n- Incluye capacitación técnica.";

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unitPriceUSD?: number;
}

type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected';

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // NEWS State
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: "", content: "", imageUrl: "", date: format(new Date(), "yyyy-MM-dd") });

  // CRM State
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_RATE);
  const [quoteStatus, setQuoteStatus] = useState<QuotationStatus>('pending');
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [quoteNotes, setQuoteNotes] = useState(DEFAULT_NOTES);

  // MILESTONES State
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", date: format(new Date(), "yyyy-MM-dd"), status: "pending" });

  useEffect(() => {
    setIsMounted(true);
    resetQuoteForm();
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
    if (!db) return null;
    return collection(db, "bookings");
  }, [db]);

  const newsRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investor_updates"), orderBy("date", "desc"));
  }, [db]);

  const quotationsRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "quotations"), orderBy("createdAt", "desc"));
  }, [db]);

  const milestonesRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "milestones"), orderBy("date", "asc"));
  }, [db]);

  const contractLeadsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "contract_leads");
  }, [db]);

  const { data: rawBookings, isLoading: loadingBookings } = useCollection(bookingsRef);
  const { data: newsItems } = useCollection(newsRef);
  const { data: quotations } = useCollection(quotationsRef);
  const { data: milestones } = useCollection(milestonesRef);
  const { data: partners } = useCollection(contractLeadsRef);

  const bookings = (rawBookings || []).sort((a, b) => (b.scheduledDate || "").localeCompare(a.scheduledDate || ""));

  const filteredBookings = bookings.filter(b => {
    if (!selectedDate) return true;
    const bookingDate = b.scheduledDate;
    const targetDate = format(selectedDate, "yyyy-MM-dd");
    return bookingDate === targetDate;
  });

  const datesWithBookings = Array.from(new Set(bookings.map(b => b.scheduledDate)))
    .map(dateStr => parseISO(dateStr));

  // CRM Logic
  const resetQuoteForm = () => {
    setEditingQuoteId(null);
    setClientName("");
    setClientCompany("");
    setClientEmail("");
    setClientPhone("");
    setExchangeRate(DEFAULT_USD_RATE);
    setQuoteStatus('pending');
    setItems(SUNVOU_CATALOG.map(c => ({
      description: c.description,
      quantity: 1,
      unitPriceUSD: c.unitPriceUSD,
      unitPrice: c.unitPriceUSD * DEFAULT_USD_RATE * COMMERCIAL_MARKUP
    })));
    setQuoteNotes(DEFAULT_NOTES);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateNetTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculateIVA = () => calculateNetTotal() * IVA_RATE;
  const calculateGrossTotal = () => calculateNetTotal() * (1 + IVA_RATE);

  const handleSaveQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Completa los datos mínimos." });
      return;
    }
    const netTotal = calculateNetTotal();
    const data = { 
      clientName, 
      clientCompany, 
      clientEmail, 
      clientPhone, 
      items, 
      total: netTotal, 
      notes: quoteNotes, 
      exchangeRate, 
      status: quoteStatus 
    };

    if (editingQuoteId) {
      updateDocumentNonBlocking(doc(db, "quotations", editingQuoteId), { ...data, updatedAt: serverTimestamp() });
      toast({ title: "Actualizado", description: "Cambios guardados." });
    } else {
      addDocumentNonBlocking(collection(db, "quotations"), { ...data, createdAt: serverTimestamp() });
      toast({ title: "Creado", description: "Cotización registrada." });
    }
    setIsQuoteDialogOpen(false);
  };

  const handleEditOpen = (quote: any) => {
    setEditingQuoteId(quote.id);
    setClientName(quote.clientName || "");
    setClientCompany(quote.clientCompany || "");
    setClientEmail(quote.clientEmail || "");
    setClientPhone(quote.clientPhone || "");
    setItems(quote.items || []);
    setQuoteNotes(quote.notes || DEFAULT_NOTES);
    setExchangeRate(quote.exchangeRate || DEFAULT_USD_RATE);
    setQuoteStatus(quote.status || 'pending');
    setIsQuoteDialogOpen(true);
  };

  const downloadQuotationPDF = (quote: any) => {
    const pdf = new jsPDF();
    const margin = 20;
    const pageHeight = pdf.internal.pageSize.height;
    let y = 15;
    const primaryRGB = [28, 104, 182];
    
    pdf.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.text("TRESNA - ORALAB", margin, 25);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Representación Oficial Sunvou® Breath Diagnostics en Chile", margin, 32);
    pdf.text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 145, 25);
    y = 55;
    pdf.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROPUESTA TÉCNICO-COMERCIAL", margin, y);
    y += 15;
    pdf.setFillColor(245, 247, 249);
    pdf.setDrawColor(230, 235, 240);
    pdf.roundedRect(margin, y, 170, 40, 3, 3, 'FD');
    pdf.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.setFontSize(11);
    pdf.text("DESTINATARIO", margin + 5, y + 10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Nombre: ${quote.clientName}`, margin + 5, y + 20);
    pdf.text(`Institución: ${quote.clientCompany || 'Particular'}`, margin + 5, y + 28);
    pdf.text(`Email: ${quote.clientEmail}`, 110, y + 20);
    pdf.text(`Teléfono: ${quote.clientPhone || 'No registrado'}`, 110, y + 28);
    y += 50;
    pdf.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("DETALLE DE EQUIPAMIENTO E INSUMOS", margin, y);
    y += 8;
    pdf.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.rect(margin, y, 170, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text("Descripción del Producto", margin + 5, y + 7);
    pdf.text("Cant.", 140, y + 7);
    pdf.text("Unitario", 160, y + 7);
    y += 10;
    pdf.setTextColor(60, 60, 60);
    pdf.setFont("helvetica", "normal");
    quote.items.forEach((item: any) => {
      const splitDesc = pdf.splitTextToSize(item.description, 110);
      pdf.text(splitDesc, margin + 5, y + 7);
      pdf.text(item.quantity.toString(), 140, y + 7);
      pdf.text(`$${Math.round(item.unitPrice).toLocaleString()}`, 160, y + 7);
      y += (splitDesc.length * 5) + 5;
      pdf.line(margin, y, margin + 170, y);
    });
    y += 10;
    const netTotal = quote.total;
    const iva = netTotal * IVA_RATE;
    const grossTotal = netTotal * (1 + IVA_RATE);
    pdf.text(`SUBTOTAL NETO: $${Math.round(netTotal).toLocaleString()}`, 190, y, { align: 'right' });
    y += 7;
    pdf.text(`IVA (19%): $${Math.round(iva).toLocaleString()}`, 190, y, { align: 'right' });
    y += 10;
    pdf.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`TOTAL (IVA INC.): $${Math.round(grossTotal).toLocaleString()}`, 190, y, { align: 'right' });
    y += 15;
    if (quote.notes) {
      pdf.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
      pdf.setFontSize(11);
      pdf.text("CONDICIONES COMERCIALES", margin, y);
      y += 8;
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const splitNotes = pdf.splitTextToSize(quote.notes, 170);
      pdf.text(splitNotes, margin, y);
    }
    pdf.save(`Propuesta_Sunvou_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  // NEWS Logic
  const handleSaveNews = async () => {
    if (!db || !newsForm.title || !newsForm.imageUrl) return;
    addDocumentNonBlocking(collection(db, "investor_updates"), { ...newsForm, createdAt: serverTimestamp() });
    setIsNewsDialogOpen(false);
    setNewsForm({ title: "", content: "", imageUrl: "", date: format(new Date(), "yyyy-MM-dd") });
  };

  // MILESTONES Logic
  const handleSaveMilestone = async () => {
    if (!db || !milestoneForm.title) return;
    addDocumentNonBlocking(collection(db, "milestones"), { ...milestoneForm, createdAt: serverTimestamp() });
    setIsMilestoneDialogOpen(false);
    setMilestoneForm({ title: "", description: "", date: format(new Date(), "yyyy-MM-dd"), status: "pending" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 uppercase font-black text-[9px]"><Clock className="h-3 w-3 mr-1" /> Agendado</Badge>;
      case "arrived": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-black text-[9px]"><UserCheck className="h-3 w-3 mr-1" /> En Sala</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 uppercase font-black text-[9px]"><Activity className="h-3 w-3 mr-1" /> En Curso</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase font-black text-[9px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Finalizado</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase font-black text-[9px]"><AlertCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default: return <Badge variant="outline" className="text-[9px] uppercase font-black">{status}</Badge>;
    }
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-6 shadow-inner border border-primary/5 mb-8 overflow-x-auto">
            <TabsTrigger value="patients" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">Agenda</TabsTrigger>
            <TabsTrigger value="diagnostics" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px]">Informes</TabsTrigger>
            <TabsTrigger value="crm-ventas" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">CRM Ventas</TabsTrigger>
            <TabsTrigger value="news" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px]">Noticias</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">Socios</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-full font-black px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-[10px]">Hitos</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <Card className="lg:col-span-4 bg-white shadow-xl border-primary/10 rounded-[2rem] p-6 h-fit sticky top-20">
                <div className="flex items-center gap-2 mb-4 text-primary font-black italic">
                   <CalendarIcon className="h-5 w-5 text-secondary" /> Vista Mensual
                </div>
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={es} className="rounded-md border border-primary/5 mx-auto" modifiers={{ booked: datesWithBookings }} modifiersStyles={{ booked: { fontWeight: 'bold', border: '2px solid hsl(var(--secondary))', color: 'hsl(var(--primary))' } }} />
              </Card>
              <Card className="lg:col-span-8 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center py-6">
                  <div>
                    <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2"><LayoutGrid className="h-6 w-6 text-secondary" /> Agenda del Día</CardTitle>
                    <CardDescription className="font-bold text-secondary uppercase text-[10px] tracking-widest">{selectedDate ? format(selectedDate, "PPPP", { locale: es }) : "Seleccione una fecha"}</CardDescription>
                  </div>
                  <Badge className="bg-primary text-white font-black px-4 rounded-full">{filteredBookings.length} Pacientes</Badge>
                </CardHeader>
                <Table>
                  <TableHeader><TableRow className="bg-muted/10"><TableHead className="font-bold">Hora</TableHead><TableHead className="font-bold">Paciente</TableHead><TableHead className="font-bold">Estado</TableHead><TableHead className="text-right font-bold">Gestión</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-black text-primary">{b.scheduledTime}</TableCell>
                        <TableCell><span className="font-black text-primary">{b.firstName} {b.lastNameFather}</span></TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="text-right">
                          <Select value={b.status} onValueChange={(val) => updateDocumentNonBlocking(doc(db!, "bookings", b.id), { status: val })}>
                            <SelectTrigger className="w-[140px] h-8 text-[10px] rounded-full"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="pending">Agendado</SelectItem><SelectItem value="arrived">En sala</SelectItem><SelectItem value="completed">Finalizado</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crm-ventas">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-secondary" /> CRM Sunvou Chile</CardTitle>
                <Button onClick={() => { resetQuoteForm(); setIsQuoteDialogOpen(true); }} className="bg-primary font-black rounded-full shadow-lg"><Plus className="mr-2 h-4 w-4" /> Nueva Propuesta</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow className="bg-muted/10"><TableHead className="font-bold text-[10px] uppercase">Estado</TableHead><TableHead className="font-bold text-[10px] uppercase">Cliente</TableHead><TableHead className="font-bold text-[10px] uppercase text-right">Total IVA Inc.</TableHead><TableHead className="text-right font-bold text-[10px] uppercase">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {quotations?.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell><Badge variant="outline" className="text-[9px] font-black uppercase">{q.status}</Badge></TableCell>
                      <TableCell className="font-bold text-primary">{q.clientName}<span className="text-[10px] text-muted-foreground block">{q.clientCompany}</span></TableCell>
                      <TableCell className="text-right font-black">${Math.round((q.total || 0) * 1.19).toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditOpen(q)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => downloadQuotationPDF(q)}><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300" onClick={() => deleteDocumentNonBlocking(doc(db!, "quotations", q.id))}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
          <TabsContent value="news">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-secondary/5 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2"><Newspaper className="h-6 w-6 text-secondary" /> Mural de Noticias</CardTitle>
                <Button onClick={() => setIsNewsDialogOpen(true)} className="bg-primary font-black rounded-full"><Plus className="mr-2 h-4 w-4" /> Nueva Noticia</Button>
              </CardHeader>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems?.map((n) => (
                  <Card key={n.id} className="overflow-hidden border-primary/5">
                    <div className="relative aspect-video"><Image src={n.imageUrl} alt={n.title} fill className="object-cover" /></div>
                    <CardContent className="p-4">
                      <h4 className="font-black text-primary">{n.title}</h4>
                      <Button variant="ghost" className="text-red-400 mt-2 h-8" onClick={() => deleteDocumentNonBlocking(doc(db!, "investor_updates", n.id))}><Trash2 className="h-3 w-3 mr-1" /> Eliminar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-amber-50 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-amber-700 italic flex items-center gap-2"><Target className="h-6 w-6 text-amber-500" /> Cronograma de Hitos</CardTitle>
                <Button onClick={() => setIsMilestoneDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700 font-black rounded-full"><Plus className="mr-2 h-4 w-4" /> Nuevo Hito</Button>
              </CardHeader>
              <Table>
                <TableHeader><TableRow className="bg-muted/10"><TableHead className="font-bold">Fecha</TableHead><TableHead className="font-bold">Hito</TableHead><TableHead className="text-right font-bold">Gestión</TableHead></TableRow></TableHeader>
                <TableBody>
                  {milestones?.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-black text-amber-700">{m.date}</TableCell>
                      <TableCell className="font-bold text-primary">{m.title}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "milestones", m.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b"><CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2"><Users className="h-6 w-6 text-secondary" /> Gestión de Socios</CardTitle></CardHeader>
              <Table>
                <TableHeader><TableRow className="bg-muted/10"><TableHead className="font-bold">Socio</TableHead><TableHead className="font-bold text-right">Monto</TableHead><TableHead className="text-right font-bold">Gestión</TableHead></TableRow></TableHeader>
                <TableBody>
                  {partners?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-primary">{p.investorName}</TableCell>
                      <TableCell className="text-right font-black text-secondary">${(p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "contract_leads", p.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* CRM DIALOG */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary italic">{editingQuoteId ? "Editar Cotización" : "Nueva Cotización Sunvou"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary">Tasa del día (USD/CLP)</Label>
                <Input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(parseInt(e.target.value) || 0)} className="bg-white font-black" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-primary">Estado Comercial</Label>
                <Select value={quoteStatus} onValueChange={(v) => setQuoteStatus(v as QuotationStatus)}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Borrador</SelectItem><SelectItem value="sent">Enviada</SelectItem><SelectItem value="accepted">Aceptada</SelectItem><SelectItem value="rejected">Rechazada</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
              <div className="space-y-2"><Label className="font-bold">Cliente / Doctor</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-bold">Institución</Label><Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-bold">Email</Label><Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label className="font-bold">Teléfono</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between"><Label className="font-black text-lg text-primary">Detalle de Equipos e Insumos</Label><Button variant="outline" size="sm" onClick={addItem} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Ítem Extra</Button></div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-muted/20 p-2 rounded-xl border border-primary/5">
                  <div className="col-span-6"><Input value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="bg-white" /></div>
                  <div className="col-span-2"><Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="bg-white" /></div>
                  <div className="col-span-3"><Input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseInt(e.target.value) || 0)} className="bg-white font-bold" /></div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              ))}
              <div className="bg-primary/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <Textarea value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)} className="bg-white min-h-[100px] w-full md:w-[400px]" placeholder="Condiciones comerciales..." />
                <div className="text-right space-y-1">
                  <div className="text-2xl font-black text-primary italic">TOTAL IVA INC: ${Math.round(calculateGrossTotal()).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveQuotation} className="bg-primary font-black rounded-full px-10">{editingQuoteId ? "Guardar Cambios" : "Emitir Cotización"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEWS DIALOG */}
      <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-primary italic">Publicar Noticia</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label className="font-bold">Título</Label><Input value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} /></div>
            <div className="space-y-2"><Label className="font-bold">URL Imagen</Label><Input value={newsForm.imageUrl} onChange={(e) => setNewsForm({...newsForm, imageUrl: e.target.value})} /></div>
            <div className="space-y-2"><Label className="font-bold">Contenido</Label><Textarea value={newsForm.content} onChange={(e) => setNewsForm({...newsForm, content: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveNews} className="bg-primary rounded-full px-8">Publicar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MILESTONE DIALOG */}
      <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-amber-700 italic">Nuevo Hito de Proyecto</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label className="font-bold">Título</Label><Input value={milestoneForm.title} onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})} /></div>
            <div className="space-y-2"><Label className="font-bold">Fecha</Label><Input type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({...milestoneForm, date: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveMilestone} className="bg-amber-600 rounded-full px-8">Guardar Hito</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
