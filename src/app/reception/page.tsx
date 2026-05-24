
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Mail, 
  Filter, 
  Trash2, 
  CheckCircle,
  Home,
  Building2,
  LogOut,
  RefreshCcw,
  Phone,
  UserCheck,
  PlayCircle,
  Flag,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, subDays, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "bookings"), 
      where("scheduledDate", "==", dateString),
      orderBy("scheduledTime", "asc")
    );
  }, [db, dateString]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);

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

  async function handleDelete(bookingId: string) {
    if (!db) return;
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
      try {
        await deleteDoc(doc(db, "bookings", bookingId));
        toast({ title: "Reserva eliminada" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error al eliminar" });
      }
    }
  }

  async function updateStatus(bookingId: string, nextStatus: string) {
    if (!db) return;
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: nextStatus });
      toast({ 
        title: "Estado actualizado", 
        description: `Paciente marcado como: ${getStatusLabel(nextStatus)}` 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar estado" });
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'arrived': return 'Llegó (En espera)';
      case 'in_progress': return 'Test Iniciado';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-badge-pending';
      case 'arrived': return 'status-badge-arrived';
      case 'in_progress': return 'status-badge-in_progress';
      case 'completed': return 'status-badge-completed';
      default: return '';
    }
  };

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return format(date, 'EEEE d MMMM', { locale: es });
    } catch (e) {
      return "Error";
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <UserCheck className="h-8 w-8" /> Panel de Administración
            </h1>
            <p className="text-muted-foreground">Gestión de flujo de pacientes y sala de procedimientos.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* NAVEGACIÓN DE DÍA */}
        <Card className="mb-8 bg-white shadow-sm border-primary/10">
          <CardContent className="p-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Agenda para el día</span>
              <span className="text-xl font-black text-primary capitalize">{safeFormatDate(dateString)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </CardContent>
        </Card>

        {/* MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Agendados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{bookings?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">En Espera (Llegaron)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {bookings?.filter(b => b.status === 'arrived').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">En Procedimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {bookings?.filter(b => b.status === 'in_progress').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Completados Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {bookings?.filter(b => b.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm border-primary/10 overflow-hidden">
          <div className="p-4 border-b bg-muted/10 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar paciente en el día..." 
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-muted-foreground bg-white px-4 py-2 rounded-full border">
              Total hoy: {filteredBookings?.length || 0}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="font-bold">Hora</TableHead>
                  <TableHead className="font-bold">Paciente</TableHead>
                  <TableHead className="font-bold">Examen / Modalidad</TableHead>
                  <TableHead className="font-bold">Estado Actual</TableHead>
                  <TableHead className="text-right font-bold">Gestión de Flujo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isBookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Cargando agenda...</TableCell>
                  </TableRow>
                ) : filteredBookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      No hay citas para este día.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings?.map((b) => (
                    <TableRow key={b.id} className={cn("transition-colors", b.status === 'in_progress' && "bg-amber-50/50")}>
                      <TableCell className="font-black text-primary">
                        {b.scheduledTime} hrs
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{b.firstName} {b.lastNameFather}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 w-fit">
                            Test {b.examType}
                          </Badge>
                          {b.modality === 'home_kit' ? (
                            <span className="flex items-center gap-1 text-secondary font-medium text-[10px] uppercase tracking-tighter">
                              <Home className="h-3 w-3" /> Solo Retiro de Kit
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-primary font-medium text-[10px] uppercase tracking-tighter">
                              <Building2 className="h-3 w-3" /> Presencial en Clínica
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-bold px-3 py-1", getStatusBadgeClass(b.status))}>
                          {getStatusLabel(b.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {b.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-blue-600 hover:bg-blue-700 font-bold gap-1 rounded-full"
                              onClick={() => updateStatus(b.id, 'arrived')}
                            >
                              <UserCheck className="h-4 w-4" /> Marcar Llegada / Pago
                            </Button>
                          )}
                          
                          {b.status === 'arrived' && (
                            <Button 
                              size="sm" 
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1 rounded-full animate-pulse-subtle"
                              onClick={() => updateStatus(b.id, 'in_progress')}
                            >
                              <PlayCircle className="h-4 w-4" /> Iniciar Test
                            </Button>
                          )}

                          {b.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white font-bold gap-1 rounded-full"
                              onClick={() => updateStatus(b.id, 'completed')}
                            >
                              <Flag className="h-4 w-4" /> Finalizar Test
                            </Button>
                          )}

                          {b.status === 'completed' && (
                            <div className="flex items-center text-green-600 font-bold text-xs gap-1">
                              <CheckCircle className="h-4 w-4" /> Procedimiento Terminado
                            </div>
                          )}

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => handleDelete(b.id)}
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
      </main>
    </div>
  );
}
