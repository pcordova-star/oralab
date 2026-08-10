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
  ExternalLink,
  TrendingUp,
  Target,
  FileBarChart,
  History,
  Newspaper
} from "lucide-react";
import { format, parseISO } from "date-fns";
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
  const { data: newsItems, isLoading: loadingNews } = useCollection(newsRef);
  const { data: quotations, isLoading: loadingQuotes } = useCollection(quotationsRef);
  const { data: milestones, isLoading: loadingMilestones } = useCollection(milestonesRef);
  const { data: partners, isLoading: loadingPartners } = useCollection(contractLeadsRef);

  const bookings = (rawBookings || []).sort((a, b) => (b.scheduledDate || "").localeCompare(a.scheduledDate || ""));

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

  const handleSaveQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.length === 0) return;
    const netTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const data = { clientName, clientCompany, clientEmail, clientPhone, items, total: netTotal, notes: quoteNotes, exchangeRate, status: quoteStatus };
    if (editingQuoteId) {
      updateDocumentNonBlocking(doc(db, "quotations", editingQuoteId), { ...data, updatedAt: serverTimestamp() });
    } else {
      addDocumentNonBlocking(collection(db, "quotations"), { ...data, createdAt: serverTimestamp() });
    }
    setIsQuoteDialogOpen(false);
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
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando...</TableCell></TableRow>
                    ) : bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-black text-primary">
                          {b.scheduledDate} <span className="text-[10px] text-muted-foreground ml-2">{b.scheduledTime} hrs</span>
                        </TableCell>
                        <TableCell className="font-bold">{b.firstName} {b.lastNameFather}</TableCell>
                        <TableCell className="italic text-secondary font-black">{b.examType}</TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="text-right">
                          <Select value={b.status} onValueChange={(val) => updateDocumentNonBlocking(doc(db!, "bookings", b.id), { status: val, updatedAt: serverTimestamp() })}>
                            <SelectTrigger className="w-[150px] h-8 text-[10px] rounded-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Agendado</SelectItem>
                              <SelectItem value="arrived">En sala</SelectItem>
                              <SelectItem value="in_progress">Iniciado</SelectItem>
                              <SelectItem value="completed">Finalizado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: INFORMES */}
          <TabsContent value="diagnostics">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-secondary/5 border-b">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <FileBarChart className="h-6 w-6 text-secondary" /> Bitácoras Clínicas (En Casa)
                </CardTitle>
                <CardDescription>Auditoría de tiempos de soplido para pacientes que usaron el Asistente Digital.</CardDescription>
              </CardHeader>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(bookings || []).filter(b => b.testLogs && b.testLogs.length > 0).map((b) => (
                  <Card key={b.id} className="border-primary/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-primary/5 p-4 border-b">
                       <p className="text-[10px] font-black text-secondary uppercase mb-1">Paciente</p>
                       <h4 className="font-black text-primary">{b.firstName} {b.lastNameFather}</h4>
                       <Badge className="bg-white text-secondary text-[9px] mt-1 border-secondary/20">{b.examType}</Badge>
                    </div>
                    <div className="p-4 space-y-2 max-h-[200px] overflow-y-auto bg-muted/10">
                       {b.testLogs.map((log: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-white/50 border-dashed last:border-0">
                           <span className="font-bold text-muted-foreground">{log.stepName}</span>
                           <span className="font-black text-primary italic">{format(new Date(log.timestamp), "HH:mm")} hrs</span>
                         </div>
                       ))}
                    </div>
                  </Card>
                ))}
                {(bookings || []).filter(b => b.testLogs && b.testLogs.length > 0).length === 0 && (
                   <p className="col-span-full text-center py-20 italic text-muted-foreground">No hay bitácoras digitales registradas recientemente.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* TAB: CRM VENTAS */}
          <TabsContent value="crm-ventas">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-secondary" /> CRM Sunvou Chile
                </CardTitle>
                <Button onClick={() => { resetQuoteForm(); setIsQuoteDialogOpen(true); }} className="bg-primary font-black rounded-full shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Propuesta
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold text-[10px] uppercase">Estado</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase">Cliente / Institución</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase text-right">Total IVA Inc.</TableHead>
                      <TableHead className="text-right font-bold text-[10px] uppercase">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations?.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-black text-[9px] uppercase", q.status === 'accepted' ? "bg-green-50 text-green-600" : "bg-slate-50")}>{q.status}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">{q.clientName} <span className="text-[10px] text-muted-foreground block">{q.clientCompany}</span></TableCell>
                        <TableCell className="text-right font-black">${Math.round(q.total * 1.19).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "quotations", q.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: NOTICIAS */}
          <TabsContent value="news">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-secondary/5 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <Newspaper className="h-6 w-6 text-secondary" /> Mural de Noticias
                </CardTitle>
                <Button onClick={() => setIsNewsDialogOpen(true)} className="bg-primary font-black rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Nueva Noticia
                </Button>
              </CardHeader>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems?.map((n) => (
                  <Card key={n.id} className="overflow-hidden border-primary/5">
                    <div className="relative aspect-video">
                      <Image src={n.imageUrl} alt={n.title} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-black text-primary">{n.title}</h4>
                      <Button variant="ghost" className="text-red-400 mt-2 h-8" onClick={() => deleteDocumentNonBlocking(doc(db!, "investor_updates", n.id))}><Trash2 className="h-3 w-3 mr-1" /> Eliminar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* TAB: SOCIOS */}
          <TabsContent value="investors">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
                  <Users className="h-6 w-6 text-secondary" /> Gestión de Socios
                </CardTitle>
                <CardDescription>Visualización y control de aportes confirmados (Contract Leads).</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold">Socio / Email</TableHead>
                      <TableHead className="font-bold text-right">Monto Aportado</TableHead>
                      <TableHead className="font-bold text-center">Estado Firma</TableHead>
                      <TableHead className="text-right font-bold">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-primary">{p.investorName}</span>
                              <span className="text-[10px] text-muted-foreground">{p.investorEmail}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right font-black text-secondary">${(p.amount || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                           <Badge className={cn("text-[9px] uppercase", p.status === 'fully_signed' ? "bg-green-500" : "bg-amber-500")}>
                             {p.status === 'fully_signed' ? 'Cerrado' : 'Pendiente'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "contract_leads", p.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {partners?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-10 italic">Sin socios registrados.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB: HITOS */}
          <TabsContent value="milestones">
            <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-amber-50 border-b flex flex-row justify-between items-center">
                <CardTitle className="text-2xl font-black text-amber-700 italic flex items-center gap-2">
                  <Target className="h-6 w-6 text-amber-500" /> Cronograma de Hitos
                </CardTitle>
                <Button onClick={() => setIsMilestoneDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700 font-black rounded-full">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Hito
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-bold">Fecha Proyectada</TableHead>
                      <TableHead className="font-bold">Hito Técnico</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="text-right font-bold">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {milestones?.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-black text-amber-700">{format(parseISO(m.date), "MMMM yyyy", { locale: es }).toUpperCase()}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-primary">{m.title}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">{m.description}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={m.status === 'completed' ? 'default' : 'outline'} className={cn("text-[9px] uppercase", m.status === 'completed' && "bg-green-500")}>
                             {m.status === 'completed' ? 'Logrado' : 'En Proceso'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => updateDocumentNonBlocking(doc(db!, "milestones", m.id), { status: m.status === 'completed' ? 'pending' : 'completed' })}>
                             <CheckCircle2 className={cn("h-4 w-4", m.status === 'completed' ? "text-green-500" : "text-muted-foreground")} />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "milestones", m.id))}><Trash2 className="h-4 w-4 text-red-300" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* DIALOGS */}
      <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-primary italic">Publicar Noticia</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Título</Label>
              <Input value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">URL Imagen</Label>
              <Input value={newsForm.imageUrl} onChange={(e) => setNewsForm({...newsForm, imageUrl: e.target.value})} />
              {newsForm.imageUrl && <div className="mt-2 relative aspect-video rounded-xl overflow-hidden border"><Image src={newsForm.imageUrl} alt="preview" fill className="object-cover" /></div>}
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Contenido</Label>
              <Textarea value={newsForm.content} onChange={(e) => setNewsForm({...newsForm, content: e.target.value})} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveNews} className="bg-primary rounded-full px-8">Publicar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-amber-700 italic">Nuevo Hito de Proyecto</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Título del Hito</Label>
              <Input value={milestoneForm.title} onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Fecha</Label>
              <Input type="date" value={milestoneForm.date} onChange={(e) => setMilestoneForm({...milestoneForm, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Descripción Corta</Label>
              <Textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({...milestoneForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveMilestone} className="bg-amber-600 rounded-full px-8">Guardar Hito</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}