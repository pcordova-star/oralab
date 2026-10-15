"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  MessageSquare, 
  MoreVertical, 
  Trash2, 
  TrendingUp,
  FileText,
  ChevronRight,
  Filter,
  Plus,
  User,
  Loader2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ADMIN_EMAIL = "admin@oralab.cl";

const STAGES = [
  { id: 'new', label: 'Nuevo', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'contacted', label: 'Contactado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'qualified', label: 'Calificado', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'proposal', label: 'Propuesta', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'closed_won', label: 'Ganado', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'closed_lost', label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' }
];

export default function CRMPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewProspectDialogOpen, setIsNewProspectDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProspect, setNewProspect] = useState({
    type: 'B2B Lead',
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
    status: 'new'
  });

  const leadsQuery = useMemoFirebase(() => db ? query(collection(db, "leads"), orderBy("createdAt", "desc")) : null, [db]);
  const agreementsQuery = useMemoFirebase(() => db ? query(collection(db, "agreement_requests"), orderBy("createdAt", "desc")) : null, [db]);

  const { data: leadsData } = useCollection(leadsQuery);
  const { data: agreementsData } = useCollection(agreementsQuery);

  const allProspects = useMemo(() => {
    const combined = [
      ...(leadsData || []).map(l => ({ ...l, type: 'B2B Lead' })),
      ...(agreementsData || []).map(a => ({ ...a, type: 'Convenio' }))
    ];
    
    return combined
      .filter(p => 
        p.name?.toLowerCase().includes(searchFilter.toLowerCase()) || 
        p.institution?.toLowerCase().includes(searchFilter.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
  }, [leadsData, agreementsData, searchFilter]);

  const stats = useMemo(() => {
    return {
      total: allProspects.length,
      active: allProspects.filter(p => p.status !== 'closed_won' && p.status !== 'closed_lost').length,
      won: allProspects.filter(p => p.status === 'closed_won').length,
    };
  }, [allProspects]);

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!newProspect.name || !newProspect.email || !newProspect.institution) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Nombre, email e institución son obligatorios." });
      return;
    }

    setIsSubmitting(true);
    const collectionName = newProspect.type === 'B2B Lead' ? "leads" : "agreement_requests";
    
    try {
      const data = {
        name: newProspect.name,
        email: newProspect.email,
        phone: newProspect.phone,
        institution: newProspect.institution,
        message: newProspect.message,
        status: newProspect.status,
        createdAt: serverTimestamp()
      };
      
      await addDocumentNonBlocking(collection(db, collectionName), data);
      
      toast({ title: "Prospecto Creado", description: `${newProspect.name} ha sido añadido al pipeline.` });
      setIsNewProspectDialogOpen(false);
      setNewProspect({ type: 'B2B Lead', name: '', email: '', phone: '', institution: '', message: '', status: 'new' });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el prospecto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (prospect: any, newStatus: string) => {
    if (!db) return;
    const collectionName = prospect.type === 'B2B Lead' ? "leads" : "agreement_requests";
    try {
      await updateDoc(doc(db, collectionName, prospect.id), { 
        status: newStatus,
        updatedAt: serverTimestamp() 
      });
      toast({ title: "Estado actualizado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleSaveNotes = async (prospect: any, notes: string) => {
    if (!db) return;
    const collectionName = prospect.type === 'B2B Lead' ? "leads" : "agreement_requests";
    try {
      await updateDoc(doc(db, collectionName, prospect.id), { 
        notes,
        updatedAt: serverTimestamp() 
      });
      toast({ title: "Notas guardadas" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDelete = async (prospect: any) => {
    if (!db) return;
    const collectionName = prospect.type === 'B2B Lead' ? "leads" : "agreement_requests";
    try {
      await deleteDoc(doc(db, collectionName, prospect.id));
      toast({ title: "Prospecto eliminado" });
      setIsEditDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  if (isUserLoading) return null;
  if (user?.email !== ADMIN_EMAIL) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 font-body pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <Link href="/reception" className="inline-flex items-center text-primary hover:underline mb-2 text-sm font-bold">
              <ChevronRight className="h-3 w-3 rotate-180 mr-1" /> Volver a Recepción
            </Link>
            <h1 className="text-4xl font-black text-primary italic flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-secondary" /> Pipeline Estratégico
            </h1>
            <p className="text-muted-foreground font-medium">Gestión de prospectos B2B y convenios institucionales.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex gap-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users className="h-5 w-5" /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground">Total Leads</p><p className="text-xl font-black">{stats.total}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4">
                    <div className="bg-green-50 p-2 rounded-lg text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground">Cierres Won</p><p className="text-xl font-black">{stats.won}</p></div>
                </div>
             </div>
             <Button 
               onClick={() => setIsNewProspectDialogOpen(true)}
               className="h-16 px-8 rounded-2xl bg-primary hover:bg-secondary font-black shadow-lg text-lg italic transition-all group"
             >
                <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform" /> INGRESAR PROSPECTO
             </Button>
          </div>
        </div>

        <Card className="bg-white rounded-[2rem] shadow-xl border-primary/10 overflow-hidden mb-8">
           <CardHeader className="bg-primary/5 border-b py-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre o institución..." 
                  className="pl-10 h-10 rounded-full bg-white"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" className="w-full md:w-auto">
                 <TabsList className="bg-white/50 border">
                    <TabsTrigger value="all" className="font-bold">Todos</TabsTrigger>
                    <TabsTrigger value="active" className="font-bold">Activos</TabsTrigger>
                    <TabsTrigger value="closed" className="font-bold">Cerrados</TabsTrigger>
                 </TabsList>
              </Tabs>
           </CardHeader>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-0 border-b">
              {STAGES.map((stage) => (
                <div key={stage.id} className="border-r last:border-r-0 flex flex-col min-h-[600px] bg-slate-50/50">
                  <div className="p-4 border-b bg-white flex justify-between items-center">
                    <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", stage.color)}>
                      {stage.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {allProspects.filter(p => (p.status || 'new') === stage.id).length}
                    </Badge>
                  </div>
                  
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {allProspects
                        .filter(p => (p.status || 'new') === stage.id)
                        .map((prospect) => (
                          <Card 
                            key={prospect.id} 
                            className="bg-white hover:shadow-md transition-all cursor-pointer group border-primary/5 rounded-xl overflow-hidden"
                            onClick={() => { setSelectedLead(prospect); setIsEditDialogOpen(true); }}
                          >
                            <div className="p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <Badge className={cn("text-[8px] font-black uppercase tracking-tighter", prospect.type === 'B2B Lead' ? 'bg-blue-500' : 'bg-secondary')}>
                                  {prospect.type}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {STAGES.filter(s => s.id !== stage.id).map(s => (
                                      <DropdownMenuItem key={s.id} onClick={() => handleUpdateStatus(prospect, s.id)}>
                                        Mover a {s.label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem className="text-red-500 font-bold" onClick={() => handleDelete(prospect)}>
                                      Eliminar Prospecto
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div>
                                <h4 className="font-black text-primary text-sm leading-tight group-hover:text-secondary transition-colors">{prospect.institution || "Sin Institución"}</h4>
                                <p className="text-[11px] font-bold text-muted-foreground mt-1 truncate">{prospect.name}</p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-dashed">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                  {prospect.createdAt?.seconds ? format(new Date(prospect.createdAt.seconds * 1000), "dd MMM", { locale: es }) : "Reciente"}
                                </span>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              ))}
           </div>
        </Card>
      </main>

      <Dialog open={isNewProspectDialogOpen} onOpenChange={setIsNewProspectDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8">
           <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary italic">Nuevo Prospecto</DialogTitle>
              <DialogDescription className="font-medium">Ingresa los datos para iniciar el seguimiento comercial.</DialogDescription>
           </DialogHeader>

           <form onSubmit={handleCreateProspect} className="space-y-6 pt-4">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="font-bold">Categoría de Prospecto</Label>
                    <Select value={newProspect.type} onValueChange={(v) => setNewProspect({...newProspect, type: v})}>
                       <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="B2B Lead">B2B Lead (Venta Equipos)</SelectItem>
                          <SelectItem value="Convenio">Convenio Institucional</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="font-bold">Nombre de Contacto</Label>
                       <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10 h-12 rounded-xl"
                            value={newProspect.name}
                            onChange={(e) => setNewProspect({...newProspect, name: e.target.value})}
                            placeholder="Ej: Dr. Ricardo Lagos"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">Institución / Clínica</Label>
                       <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10 h-12 rounded-xl"
                            value={newProspect.institution}
                            onChange={(e) => setNewProspect({...newProspect, institution: e.target.value})}
                            placeholder="Nombre del centro"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="font-bold">Correo Electrónico</Label>
                       <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email"
                            className="pl-10 h-12 rounded-xl"
                            value={newProspect.email}
                            onChange={(e) => setNewProspect({...newProspect, email: e.target.value})}
                            placeholder="contacto@empresa.cl"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">Teléfono</Label>
                       <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10 h-12 rounded-xl"
                            value={newProspect.phone}
                            onChange={(e) => setNewProspect({...newProspect, phone: e.target.value})}
                            placeholder="+56 9 ..."
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold">Consulta / Requerimiento</Label>
                    <Textarea 
                       className="rounded-xl min-h-[100px]"
                       placeholder="Detalles sobre el interés del prospecto..."
                       value={newProspect.message}
                       onChange={(e) => setNewProspect({...newProspect, message: e.target.value})}
                    />
                 </div>
              </div>

              <DialogFooter className="gap-2">
                 <Button type="button" variant="ghost" onClick={() => setIsNewProspectDialogOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                 <Button type="submit" disabled={isSubmitting} className="rounded-xl font-black bg-primary px-8">
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    Crear Prospecto
                 </Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-8 overflow-hidden">
          {selectedLead && (
            <div className="space-y-8">
              <DialogHeader>
                <div className="flex justify-between items-start">
                   <div>
                      <Badge className="bg-primary mb-2 uppercase text-[10px] font-black">{selectedLead.type}</Badge>
                      <DialogTitle className="text-3xl font-black text-primary italic leading-tight">
                        {selectedLead.institution}
                      </DialogTitle>
                   </div>
                   <div className={cn("px-4 py-2 rounded-2xl border font-black text-xs uppercase", STAGES.find(s => s.id === (selectedLead.status || 'new'))?.color)}>
                      {STAGES.find(s => s.id === (selectedLead.status || 'new'))?.label}
                   </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase text-primary border-b pb-1 flex items-center gap-2">
                         <Users className="h-4 w-4" /> Datos de Contacto
                       </h4>
                       <div className="space-y-2">
                          <p className="text-sm font-bold flex items-center gap-2"><User className="h-4 w-4 text-secondary" /> {selectedLead.name}</p>
                          <p className="text-sm font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" /> {selectedLead.email}</p>
                          <p className="text-sm font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-secondary" /> {selectedLead.phone || "No registrado"}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase text-primary border-b pb-1 flex items-center gap-2">
                         <MessageSquare className="h-4 w-4" /> Mensaje Original
                       </h4>
                       <div className="bg-muted/30 p-4 rounded-xl italic text-sm text-muted-foreground leading-relaxed">
                          "{selectedLead.message || "Sin mensaje adicional."}"
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-4">
                       <h4 className="text-xs font-black uppercase text-primary border-b pb-1 flex items-center gap-2">
                         <FileText className="h-4 w-4" /> Bitácora de Seguimiento
                       </h4>
                       <Textarea 
                          placeholder="Escribe aquí las notas de la última llamada o reunión..."
                          className="min-h-[150px] bg-slate-50 border-primary/10 rounded-2xl text-sm"
                          defaultValue={selectedLead.notes || ""}
                          id="lead-notes"
                       />
                       <Button 
                         className="w-full h-12 bg-primary font-black rounded-xl"
                         onClick={() => handleSaveNotes(selectedLead, (document.getElementById('lead-notes') as HTMLTextAreaElement).value)}
                       >
                         Guardar Notas
                       </Button>
                    </div>

                    <div className="pt-4 flex gap-4">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold gap-2">
                             Mover Etapa <ChevronRight className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent className="w-56">
                            {STAGES.map(s => (
                              <DropdownMenuItem key={s.id} onClick={() => handleUpdateStatus(selectedLead, s.id)}>
                                Marcar como {s.label}
                              </DropdownMenuItem>
                            ))}
                         </DropdownMenuContent>
                       </DropdownMenu>
                       <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-red-300 hover:text-red-50" onClick={() => handleDelete(selectedLead)}>
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                 </div>
              </div>
              
              <DialogFooter className="border-t pt-6">
                 <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-full font-bold">Cerrar</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}