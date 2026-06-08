
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FileText
} from "lucide-react";
import { format, addDays, subDays, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !dateString) return null;
    return query(
      collection(db, "bookings"), 
      where("scheduledDate", "==", dateString)
    );
  }, [db, dateString]);

  const { data: rawBookings, isLoading: isBookingsLoading, error: bookingsError } = useCollection(bookingsQuery);

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
    if (confirm("¿Marcar esta reserva como cancelada? (No se borrará del historial)")) {
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
    toast({ 
      title: "Cita reprogramada", 
      description: `Nueva fecha: ${format(newDate, "dd/MM")} a las ${newTime} hrs` 
    });
    setEditingBooking(null);
  }

  async function updateStatus(bookingId: string, nextStatus: string) {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), { status: nextStatus });
    toast({ 
      title: "Estado actualizado", 
      description: `Paciente marcado como: ${getStatusLabel(nextStatus)}` 
    });
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

  if (isUserLoading || !user || !isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground">Autenticando administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <UserCheck className="h-8 w-8" /> Gestión de Recepción
            </h1>
            <p className="text-muted-foreground">Flujo de pacientes y trazabilidad de citas.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/quotations">
              <Button variant="outline" className="rounded-full border-secondary text-secondary hover:bg-secondary/5">
                <FileText className="mr-2 h-4 w-4" /> Cotizaciones Sunvou
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          </div>
        </div>

        <Card className="mb-8 bg-white shadow-sm border-primary/10">
          <CardContent className="p-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectedDate && setSelectedDate(subDays(selectedDate, 1))}
              disabled={!selectedDate}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Agenda Diaria</span>
              <span className="text-xl font-black text-primary capitalize">{safeFormatDate(dateString)}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectedDate && setSelectedDate(addDays(selectedDate, 1))}
              disabled={!selectedDate}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Agendados</p>
            <div className="text-2xl font-bold text-primary">{bookings?.length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-blue-500"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">En Espera</p>
            <div className="text-2xl font-bold text-blue-600">{bookings?.filter(b => b.status === 'arrived').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-amber-500"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">En Test</p>
            <div className="text-2xl font-bold text-amber-600">{bookings?.filter(b => b.status === 'in_progress').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-green-500"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Completados</p>
            <div className="text-2xl font-bold text-green-600">{bookings?.filter(b => b.status === 'completed').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-red-400"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Cancelados</p>
            <div className="text-2xl font-bold text-red-500">{bookings?.filter(b => b.status === 'cancelled').length || 0}</div>
          </CardContent></Card>
          <Card className="bg-white border-l-4 border-l-purple-400"><CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Reprogr.</p>
            <div className="text-2xl font-bold text-purple-600">{bookings?.filter(b => b.status === 'rescheduled').length || 0}</div>
          </CardContent></Card>
        </div>

        <Card className="bg-white shadow-sm border-primary/10 overflow-hidden">
          <div className="p-4 border-b bg-muted/10 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar paciente por nombre o email..." 
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="font-bold">Hora</TableHead>
                  <TableHead className="font-bold">Paciente</TableHead>
                  <TableHead className="font-bold">Examen</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isBookingsLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : filteredBookings?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No hay registros hoy.</TableCell></TableRow>
                ) : (
                  filteredBookings?.map((b) => (
                    <TableRow key={b.id} className={cn("transition-colors", b.status === 'cancelled' && "opacity-50 bg-slate-50")}>
                      <TableCell className="font-black text-primary">{b.scheduledTime} hrs</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{b.firstName} {b.lastNameFather}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {b.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20">Test {b.examType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-bold", getStatusBadgeClass(b.status))}>{getStatusLabel(b.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {b.status === 'pending' && (
                            <Button size="sm" className="bg-blue-600 font-bold rounded-full" onClick={() => updateStatus(b.id, 'arrived')}>Llegó</Button>
                          )}
                          {b.status === 'arrived' && (
                            <Button size="sm" className="bg-amber-500 text-white font-bold rounded-full" onClick={() => updateStatus(b.id, 'in_progress')}>Iniciar</Button>
                          )}
                          {b.status === 'in_progress' && (
                            <Button size="sm" className="bg-green-600 text-white font-bold rounded-full" onClick={() => updateStatus(b.id, 'completed')}>Finalizar</Button>
                          )}
                          
                          <div className="flex border-l pl-2 ml-2 gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-primary"
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
                                className="text-red-400 hover:text-red-600"
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
      </main>

      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reprogramar Cita</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Paciente: {editingBooking?.firstName} {editingBooking?.lastNameFather}
            </p>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Nueva Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP", { locale: es }) : "Elegir fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
              <label className="text-sm font-bold">Nueva Hora</label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="h-12">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><SelectValue /></div>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t} hrs</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancelar</Button>
            <Button onClick={handleReschedule} className="font-bold">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
