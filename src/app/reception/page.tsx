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
  Stethoscope,
  ShoppingCart,
  Calculator,
  Package,
  DollarSign,
  Send,
  Building2,
  Phone,
  Newspaper,
  ImageIcon,
  ExternalLink
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";
import Image from "next/image";

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

const DEFAULT_NOTES = "Vigencia de cotización: 15 días.\n- Plazo de Entrega: 15 a 20 días hábiles tras recepción de orden de compra y pago de anticipo. El plazo de entrega inicia a partir de la confirmación del primer depósito.\n- Forma de pago: 50% contra orden de compra y 50% contra entrega.\n- Garantía: 2 años.\n- Incluye capacitación técnica.";

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

  // NEWS Mural State
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  // CRM Quotations State
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
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return collection(db, "bookings");
  }, [db, user]);

  const newsRef = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, "investor_updates"), orderBy("date", "desc"));
  }, [db, user]);

  const quotationsRef = useMemoFirebase(() => {
    if (!db || !user || user.email !== ADMIN_EMAIL) return null;
    return query(collection(db, "quotations"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: rawBookings, isLoading: loadingBookings } = useCollection(bookingsRef);
  const { data: newsItems, isLoading: loadingNews } = useCollection(newsRef);
  const { data: quotations, isLoading: loadingQuotes } = useCollection(quotationsRef);

  const bookings = (rawBookings || []).sort((a, b) => (b.scheduledDate || "").localeCompare(a.scheduledDate || ""));

  // NEWS Logic
  const handleSaveNews = async () => {
    if (!db || !newsForm.title || !newsForm.content || !newsForm.imageUrl) {
      toast({ variant: "destructive", title: "Error", description: "Llene todos los campos." });
      return;
    }
    try {
      await addDocumentNonBlocking(collection(db, "investor_updates"), {
        ...newsForm,
        createdAt: serverTimestamp()
      });
      toast({ title: "Noticia publicada", description: "Ya está visible para los socios." });
      setIsNewsDialogOpen(false);
      setNewsForm({ title: "", content: "", imageUrl: "", date: format(new Date(), "yyyy-MM-dd") });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!db || !confirm("¿Eliminar esta noticia?")) return;
    deleteDocumentNonBlocking(doc(db, "investor_updates", id));
    toast({ title: "Eliminado" });
  };

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

  const handleRateChange = (newRate: number) => {
    setExchangeRate(newRate);
    const updatedItems = items.map(item => {
      if (item.unitPriceUSD !== undefined) {
        return { ...item, unitPrice: item.unitPriceUSD * newRate * COMMERCIAL_MARKUP };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSaveQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.length === 0) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Completa cliente e ítems." });
      return;
    }
    const netTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
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
    
    try {
      if (editingQuoteId) {
        updateDocumentNonBlocking(doc(db, "quotations", editingQuoteId), { ...data, updatedAt: serverTimestamp() });
        toast({ title: "Cotización actualizada" });
      } else {
        addDocumentNonBlocking(collection(db, "quotations"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Cotización creada" });
      }
      setIsQuoteDialogOpen(false);
      resetQuoteForm();
    } catch (e) {
      toast({ variant: "destructive", title: "Error al guardar" });
    }
  };

  const downloadQuotationPDF = (quote: any) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 15;
    const primaryRGB = [28, 104, 182];
    
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("TRESNA - ORALAB", margin, 25);
    doc.setFontSize(10);
    doc.text("Representación Oficial Sunvou Chile", margin, 32);
    
    y = 55;
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.text("PROPUESTA TÉCNICO-COMERCIAL", margin, y);
    y += 15;

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Nombre: ${quote.clientName}`, margin, y);
    doc.text(`Institución: ${quote.clientCompany || 'Particular'}`, 110, y);
    y += 20;

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("Descripción", margin + 5, y + 7);
    doc.text("Cant.", 140, y + 7);
    doc.text("Unitario", 160, y + 7);
    y += 15;

    doc.setTextColor(60, 60, 60);
    quote.items.forEach((item: any) => {
      doc.text(item.description, margin + 5, y);
      doc.text(item.quantity.toString(), 140, y);
      doc.text(`$${Math.round(item.unitPrice).toLocaleString()}`, 160, y);
      y += 10;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL IVA INC: $${Math.round(quote.total * (1 + IVA_RATE)).toLocaleString()}`, 130, y);

    doc.save(`Propuesta_Sunvou_${quote.clientName}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 uppercase font-black text-[9px]"><Clock className="h-3 w-3 mr-1" /> Agendado</Badge>;
      case "arrived": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-black text-[9px]"><UserCheck className="h-3 w-3 mr-1" /> En Espera</Badge>;
      case "in_progress": return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 uppercase font-black text-[9px]"><Activity className="h-3 w-3 mr-1" /> En Curso</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase font-black text-[9px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Finalizado</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase font-black text-[9px]"><AlertCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default: return <Badge variant="outline" className="text-[9px] uppercase font-black">{status}</Badge>;
    }
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), { status: newStatus, updatedAt: serverTimestamp() });
    toast({ title: "Estado actualizado" });
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-fit mx-auto grid grid-cols-6 shadow-inner border border-primary/5 mb-8">
            <TabsTrigger value="patients" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">Agenda</TabsTrigger>
            <TabsTrigger value="diagnostics" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px]">Informes</TabsTrigger>
            <TabsTrigger value="crm-ventas" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">CRM Ventas</TabsTrigger>
            <TabsTrigger value="news" className="rounded-full font-black px-4 data-[state=active]:bg-secondary data-[state=active]:text-white text-[10px]">Noticias</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-[10px]">Socios</TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-full font-black px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-white text-[10px]">Hitos</TabsTrigger>
          </TabsList>

          {/* TAB: AGENDA */}
          <TabsContent value="patients">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-secondary" /> Control de Agenda
                  </CardTitle>
                  <CardDescription>Resumen de pacientes para hoy y próximos días.</CardDescription>
                </div>
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
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando agenda...</TableCell></TableRow>
                    ) : bookings.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 italic">No hay reservas registradas.</TableCell></TableRow>
                    ) : (
                      bookings.map((b) => (
                        <TableRow key={b.id} className="hover:bg-primary/5 transition-colors">
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
                            <Select value={b.status} onValueChange={(val) => handleUpdateStatus(b.id, val)}>
                              <SelectTrigger className="w-[180px] h-8 text-[10px] font-bold rounded-full border-primary/20"><SelectValue placeholder="Estado..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Agendado</SelectItem>
                                <SelectItem value="arrived">En sala de espera</SelectItem>
                                <SelectItem value="in_progress">Test iniciado</SelectItem>
                                <SelectItem value="completed">Finalizado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: NOTICIAS MURAL */}
          <TabsContent value="news">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-secondary/5 border-b flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                    <Newspaper className="h-6 w-6 text-secondary" /> Mural de Noticias
                  </CardTitle>
                  <CardDescription>Publica fotos y avances para los socios inversionistas.</CardDescription>
                </div>
                <Button onClick={() => setIsNewsDialogOpen(true)} className="bg-primary font-black rounded-full h-10 px-8">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Noticia
                </Button>
              </CardHeader>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingNews ? (
                    <p className="col-span-full text-center py-10 italic">Cargando noticias...</p>
                  ) : newsItems?.length === 0 ? (
                    <p className="col-span-full text-center py-10 italic">No hay noticias publicadas.</p>
                  ) : (
                    newsItems?.map((n) => (
                      <Card key={n.id} className="overflow-hidden border-primary/5 rounded-2xl">
                        <div className="relative aspect-video">
                          <Image src={n.imageUrl} alt={n.title} fill className="object-cover" />
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{format(new Date(n.date + 'T00:00:00'), "dd MMMM yyyy", { locale: es })}</p>
                          <h4 className="font-black text-primary leading-tight">{n.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>
                        </CardContent>
                        <CardFooter className="p-4 border-t bg-muted/20 flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteNews(n.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Card>

            <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
              <DialogContent className="max-w-2xl rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-primary italic">Publicar en Portal de Inversionistas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Título de la noticia</Label>
                    <Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Ej: Llegada del equipo Sunvou" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Fecha</Label>
                      <Input type="date" value={newsForm.date} onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">URL de la Imagen <ImageIcon className="h-3 w-3" /></Label>
                      <Input value={newsForm.imageUrl} onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })} placeholder="https://..." />
                      <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Info className="h-3 w-3" /> Usa enlaces directos de PostImages o Imgur.
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  {newsForm.imageUrl && (
                    <div className="space-y-2">
                      <Label className="font-bold text-[10px] uppercase">Vista Previa</Label>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-dashed border-primary/20">
                        <img 
                          src={newsForm.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=URL+Inválida")}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="font-bold">Cuerpo de la noticia</Label>
                    <Textarea value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} className="min-h-[120px]" />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-4">
                  <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-primary hover:underline">
                    <ExternalLink className="h-3 w-3 mr-1" /> Subir foto a PostImages
                  </a>
                  <div className="flex-1" />
                  <Button variant="outline" className="rounded-full" onClick={() => setIsNewsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveNews} className="bg-primary font-black rounded-full px-10">Publicar Ahora</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* TAB: CRM VENTAS (COTIZACIONES) */}
          <TabsContent value="crm-ventas">
             <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-secondary/5 border-b flex flex-row justify-between items-center">
                   <div>
                     <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                       <ShoppingCart className="h-6 w-6 text-secondary" /> CRM Sunvou Chile
                     </CardTitle>
                     <CardDescription>Gestión comercial de equipamiento Sunvou® Breath Diagnostics.</CardDescription>
                   </div>
                   <Button onClick={() => { resetQuoteForm(); setIsQuoteDialogOpen(true); }} className="bg-primary font-black rounded-full h-10 px-8 shadow-lg">
                      <Plus className="mr-2 h-4 w-4" /> Nueva Propuesta
                   </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader>
                         <TableRow className="bg-muted/10">
                            <TableHead className="font-black text-[10px] uppercase">Estado</TableHead>
                            <TableHead className="font-black text-[10px] uppercase">Cliente / Institución</TableHead>
                            <TableHead className="font-black text-[10px] uppercase text-right">Total IVA Inc.</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase">Gestión</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingQuotes ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-10">Buscando propuestas...</TableCell></TableRow>
                        ) : quotations?.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground">No hay cotizaciones activas.</TableCell></TableRow>
                        ) : quotations?.map((q) => (
                          <TableRow key={q.id}>
                             <TableCell>
                                <Badge variant="outline" className={cn(
                                  "font-black text-[9px] uppercase border-primary/20",
                                  q.status === 'accepted' ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-500"
                                )}>
                                  {q.status === 'pending' ? 'Borrador' : q.status === 'sent' ? 'Enviada' : q.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                </Badge>
                             </TableCell>
                             <TableCell>
                                <div className="flex flex-col">
                                   <span className="font-bold text-primary">{q.clientName}</span>
                                   <span className="text-[10px] font-black text-muted-foreground uppercase">{q.clientCompany || 'Particular'}</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-right font-black text-primary">
                                ${Math.round((q.total || 0) * (1 + IVA_RATE)).toLocaleString()}
                             </TableCell>
                             <TableCell className="text-right flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingQuoteId(q.id); setClientName(q.clientName); setClientEmail(q.clientEmail); setClientCompany(q.clientCompany || ""); setClientPhone(q.clientPhone || ""); setItems(q.items || []); setExchangeRate(q.exchangeRate || DEFAULT_USD_RATE); setQuoteStatus(q.status || 'pending'); setQuoteNotes(q.notes || DEFAULT_NOTES); setIsQuoteDialogOpen(true); }} className="rounded-full h-8 w-8 text-primary"><Pencil className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" onClick={() => downloadQuotationPDF(q)} className="rounded-full h-8 font-black text-[9px]"><Download className="h-3 w-3 mr-1" /> PDF</Button>
                                <Button variant="ghost" size="icon" onClick={() => { if(confirm("¿Eliminar?")) deleteDocumentNonBlocking(doc(db!, "quotations", q.id)); }} className="rounded-full h-8 w-8 text-red-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                             </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </div>
             </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG: CRM QUOTATIONS */}
        <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-primary italic">Propuesta Sunvou Chile</DialogTitle>
                 <DialogDescription>Ajusta los ítems y condiciones para la clínica o laboratorio.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="font-bold">Cliente Destinatario</Label>
                          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Dr. Roberto Gómez" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-bold">Institución / Clínica</Label>
                          <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Ej: Clínica Las Condes" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="font-bold">Email de contacto</Label>
                          <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="cliente@correo.com" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-bold">Teléfono</Label>
                          <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+56 9 ..." />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black uppercase text-primary">Tasa Cambio (CLP/USD)</Label>
                       <Input type="number" value={exchangeRate} onChange={(e) => handleRateChange(parseInt(e.target.value) || 0)} className="font-black" />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[10px] font-black uppercase text-primary">Estado Comercial</Label>
                       <Select value={quoteStatus} onValueChange={(v) => setQuoteStatus(v as QuotationStatus)}>
                          <SelectTrigger className="font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="pending">Borrador</SelectItem>
                             <SelectItem value="sent">Enviada</SelectItem>
                             <SelectItem value="accepted">Aceptada</SelectItem>
                             <SelectItem value="rejected">Rechazada</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <Label className="font-black text-lg text-primary italic">Detalle de Equipamiento e Insumos</Label>
                       <Button variant="outline" size="sm" onClick={addItem} className="rounded-full font-bold border-primary/20"><Plus className="h-4 w-4 mr-1" /> Ítem Especial</Button>
                    </div>
                    <div className="space-y-2">
                       {items.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-xl border border-primary/5">
                             <div className="col-span-7"><Input value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Descripción..." className="bg-white h-8 text-xs" /></div>
                             <div className="col-span-2"><Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="bg-white h-8 text-xs text-center" /></div>
                             <div className="col-span-2"><Input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseInt(e.target.value) || 0)} className="bg-white h-8 text-xs font-black text-primary" /></div>
                             <div className="col-span-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-6 w-6 text-red-400"><Trash2 className="h-3 w-3" /></Button></div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:flex-1">
                       <Label className="font-bold text-xs uppercase mb-2 block">Notas y Condiciones</Label>
                       <Textarea value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)} className="bg-white min-h-[100px] text-xs" />
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-muted-foreground uppercase">Subtotal Neto: ${Math.round(items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0)).toLocaleString()}</p>
                       <p className="text-3xl font-black text-primary italic mt-1">TOTAL IVA INC: ${Math.round(items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0) * (1 + IVA_RATE)).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              <DialogFooter>
                 <Button variant="outline" className="rounded-full" onClick={() => setIsQuoteDialogOpen(false)}>Cancelar</Button>
                 <Button onClick={handleSaveQuotation} className="bg-primary font-black rounded-full px-10 shadow-lg">Emitir Cotización</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
