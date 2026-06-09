
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, deleteDoc, doc, updateDoc, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCcw,
  Phone,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Calendar as CalendarIcon,
  XCircle,
  Clock,
  Pencil,
  FileText,
  Mail,
  Building2,
  MessageSquare,
  Bell
} from "lucide-react";
import { format, addDays, subDays, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const ADMIN_EMAIL = "admin@oralab.cl";

const timeSlots = [];
for (let hour = 8; hour <= 12; hour++) {
  for (let min = 0; min < 60; min += 15) {
    if (hour === 12 && min > 0) break;
    const h = hour.toString().padStart(2, '0');
    const m = min.toString().padStart(2, '0');
    timeSlots.push(`${h}:${m}`);
  }
}

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>("");

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

  // Query para Citas
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !dateString) return null;
    return query(
      collection(db, "bookings"), 
      where("scheduledDate", "==", dateString)
    );
  }, [db, dateString]);

  // Query para Leads de Sunvou
  const leadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "leads"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: rawBookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);
  const { data: leads, isLoading: isLeadsLoading } = useCollection(leadsQuery);

  const bookings = rawBookings ? [...rawBookings].sort((a, b) => 
    (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
  ) : [];

  const filteredBookings = bookings?.filter(b => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastNameFather?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleLogout() {
    const auth = getAuth();
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  }

  async function handleCancel(bookingId: string) {
    if (!db) return;
    if (confirm("¿Marcar esta reserva como cancelada?")) {
      updateDocumentNonBlocking(doc(db, "bookings", bookingId), { status: 'cancelled' });
      toast({ title: "Reserva cancelada" });
    }
  }

  async function handleReschedule() {
    if (!db || !editingBooking || !newDate || !newTime) return;
    const nextData = {
      scheduledDate: format(newDate, "yyyy-MM-dd"),
      scheduledTime: newTime,
      status: 'rescheduled'
    };
    updateDocumentNonBlocking(doc(db, "bookings", editingBooking.id), nextData);
    toast({ title: "Cita reprogramada" });
    setEditingBooking(null);
  }

  async function updateStatus(bookingId: string, nextStatus: string) {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), { status: nextStatus });
    toast({ title: "Estado actualizado" });
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'arrived': return 'Llegó (En espera)';
      case 'in_progress': return 'Test Iniciado';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'rescheduled': return 'Reprogramado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-badge-pending';
      case 'arrived': return 'status-badge-arrived';
      case 'in_progress': return 'status-badge-in_progress';
      case 'completed': return 'status-badge-completed';
      case 'cancelled': return 'status-badge-cancelled';
      case 'rescheduled': return 'status-badge-rescheduled';
      default: return '';
    }
  };

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "Cargando...";
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return format(date, 'EEEE d MMMM', { locale: es });
    } catch (e) {
      return "Error de fecha";
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (!db || !confirm("¿Eliminar este requerimiento de contacto?")) return;
    deleteDocumentNonBlocking(doc(db, "leads", leadId));
    toast({ title: "Lead eliminado" });
  };

  if (isUserLoading || !user || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground">Autenticando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3 italic">
              <UserCheck className="h-8 w-8 text-secondary" /> Panel de Control Oralab
            </h1>
            <p className="text-muted-foreground font-medium">Gestión integral de pacientes y requerimientos comerciales.</p>
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

        {/* Dashboard de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-white"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Agendados</p>
            <div className="text-2xl font-black text-primary">{bookings?.length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-blue-500"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">En Espera</p>
            <div className="text-2xl font-black text-blue-600">{bookings?.filter(b => b.status === 'arrived').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-amber-500"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">En Test</p>
            <div className="text-2xl font-black text-amber-600">{bookings?.filter(b => b.status === 'in_progress').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-green-500"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Listos</p>
            <div className="text-2xl font-black text-green-600">{bookings?.filter(b => b.status === 'completed').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-red-400 opacity-60"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cancelados</p>
            <div className="text-2xl font-black text-red-500">{bookings?.filter(b => b.status === 'cancelled').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-purple-400 opacity-60"><CardContent className="p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reprogr.</p>
            <div className="text-2xl font-black text-purple-600">{bookings?.filter(b => b.status === 'rescheduled').length || 0}</div>
          </CardContent></Card>
          
          {/* Card de Alerta de Leads */}
          <Card className={cn(
            "bg-white border-2 transition-all duration-500",
            leads && leads.length > 0 ? "border-secondary animate-pulse-subtle bg-secondary/5" : "border-transparent"
          )}>
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Leads Sunvou</p>
                {leads && leads.length > 0 && <Bell className="h-3 w-3 text-secondary animate-bounce" />}
              </div>
              <div className="text-2xl font-black text-secondary">{leads?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="patients" className="rounded-full font-black uppercase text-xs">Agenda Pacientes</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-full font-black uppercase text-xs flex items-center gap-2">
              Leads Sunvou {leads && leads.length > 0 && <Badge className="bg-secondary h-4 w-4 p-0 flex items-center justify-center text-[10px]">{leads.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem]">
              <div className="p-6 border-b bg-primary/5 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4 bg-white p-2 rounded-full border shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => selectedDate && setSelectedDate(subDays(selectedDate, 1))}
                    disabled={!selectedDate}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center min-w-[180px]">
                    <span className="text-sm font-black text-primary capitalize">{safeFormatDate(dateString)}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => selectedDate && setSelectedDate(addDays(selectedDate, 1))}
                    disabled={!selectedDate}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar paciente..." 
                    className="pl-10 rounded-full h-11 border-primary/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-black text-[10px] uppercase">Hora</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Paciente / Contacto</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Examen / Modalidad</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Estado Clínica</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase pr-8">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isBookingsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12">Cargando agenda...</TableCell></TableRow>
                    ) : filteredBookings?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium italic">No hay registros para este día.</TableCell></TableRow>
                    ) : (
                      filteredBookings?.map((b) => (
                        <TableRow key={b.id} className={cn("transition-colors group", b.status === 'cancelled' && "opacity-40 grayscale")}>
                          <TableCell className="font-black text-primary text-lg pl-6 italic">{b.scheduledTime} hrs</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-primary group-hover:underline cursor-pointer">{b.firstName} {b.lastNameFather}</span>
                              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> +56 9 {b.phone}</span>
                              <span className="text-[10px] font-medium text-muted-foreground/60">{b.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit bg-secondary/5 text-secondary border-secondary/20 font-bold text-[10px]">TEST {b.examType?.toUpperCase()}</Badge>
                              <span className="text-[10px] font-black uppercase text-muted-foreground/50">{b.modality === 'home_kit' ? 'Retiro de Kit' : 'Presencial'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-black text-[10px] uppercase tracking-tighter px-3", getStatusBadgeClass(b.status))}>{getStatusLabel(b.status)}</Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end items-center gap-2">
                              {b.status === 'pending' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-black rounded-full h-8 text-[10px] px-4" onClick={() => updateStatus(b.id, 'arrived')}>Llegó</Button>
                              )}
                              {b.status === 'arrived' && (
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-black rounded-full h-8 text-[10px] px-4" onClick={() => updateStatus(b.id, 'in_progress')}>Iniciar</Button>
                              )}
                              {b.status === 'in_progress' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-black rounded-full h-8 text-[10px] px-4" onClick={() => updateStatus(b.id, 'completed')}>Finalizar</Button>
                              )}
                              
                              <div className="flex border-l pl-3 ml-1 gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                                  onClick={() => {
                                    setEditingBooking(b);
                                    setNewDate(new Date(b.scheduledDate + 'T12:00:00'));
                                    setNewTime(b.scheduledTime);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {b.status !== 'cancelled' && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-300 hover:text-red-600 rounded-full"
                                    onClick={() => handleCancel(b.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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

          <TabsContent value="leads">
            <Card className="bg-white shadow-xl border-secondary/20 overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-secondary/5 border-b">
                <CardTitle className="text-xl text-secondary font-black flex items-center gap-2 italic">
                  <Mail className="h-6 w-6" /> Consultas Institucionales Sunvou
                </CardTitle>
                <CardDescription className="font-medium">Solicitudes de contacto recibidas desde la landing oficial de representación.</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Interesado / Institución</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Mensaje / Requerimiento</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase pr-8">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLeadsLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12">Buscando requerimientos...</TableCell></TableRow>
                    ) : leads?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-medium italic">No hay nuevas consultas comerciales.</TableCell></TableRow>
                    ) : (
                      leads?.map((l) => (
                        <TableRow key={l.id} className="hover:bg-secondary/5 transition-colors group">
                          <TableCell className="font-bold text-xs pl-6">
                            {l.createdAt?.seconds ? format(new Date(l.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm") : "Reciente"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-primary flex items-center gap-1 italic"><UserCheck className="h-3 w-3" /> {l.name}</span>
                              <span className="text-[11px] font-black uppercase text-secondary flex items-center gap-1"><Building2 className="h-3 w-3" /> {l.institution}</span>
                              <span className="text-[10px] font-medium text-muted-foreground">{l.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="bg-muted/30 p-3 rounded-xl border border-primary/5 text-xs text-muted-foreground font-medium italic leading-relaxed">
                              <MessageSquare className="h-3 w-3 mb-1 opacity-50" />
                              "{l.message}"
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <a href={`mailto:${l.email}`} className="block">
                                <Button variant="outline" size="sm" className="rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white transition-all font-black text-[10px]">
                                  Responder por Email
                                </Button>
                              </a>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-300 hover:text-red-600 rounded-full h-8 w-8"
                                onClick={() => handleDeleteLead(l.id)}
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
      </main>

      {/* Dialogo de Reprogramación */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black text-primary italic">Reprogramar Cita Clínica</DialogTitle>
            <p className="text-sm font-bold text-muted-foreground">
              Paciente: {editingBooking?.firstName} {editingBooking?.lastNameFather}
            </p>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-primary/50">Nueva Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-bold h-12 rounded-xl border-primary/10">
                    <CalendarIcon className="mr-2 h-4 w-4 text-secondary" />
                    {newDate ? format(newDate, "PPP", { locale: es }) : "Elegir fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl">
                  <Calendar 
                    mode="single" 
                    selected={newDate} 
                    onSelect={setNewDate} 
                    locale={es}
                    disabled={(date) => date < startOfToday()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-primary/50">Nueva Hora</label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="h-12 rounded-xl border-primary/10 font-bold">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /><SelectValue /></div>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t} className="font-medium">{t} hrs</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full font-bold" onClick={() => setEditingBooking(null)}>Descartar</Button>
            <Button onClick={handleReschedule} className="font-black bg-primary rounded-full px-6 shadow-lg">Confirmar Cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
