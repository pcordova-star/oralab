
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, updateDoc, query, orderBy, deleteDoc, where } from "firebase/firestore";
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
  Clock,
  CheckCircle2,
  Users,
  Pencil,
  Plus,
  LayoutGrid,
  Activity,
  UserCheck,
  AlertCircle,
  Wind,
  Send,
  Newspaper,
  Target,
  Calendar as CalendarIcon,
  MapPin,
  MapPinned,
  Phone,
  Mail,
  Home,
  Building2,
  Wallet,
  CalendarClock,
  Stethoscope,
  BarChart3,
  History,
  Timer,
  MessageSquare,
  Handshake
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { jsPDF } from "jspdf";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";

const ADMIN_EMAIL = "admin@oralab.cl";
const IVA_RATE = 0.19;
const DEFAULT_USD_RATE = 950;
const COMMERCIAL_MARKUP = 2;
const SENSOR_DISCOUNT = 0.85;

const SUNVOU_CATALOG = [
  { description: "Analizador Breath Diagnostics Sunvou-DA7349 (H2/CH4/H2S/CO2)", unitPriceUSD: 5000 },
  { description: "Sensor Hidrógeno SV-eH2-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 900 },
  { description: "Sensor Metano SV-eCH4-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Sensor Sulfuro de Hidrógeno SV-eH2S-03 (Incluye boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 4 Bolsas)", unitPriceUSD: 2 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 7 Bolsas)", unitPriceUSD: 3.5 },
  { description: "Capacitación Técnica y Protocolos Clínicos Sunvou Chile", unitPriceUSD: 0 }
];

const DEFAULT_NOTES = "Vigencia de cotización: 15 días.\n- Plazo de Entrega: 20 a 30 días hábiles (dependiendo del stock) tras recepción de orden de compra y pago de anticipo.\n- Forma de pago: 70% contra orden de compra y 30% contra entrega.\n- Garantía: 2 años.\n- Incluye capacitación técnica Sunvou Chile.";

const TIME_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];

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
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<any>(null);

  // RESCHEDULE State
  const [reschedulingBooking, setReschedulingBooking] = useState<any>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<Date | undefined>(new Date());
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>("");

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

  // Firestore Queries
  const bookingsRef = useMemoFirebase(() => db ? collection(db, "bookings") : null, [db]);
  const newsRef = useMemoFirebase(() => db ? query(collection(db, "investor_updates"), orderBy("date", "desc")) : null, [db]);
  const quotationsRef = useMemoFirebase(() => db ? query(collection(db, "quotations"), orderBy("createdAt", "desc")) : null, [db]);
  const milestonesRef = useMemoFirebase(() => db ? query(collection(db, "milestones"), orderBy("date", "asc")) : null, [db]);
  const partnersRef = useMemoFirebase(() => db ? collection(db, "contract_leads") : null, [db]);
  const agreementRequestsRef = useMemoFirebase(() => db ? query(collection(db, "agreement_requests"), orderBy("createdAt", "desc")) : null, [db]);
  const leadsRef = useMemoFirebase(() => db ? query(collection(db, "leads"), orderBy("createdAt", "desc")) : null, [db]);

  const { data: rawBookings } = useCollection(bookingsRef);
  const { data: newsItems } = useCollection(newsRef);
  const { data: quotations } = useCollection(quotationsRef);
  const { data: milestones } = useCollection(milestonesRef);
  const { data: partners } = useCollection(partnersRef);
  const { data: agreementRequests } = useCollection(agreementRequestsRef);
  const { data: leads } = useCollection(leadsRef);

  const bookings = (rawBookings || []).sort((a, b) => (b.scheduledDate || "").localeCompare(a.scheduledDate || ""));
  const filteredBookings = bookings.filter(b => selectedDate && b.scheduledDate === format(selectedDate, "yyyy-MM-dd"));
  const datesWithBookings = Array.from(new Set(bookings.map(b => b.scheduledDate))).map(d => parseISO(d));

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
      unitPrice: Math.round(c.unitPriceUSD * DEFAULT_USD_RATE * COMMERCIAL_MARKUP * (c.description.includes("Sensor") ? SENSOR_DISCOUNT : 1))
    })));
    setQuoteNotes(DEFAULT_NOTES);
  };

  const calculateNetTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculateGrossTotal = () => calculateNetTotal() * (1 + IVA_RATE);

  const handleSaveQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.length === 0) return;
    const data = { clientName, clientCompany, clientEmail, clientPhone, items, total: calculateNetTotal(), notes: quoteNotes, exchangeRate, status: quoteStatus };
    if (editingQuoteId) {
      updateDocumentNonBlocking(doc(db, "quotations", editingQuoteId), { ...data, updatedAt: serverTimestamp() });
      toast({ title: "Actualizado" });
    } else {
      addDocumentNonBlocking(collection(db, "quotations"), { ...data, createdAt: serverTimestamp() });
      toast({ title: "Creado" });
    }
    setIsQuoteDialogOpen(false);
  };

  const downloadQuotationPDF = (quote: any) => {
    const pdf = new jsPDF();
    pdf.text("TRESNA - ORALAB", 20, 20);
    pdf.text(`Propuesta para: ${quote.clientName}`, 20, 30);
    pdf.text(`Total: $${Math.round((quote.total || 0) * 1.19).toLocaleString()}`, 20, 40);
    pdf.save(`Propuesta_${quote.clientName}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-slate-50 text-slate-700 uppercase font-black text-[9px]">Agendado</Badge>;
      case "arrived": return <Badge variant="outline" className="bg-blue-50 text-blue-700 uppercase font-black text-[9px]">En Sala</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 uppercase font-black text-[9px]">Finalizado</Badge>;
      default: return <Badge variant="outline" className="text-[9px] uppercase font-black">{status}</Badge>;
    }
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="clinical" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b pb-6">
            <div className="space-y-1 text-center md:text-left">
               <h1 className="text-3xl font-black text-primary italic">Panel de Gestión Oralab</h1>
               <p className="text-sm text-muted-foreground font-medium">Gestión unificada clínica y estratégica.</p>
            </div>
            <TabsList className="bg-muted/50 p-1 rounded-full shadow-inner border border-primary/5">
              <TabsTrigger value="clinical" className="rounded-full font-black px-6 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Clínica
              </TabsTrigger>
              <TabsTrigger value="strategic" className="rounded-full font-black px-6 data-[state=active]:bg-secondary data-[state=active]:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Estratégico
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clinical" className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-4 bg-white shadow-xl border-primary/10 rounded-[2rem] p-6 h-fit sticky top-20">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={es} className="rounded-md mx-auto" />
                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                   <div className="flex justify-between text-xs font-bold"><span>Total Hoy:</span> <span>{filteredBookings.length}</span></div>
                   <div className="flex justify-between text-xs font-bold text-blue-600"><span>En Sala:</span> <span>{filteredBookings.filter(b => b.status === 'arrived').length}</span></div>
                </div>
              </Card>
              <Card className="lg:col-span-8 bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-6"><CardTitle className="text-2xl font-black text-primary italic">Agenda de Pacientes</CardTitle></CardHeader>
                <Table>
                  <TableHeader><TableRow><TableHead>Hora</TableHead><TableHead>Paciente</TableHead><TableHead>Examen</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredBookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedBookingForDetail(b)}>
                        <TableCell className="font-black text-primary">{b.scheduledTime}</TableCell>
                        <TableCell className="font-bold">{b.firstName} {b.lastNameFather}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{b.examType}</Badge></TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Select value={b.status} onValueChange={(val) => updateDocumentNonBlocking(doc(db!, "bookings", b.id), { status: val })}>
                            <SelectTrigger className="w-[110px] h-8 text-[9px] font-black uppercase"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="pending">Agendado</SelectItem><SelectItem value="arrived">En sala</SelectItem><SelectItem value="completed">Finalizado</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategic" className="space-y-6">
            <Tabs defaultValue="crm" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-primary/5">
                <TabsTrigger value="crm" className="font-bold">CRM Ventas</TabsTrigger>
                <TabsTrigger value="requests" className="font-bold">Solicitudes & Leads</TabsTrigger>
                <TabsTrigger value="mural" className="font-bold">Noticias & Hitos</TabsTrigger>
                <TabsTrigger value="partners" className="font-bold">Inversores</TabsTrigger>
              </TabsList>

              <TabsContent value="crm">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center py-6">
                    <CardTitle className="text-xl font-black text-primary italic">Embudo de Ventas Sunvou®</CardTitle>
                    <Button onClick={() => { resetQuoteForm(); setIsQuoteDialogOpen(true); }} className="bg-primary font-black rounded-full h-10 px-6"><Plus className="mr-2 h-4 w-4" /> Nueva Cotización</Button>
                  </CardHeader>
                  <Table>
                    <TableHeader><TableRow><TableHead>Estado</TableHead><TableHead>Cliente</TableHead><TableHead className="text-right">Total IVA Inc.</TableHead><TableHead className="text-right">Gestión</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {quotations?.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell><Badge variant="outline" className="text-[9px] font-black uppercase">{q.status}</Badge></TableCell>
                          <TableCell className="font-bold text-primary">{q.clientName}</TableCell>
                          <TableCell className="text-right font-black text-lg">${Math.round((q.total || 0) * 1.19).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleEditOpen(q)}><Pencil className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => downloadQuotationPDF(q)}><Download className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-secondary/5 border-b py-6"><CardTitle className="text-xl font-black text-primary italic flex items-center gap-2"><Handshake className="h-5 w-5" /> Convenios Institucionales</CardTitle></CardHeader>
                  <Table>
                    <TableBody>
                      {agreementRequests?.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <p className="font-black text-primary text-sm">{r.institution}</p>
                            <p className="text-[10px] text-muted-foreground">{r.name} - {r.email}</p>
                          </TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-red-300" onClick={() => deleteDocumentNonBlocking(doc(db!, "agreement_requests", r.id))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b py-6"><CardTitle className="text-xl font-black text-blue-700 italic flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Leads Interesados B2B</CardTitle></CardHeader>
                  <Table>
                    <TableBody>
                      {leads?.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>
                            <p className="font-black text-blue-800 text-sm">{l.name}</p>
                            <p className="text-[10px] text-muted-foreground">{l.institution}</p>
                          </TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-red-300" onClick={() => deleteDocumentNonBlocking(doc(db!, "leads", l.id))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="mural" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden">
                   <CardHeader className="bg-muted/30 border-b flex justify-between items-center py-6"><CardTitle className="text-xl font-black text-primary italic">Mural Inversores</CardTitle><Button variant="outline" size="sm" onClick={() => setIsNewsDialogOpen(true)} className="rounded-full"><Plus className="h-3 w-3 mr-1" /> Noticia</Button></CardHeader>
                   <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                      {newsItems?.map((n) => (
                        <div key={n.id} className="flex gap-4 p-3 bg-muted/20 rounded-2xl border border-primary/5">
                           <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden"><Image src={n.imageUrl} alt={n.title} fill className="object-cover" /></div>
                           <div className="flex-1 min-w-0"><h4 className="font-bold text-sm text-primary truncate">{n.title}</h4><p className="text-[9px] text-muted-foreground">{n.date}</p></div>
                           <Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db!, "investor_updates", n.id))}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                        </div>
                      ))}
                   </div>
                 </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODALES REUTILIZADOS */}
      <Dialog open={!!selectedBookingForDetail} onOpenChange={(open) => !open && setSelectedBookingForDetail(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto">
          {selectedBookingForDetail && (
            <div className="space-y-8">
              <div className="border-b pb-6 flex justify-between items-start">
                <div>
                   <Badge className="bg-primary mb-2">Ficha Clínica</Badge>
                   <h2 className="text-3xl font-black text-primary italic">{selectedBookingForDetail.firstName} {selectedBookingForDetail.lastNameFather}</h2>
                   <p className="text-sm font-bold text-muted-foreground">{selectedBookingForDetail.modality === 'home_kit' ? 'Test en Casa' : 'Atención Presencial'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-secondary">{selectedBookingForDetail.scheduledTime} hrs</p>
                  <p className="text-xs font-bold">{selectedBookingForDetail.scheduledDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-primary border-b pb-1">Trazabilidad Asistente</h4>
                  {selectedBookingForDetail.testLogs?.map((log: any, i: number) => (
                    <div key={i} className="flex justify-between p-2 bg-muted/30 rounded-lg text-xs font-bold"><span>{log.stepName}</span><span className="text-secondary">{format(new Date(log.timestamp), "HH:mm")}</span></div>
                  )) || <p className="text-xs italic text-muted-foreground">No hay actividad registrada aún.</p>}
                </div>
                <div className="space-y-4">
                   <h4 className="text-xs font-black uppercase text-primary border-b pb-1">Contacto & Residencia</h4>
                   <p className="text-sm"><strong>Email:</strong> {selectedBookingForDetail.email}</p>
                   <p className="text-sm"><strong>Teléfono:</strong> {selectedBookingForDetail.phone}</p>
                   <p className="text-sm"><strong>Dirección:</strong> {selectedBookingForDetail.address}</p>
                </div>
              </div>
              <Button onClick={() => setSelectedBookingForDetail(null)} className="w-full bg-primary rounded-xl font-black">Cerrar Ficha</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOGOS DE CREACION (NOTICIAS, COTIZACIONES, ETC) */}
      <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-xl font-black text-primary">Publicar Noticia</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título</Label><Input value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>URL Imagen</Label><Input value={newsForm.imageUrl} onChange={(e) => setNewsForm({...newsForm, imageUrl: e.target.value})} /></div>
            <div className="space-y-2"><Label>Contenido</Label><Textarea value={newsForm.content} onChange={(e) => setNewsForm({...newsForm, content: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveNews} className="bg-primary rounded-full px-8 font-black">Publicar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
