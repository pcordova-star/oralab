
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
  Phone,
  UserCheck,
  Trash2,
  CalendarDays,
  Calendar as CalendarIcon,
  XCircle,
  Clock,
  Pencil,
  FileText,
  Mail,
  Coins,
  Plus,
  User,
  Target,
  TrendingUp,
  Calendar as CalendarViewIcon,
  CheckCircle2,
  AlertCircle,
  History,
  ListChecks,
  Activity,
  HandCoins
} from "lucide-react";
import { format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const ADMIN_EMAIL = "admin@oralab.cl";
const FUNDING_GOAL = 13500000;

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isInvestorDialogOpen, setIsInvestorDialogOpen] = useState(false);
  const [investorName, setInvestorName] = useState("");
  const [investorAmount, setInvestorAmount] = useState("");
  const [investorStatus, setInvestorStatus] = useState<"confirmed" | "pending">("confirmed");

  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [viewingLogsBooking, setViewingLogsBooking] = useState<any>(null);
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
    return query(collection(db, "bookings"), where("scheduledDate", "==", dateString));
  }, [db, dateString]);

  const allBookingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "bookings"), where("status", "not-in", ["cancelled"]));
  }, [db]);

  const leadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "leads"), orderBy("createdAt", "desc"));
  }, [db]);

  const investorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "investors"), orderBy("investorNumber", "asc"));
  }, [db]);

  const { data: rawBookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);
  const { data: allBookingsData } = useCollection(allBookingsQuery);
  const { data: leads, isLoading: isLeadsLoading } = useCollection(leadsQuery);
  const { data: investors, isLoading: isInvestorsLoading } = useCollection(investorsQuery);

  const bookings = rawBookings ? [...rawBookings].sort((a, b) => 
    (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
  ) : [];

  const filteredBookings = bookings?.filter(b => 
    b.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.lastNameFather?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const investorData = {
      realName: investorName,
      investorNumber: newNumber,
      amount: parseInt(investorAmount),
      status: investorStatus,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "investors"), investorData);
      toast({ title: "Inversionista agregado", description: "El aporte ha sido registrado." });
      setInvestorName("");
      setInvestorAmount("");
      setInvestorStatus("confirmed");
      setIsInvestorDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el registro." });
    }
  }

  async function handleUpdateInvestorStatus(id: string, newStatus: "confirmed" | "pending") {
    if (!db) return;
    try {
      await updateDoc(doc(db, "investors", id), { status: newStatus });
      toast({ title: "Estado actualizado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  async function handleDeleteInvestor(id: string) {
    if (!db || !confirm("¿Eliminar este registro de inversión?")) return;
    deleteDocumentNonBlocking(doc(db, "investors", id));
    toast({ title: "Registro eliminado" });
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

  const hasBookingsOnDay = (date: Date) => {
    if (!allBookingsData) return false;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return allBookingsData.some(b => b.scheduledDate === formattedDate);
  };

  if (isUserLoading || !user || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3 italic">
              <UserCheck className="h-8 w-8 text-secondary" /> Panel Super Admin
            </h1>
            <p className="text-muted-foreground font-medium">Control total de la infraestructura comercial y de capital.</p>
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

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-full w-full max-w-2xl mx-auto grid grid-cols-3">
            <TabsTrigger value="patients" className="rounded-full font-black uppercase text-xs flex items-center gap-2">
              <CalendarViewIcon className="h-3 w-3" /> Agenda
            </TabsTrigger>
            <TabsTrigger value="leads" className="rounded-full font-black uppercase text-xs">Leads Sunvou</TabsTrigger>
            <TabsTrigger value="investors" className="rounded-full font-black uppercase text-xs flex items-center gap-2">
              <Coins className="h-3 w-3" /> Inversionistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <Card className="bg-white shadow-xl border-primary/10 rounded-[2rem] overflow-hidden sticky top-24">
                  <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-secondary" /> Selector de Fecha
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Los días con punto tienen citas agendadas.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border-none"
                      locale={es}
                      modifiers={{
                        booked: (date) => hasBookingsOnDay(date)
                      }}
                      modifiersClassNames={{
                        booked: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-secondary after:rounded-full"
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem] min-h-[600px]">
                  <div className="p-6 border-b bg-primary/5 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-black text-primary italic">
                        {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: es }) : "Seleccione un día"}
                      </h2>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary font-black">
                        {filteredBookings?.length || 0} Pacientes
                      </Badge>
                    </div>
                    <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por nombre..." className="pl-10 rounded-full h-11 border-primary/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/10">
                        <TableHead className="font-black text-[10px] uppercase">Hora</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Paciente</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Examen</TableHead>
                        <TableHead className="font-black text-[10px] uppercase">Estado</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase pr-8">Acciones</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {isBookingsLoading ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Buscando citas...</TableCell></TableRow>
                        ) : filteredBookings?.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-40 text-muted-foreground italic font-medium">No hay pacientes agendados para este día.</TableCell></TableRow>
                        ) : (
                          filteredBookings?.map((b) => (
                            <TableRow key={b.id} className="group hover:bg-primary/5 transition-colors">
                              <TableCell className="font-black text-primary text-lg pl-6 italic">{b.scheduledTime} hrs</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-black text-primary">{b.firstName} {b.lastNameFather}</span>
                                  <span className="text-[11px] font-bold text-muted-foreground">{b.phone}</span>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="bg-secondary/5 font-bold">{b.examType}</Badge></TableCell>
                              <TableCell><Badge className={cn("font-black text-[10px]", getStatusBadgeClass(b.status))}>{getStatusLabel(b.status)}</Badge></TableCell>
                              <TableCell className="text-right pr-6">
                                <div className="flex justify-end gap-1">
                                  {b.testLogs && b.testLogs.length > 0 && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="rounded-full hover:bg-secondary/10 text-secondary" 
                                      onClick={() => setViewingLogsBooking(b)}
                                      title="Ver Bitácora de Test"
                                    >
                                      <History className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary" onClick={() => {
                                    setEditingBooking(b);
                                    setNewDate(selectedDate);
                                    setNewTime(b.scheduledTime);
                                  }}>
                                    <Pencil className="h-4 w-4" />
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="bg-white shadow-xl border-secondary/20 overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-secondary/5 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-secondary font-black flex items-center gap-2 italic"><Mail className="h-6 w-6" /> Consultas Sunvou</CardTitle>
                </div>
              </CardHeader>
              <Table>
                <TableHeader><TableRow className="bg-muted/10">
                  <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Institución</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Mensaje</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {leads?.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-bold text-xs">{l.createdAt?.seconds ? format(new Date(l.createdAt.seconds * 1000), "dd/MM/yy") : "-"}</TableCell>
                      <TableCell><span className="font-black text-primary">{l.institution}</span></TableCell>
                      <TableCell className="text-xs italic text-muted-foreground">{l.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-primary text-white shadow-lg rounded-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-20 w-20" />
                </div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Invertido</p>
                  <h3 className="text-3xl font-black italic">${totalInvestment.toLocaleString('es-CL')}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Progreso Meta</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5 bg-white/20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg rounded-2xl border-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-secondary/10 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-secondary" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inversionistas</p>
                  </div>
                  <h3 className="text-3xl font-black text-primary italic">{investors?.length || 0}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">Meta Global: ${FUNDING_GOAL.toLocaleString('es-CL')}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg rounded-2xl border-primary/5 flex items-center justify-center">
                <Button onClick={() => setIsInvestorDialogOpen(true)} className="rounded-full bg-secondary font-black h-14 px-8 shadow-lg hover:scale-105 transition-transform">
                  <Plus className="mr-2 h-6 w-6" /> Registrar Aporte
                </Button>
              </Card>
            </div>

            <Card className="bg-white shadow-xl border-primary/20 overflow-hidden rounded-[2rem]">
              <CardHeader className="bg-primary/5 border-b">
                <div>
                  <CardTitle className="text-xl text-primary font-black flex items-center gap-2 italic"><Coins className="h-6 w-6 text-secondary" /> Registro Privado de Socios</CardTitle>
                  <CardDescription className="font-medium">Identificación real visible solo para administración central.</CardDescription>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-black text-[10px] uppercase pl-8"># Folio</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Inversionista (Nombre Real)</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Monto</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-center">Estado</TableHead>
                      <TableHead className="text-right font-black text-[10px] uppercase pr-8">Gestión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors?.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-primary/5 group">
                        <TableCell className="font-black text-primary pl-8 italic">#{inv.investorNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <User className="h-4 w-4 text-muted-foreground" />
                             <span className="font-bold">{inv.realName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-primary">${(inv.amount || 0).toLocaleString('es-CL')}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Select 
                            value={inv.status || "confirmed"} 
                            onValueChange={(v) => handleUpdateInvestorStatus(inv.id, v as "confirmed" | "pending")}
                          >
                            <SelectTrigger className={cn(
                              "h-7 text-[9px] font-black uppercase w-32 mx-auto rounded-full border-none",
                              inv.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed" className="text-[10px] font-bold">Confirmado</SelectItem>
                              <SelectItem value="pending" className="text-[10px] font-bold">Por Confirmar</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600 rounded-full h-8 w-8" onClick={() => handleDeleteInvestor(inv.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {investors?.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Esperando primeros inversionistas.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo Bitácora de Test */}
      <Dialog open={!!viewingLogsBooking} onOpenChange={() => setViewingLogsBooking(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary italic flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-secondary" /> Bitácora Clínica del Paciente
            </DialogTitle>
            <CardDescription className="font-bold">
              Historial de muestras registradas por {viewingLogsBooking?.firstName} {viewingLogsBooking?.lastNameFather}.
            </CardDescription>
          </DialogHeader>
          <div className="py-4">
             <div className="bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-black text-[10px] uppercase">Muestra / Paso</TableHead>
                      <TableHead className="font-black text-[10px] uppercase text-right">Hora Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingLogsBooking?.testLogs?.map((log: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-primary flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> {log.stepName}
                        </TableCell>
                        <TableCell className="text-right font-black text-primary">
                          {format(new Date(log.timestamp), "HH:mm:ss")} hrs
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
               <Activity className="h-5 w-5 text-blue-600 shrink-0" />
               <p className="text-xs text-blue-800 font-medium">
                 Use estos tiempos para validar si el paciente respetó los intervalos del protocolo Sunvou® (20/30 minutos entre muestras).
               </p>
             </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewingLogsBooking(null)} className="rounded-full bg-primary font-black px-8">Cerrar Bitácora</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvestorDialogOpen} onOpenChange={setIsInvestorDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black text-primary italic">Registrar Nuevo Aporte</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Nombre Real del Inversionista</label>
              <Input value={investorName} onChange={(e) => setInvestorName(e.target.value)} placeholder="Ej: Roberto Sánchez" className="h-12 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Monto (CLP)</label>
                <div className="relative">
                  <HandCoins className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" value={investorAmount} onChange={(e) => setInvestorAmount(e.target.value)} placeholder="1.000.000" className="h-12 rounded-xl pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/50">Estado Inicial</label>
                <Select value={investorStatus} onValueChange={(v) => setInvestorStatus(v as "confirmed" | "pending")}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Por Confirmar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsInvestorDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvestorSubmit} className="bg-primary font-black rounded-full px-8 h-12">Guardar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black text-primary italic">Reprogramar Cita</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newDate ? format(newDate, "PPP", { locale: es }) : "Elegir fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newDate} onSelect={setNewDate} locale={es} /></PopoverContent>
            </Popover>
            <Select value={newTime} onValueChange={setNewTime}>
              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Hora" /></SelectTrigger>
              <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t} hrs</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingBooking(null)}>Descartar</Button>
            <Button onClick={() => {
              if (newDate && newTime) {
                updateDocumentNonBlocking(doc(db, "bookings", editingBooking.id), {
                  scheduledDate: format(newDate, "yyyy-MM-dd"),
                  scheduledTime: newTime,
                  status: 'rescheduled'
                });
                toast({ title: "Reprogramado" });
                setEditingBooking(null);
              }
            }} className="bg-primary font-black rounded-full px-6">Confirmar Cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
