
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  User, 
  Phone, 
  Mail, 
  Filter, 
  Trash2, 
  CheckCircle,
  Home,
  Building2,
  LogOut,
  RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";

export default function ReceptionPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);

  const filteredBookings = bookings?.filter(b => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastNameFather?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.commune?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleLogout() {
    const auth = getAuth();
    await signOut(auth);
    router.push("/");
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

  async function handleStatusChange(bookingId: string, currentStatus: string) {
    if (!db) return;
    const nextStatus = currentStatus === "pending" ? "completed" : "pending";
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: nextStatus });
      toast({ title: "Estado actualizado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar" });
    }
  }

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
            <h1 className="text-3xl font-bold text-primary">Panel de Recepción</h1>
            <p className="text-muted-foreground">Gestión de solicitudes de test de aire espirado.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{bookings?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {bookings?.filter(b => b.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {bookings?.filter(b => b.scheduledDate === format(new Date(), 'yyyy-MM-dd')).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">A Domicilio (Kits)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {bookings?.filter(b => b.modality === 'home_kit').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-sm border-primary/10 overflow-hidden">
          <div className="p-4 border-b bg-muted/10 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, email o comuna..." 
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="rounded-full">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="font-bold">Paciente</TableHead>
                  <TableHead className="font-bold">Examen</TableHead>
                  <TableHead className="font-bold">Fecha / Hora</TableHead>
                  <TableHead className="font-bold">Modalidad</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isBookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Cargando datos...</TableCell>
                  </TableRow>
                ) : filteredBookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron reservas.</TableCell>
                  </TableRow>
                ) : (
                  filteredBookings?.map((b) => (
                    <TableRow key={b.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{b.firstName} {b.lastNameFather}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {b.email}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 font-bold">
                          Test {b.examType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(b.scheduledDate + 'T00:00:00'), 'dd MMM, yyyy', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" /> {b.scheduledTime} hrs
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {b.modality === 'home_kit' ? (
                          <div className="flex items-center gap-1 text-secondary font-medium text-xs">
                            <Home className="h-4 w-4" /> Kit Casa
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-primary font-medium text-xs">
                            <Building2 className="h-4 w-4" /> Presencial
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={b.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}
                          onClick={() => handleStatusChange(b.id, b.status)}
                          variant="secondary"
                        >
                          {b.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleStatusChange(b.id, b.status)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:bg-red-50"
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
