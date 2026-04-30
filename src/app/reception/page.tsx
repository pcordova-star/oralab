
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Clock, Info, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PROTOCOLS } from "@/app/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ReceptionPage() {
  const [search, setSearch] = useState("");
  const [prepInstructions, setPrepInstructions] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "appointments"), orderBy("dateTime", "asc"));
  }, [db]);

  const { data: appointments, isLoading } = useCollection(appointmentsQuery);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (!db) return;
    const docRef = doc(db, "appointments", id);
    updateDocumentNonBlocking(docRef, { status: newStatus });
    
    toast({
      title: "Estado actualizado",
      description: `Paciente marcado como ${newStatus === 'waiting' ? 'en espera' : 'agendado'}.`,
    });
  };

  const handleShowInstructions = (examType: 'SIBO' | 'HP') => {
    const instructions = PROTOCOLS[examType]?.instructions || "No hay instrucciones disponibles.";
    setPrepInstructions(instructions);
    setCopied(false);
  };

  const handleCopy = () => {
    if (prepInstructions) {
      navigator.clipboard.writeText(prepInstructions);
      setCopied(true);
      toast({ title: "Copiado", description: "Instrucciones copiadas al portapapeles." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = appointments?.filter(a => 
    a.patientName.toLowerCase().includes(search.toLowerCase()) && 
    (a.status === 'scheduled' || a.status === 'waiting')
  );

  return (
    <AuthGuard requiredRole="receptionist">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">Agenda del Día</h1>
              <p className="text-muted-foreground">Gestión de llegada de pacientes y recepción.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar paciente..." 
                className="pl-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="rounded-2xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-white border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pacientes Agendados</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex gap-1 items-center">
                    <Clock className="h-3 w-3" /> Pendientes: {appointments?.filter(a => a.status === 'scheduled').length || 0}
                  </Badge>
                  <Badge variant="outline" className="flex gap-1 items-center border-yellow-500 text-yellow-600 bg-yellow-50">
                    <Info className="h-3 w-3" /> En Espera: {appointments?.filter(a => a.status === 'waiting').length || 0}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Examen</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No se encontraron pacientes para hoy.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered?.map((app) => (
                        <TableRow key={app.id} className="hover:bg-muted/10">
                          <TableCell className="font-semibold text-primary">
                            {format(new Date(app.dateTime), "HH:mm")}
                          </TableCell>
                          <TableCell className="font-medium">{app.patientName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-semibold">{app.examType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`status-badge-${app.status} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                              {app.status === 'scheduled' ? 'Agendado' : 'En espera'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {app.status === 'scheduled' && (
                                <Button 
                                  size="sm" 
                                  className="bg-yellow-500 hover:bg-yellow-600 rounded-lg flex gap-1"
                                  onClick={() => handleStatusChange(app.id, 'waiting')}
                                >
                                  <UserCheck className="h-4 w-4" /> Recepcionar
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-lg flex gap-1 border-primary text-primary hover:bg-primary/5"
                                onClick={() => handleShowInstructions(app.examType as any)}
                              >
                                <Info className="h-4 w-4" /> Instrucciones
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>

        <Dialog open={!!prepInstructions} onOpenChange={() => setPrepInstructions(null)}>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Info className="text-primary" /> Instrucciones de Preparación Estándar
              </DialogTitle>
              <DialogDescription>
                Información clínica para el paciente antes de realizar el examen.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-6 bg-muted/50 rounded-2xl whitespace-pre-line border italic text-sm text-foreground/80 leading-relaxed">
              {prepInstructions}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" className="rounded-xl" onClick={() => setPrepInstructions(null)}>Cerrar</Button>
              <Button className="rounded-xl px-8" onClick={handleCopy}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copiado" : "Copiar Instrucciones"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
