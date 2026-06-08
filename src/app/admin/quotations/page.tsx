
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, serverTimestamp, orderBy, doc, deleteDoc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileText, Plus, Download, Trash2, ArrowLeft, Building2, User, Mail, Phone, ShoppingCart, Calculator } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { jsPDF } from "jspdf";
import Link from "next/link";

const ADMIN_EMAIL = "admin@oralab.cl";
const IVA_RATE = 0.19;

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function QuotationsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    } else if (user && user.email !== ADMIN_EMAIL) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const quotationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "quotations"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: quotations, isLoading: isQuotesLoading } = useCollection(quotationsQuery);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateNetTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculateIVA = () => calculateNetTotal() * IVA_RATE;
  const calculateGrossTotal = () => calculateNetTotal() * (1 + IVA_RATE);

  const handleGenerateQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.some(i => !i.description)) {
      toast({ variant: "destructive", title: "Error", description: "Completa todos los campos obligatorios." });
      return;
    }

    const netTotal = calculateNetTotal();
    const quotationData = {
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      items,
      total: netTotal, // We store the net as base
      createdAt: serverTimestamp(),
      notes,
    };

    try {
      const quotationsRef = collection(db, "quotations");
      await addDocumentNonBlocking(quotationsRef, quotationData);
      
      toast({ title: "Cotización creada", description: "Se ha registrado la cotización exitosamente." });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la cotización." });
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientCompany("");
    setClientEmail("");
    setClientPhone("");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setNotes("");
  };

  const downloadQuotationPDF = (quote: any) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 15;

    const primaryRGB = [28, 104, 182];
    
    // Cabecera
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("SUNVOU CHILE", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Representación Oficial Sunvou® Breath Diagnostics", margin, 32);

    doc.setFontSize(10);
    doc.text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 145, 25);
    doc.text(`Cotización: SUN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 145, 30);

    y = 55;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("COTIZACIÓN COMERCIAL", margin, y);
    y += 15;

    // Datos del Cliente
    doc.setFillColor(245, 247, 249);
    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(margin, y, 170, 40, 3, 3, 'FD');
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL DESTINATARIO", margin + 5, y + 10);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${quote.clientName}`, margin + 5, y + 20);
    doc.text(`Empresa: ${quote.clientCompany || 'Particular'}`, margin + 5, y + 28);
    
    doc.text(`Email: ${quote.clientEmail}`, 110, y + 20);
    doc.text(`Teléfono: ${quote.clientPhone || 'No registrado'}`, 110, y + 28);
    y += 50;

    // Tabla de Items
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE PROPUESTA (VALORES NETOS)", margin, y);
    y += 8;

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Descripción del Equipo / Servicio", margin + 5, y + 7);
    doc.text("Cant.", 140, y + 7);
    doc.text("Unitario", 160, y + 7);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    quote.items.forEach((item: any) => {
      doc.text(item.description, margin + 5, y + 7);
      doc.text(item.quantity.toString(), 140, y + 7);
      doc.text(`$${Math.round(item.unitPrice).toLocaleString()}`, 160, y + 7);
      y += 10;
      doc.line(margin, y, margin + 170, y);
    });

    y += 10;
    
    // Desglose de Totales
    const netTotal = quote.total;
    const iva = netTotal * IVA_RATE;
    const grossTotal = netTotal * (1 + IVA_RATE);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`TOTAL NETO:`, 130, y);
    doc.text(`$${Math.round(netTotal).toLocaleString()}`, 170, y, { align: 'right' });
    y += 7;
    doc.text(`IVA (19%):`, 130, y);
    doc.text(`$${Math.round(iva).toLocaleString()}`, 170, y, { align: 'right' });
    y += 10;
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL (IVA INC.):`, 115, y);
    doc.text(`$${Math.round(grossTotal).toLocaleString()}`, 170, y, { align: 'right' });
    y += 20;

    // Notas
    if (quote.notes) {
      doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
      doc.setFontSize(11);
      doc.text("OBSERVACIONES Y CONDICIONES", margin, y);
      y += 8;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(quote.notes, 170);
      doc.text(splitNotes, margin, y);
    }

    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(245, 247, 249);
    doc.rect(0, pageHeight - 30, 210, 30, 'F');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Representante Exclusivo Sunvou Breath Diagnostics en Chile.", margin, pageHeight - 15);
    doc.text("contacto@oralab.cl | www.oralab.cl", margin, pageHeight - 10);

    doc.save(`Cotizacion_Sunvou_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("¿Eliminar esta cotización del registro?")) return;
    try {
      await deleteDoc(doc(db, "quotations", id));
      toast({ title: "Eliminado", description: "Cotización eliminada." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." });
    }
  };

  if (isUserLoading || !isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-20 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link href="/reception" className="inline-flex items-center text-primary hover:underline mb-2 text-sm">
              <ArrowLeft className="mr-1 h-3 w-3" /> Volver a Recepción
            </Link>
            <h1 className="text-3xl font-black text-primary flex items-center gap-3 italic">
              <FileText className="h-8 w-8 text-secondary" /> Cotizaciones Sunvou Chile
            </h1>
            <p className="text-muted-foreground font-medium">Gestión comercial y propuestas para clínicas.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-secondary hover:bg-secondary/90 font-black h-12 px-6 shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Nueva Cotización
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary italic">Generar Propuesta Comercial</DialogTitle>
                <CardDescription>Cálculo automático de IVA (19%) incluido.</CardDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><User className="h-3 w-3" /> Nombre del Cliente</Label>
                    <Input placeholder="Ej: Dr. Roberto Gómez" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Building2 className="h-3 w-3" /> Clínica / Empresa</Label>
                    <Input placeholder="Ej: Clínica Las Condes" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                    <Input type="email" placeholder="cliente@correo.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</Label>
                    <Input placeholder="+56 9 ..." value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <Label className="font-black text-lg text-primary flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Detalle Netos</Label>
                    <Button variant="ghost" size="sm" onClick={addItem} className="text-secondary font-bold">
                      <Plus className="mr-1 h-4 w-4" /> Agregar ítem
                    </Button>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-3 rounded-xl border">
                      <div className="col-span-12 md:col-span-6 space-y-1">
                        <Label className="text-[10px] font-bold uppercase">Descripción</Label>
                        <Input 
                          placeholder="Ej: Analizador Sunvou H2/CH4" 
                          value={item.description} 
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-bold uppercase">Cant.</Label>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-1">
                        <Label className="text-[10px] font-bold uppercase">Unit. Neto ($)</Label>
                        <Input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-primary/5 p-6 rounded-2xl space-y-2 text-right">
                    <div className="text-sm font-bold text-muted-foreground">Subtotal Neto: ${Math.round(calculateNetTotal()).toLocaleString()}</div>
                    <div className="text-sm font-bold text-muted-foreground">IVA (19%): ${Math.round(calculateIVA()).toLocaleString()}</div>
                    <div className="text-2xl font-black text-primary flex items-center justify-end gap-2 italic">
                      <Calculator className="h-6 w-6 text-secondary" />
                      TOTAL IVA INC: ${Math.round(calculateGrossTotal()).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Notas Adicionales / Condiciones</Label>
                  <Textarea 
                    placeholder="Ej: Validez por 15 días, incluye capacitación, garantía de 1 año..." 
                    className="h-24"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleGenerateQuotation} className="bg-primary font-bold">Emitir Cotización</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem]">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-xl text-primary font-bold">Historial de Propuestas Sunvou</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Cliente / Empresa</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Monto Neto</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Total IVA Inc.</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuotesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">Cargando...</TableCell></TableRow>
                ) : quotations?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium">No se han emitido propuestas aún.</TableCell></TableRow>
                ) : (
                  quotations?.map((q) => (
                    <TableRow key={q.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium text-xs">
                        {q.createdAt?.seconds ? format(new Date(q.createdAt.seconds * 1000), "dd/MM/yy") : "Reciente"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{q.clientName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{q.clientCompany || "Particular"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">
                        ${Math.round(q.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-black text-primary text-lg">
                          ${Math.round((q.total || 0) * (1 + IVA_RATE)).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold"
                            onClick={() => downloadQuotationPDF(q)}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" /> PDF
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-600 rounded-full"
                            onClick={() => handleDelete(q.id)}
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
