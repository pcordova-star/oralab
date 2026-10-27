
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, serverTimestamp, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, Plus, Download, Trash2, ArrowLeft, Building2, User, Mail, 
  Phone, ShoppingCart, Calculator, Package, ShieldCheck, Pencil, 
  DollarSign, Send, CheckCircle, XCircle, Clock 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "admin@oralab.cl";
const IVA_RATE = 0.19;
const DEFAULT_USD_RATE = 950;
const COMMERCIAL_MARKUP = 2; // +100% markup
const SENSOR_DISCOUNT = 0.85; // 15% de descuento

const SUNVOU_CATALOG = [
  { description: "Analizador Breath Diagnostics Sunvou-DA7349 (H2/CH4/H2S/CO2)", unitPriceUSD: 5000 },
  { description: "Sensor Hidrógeno SV-eH2-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 900 },
  { description: "Sensor Metano SV-eCH4-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Sensor Sulfuro de Hidrógeno SV-eH2S-03 (Incluye boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 4 Bolsas)", unitPriceUSD: 2 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 7 Bolsas)", unitPriceUSD: 3.5 },
  { description: "Capacitación Técnica y Protocolos Clínicos Sunvou Chile", unitPriceUSD: 0 }
];

const DEFAULT_NOTES = "Vigencia de cotización: 15 días.\n- Plazo de Entrega: 20 a 30 días hábiles (dependiendo del stock) tras recepción de orden de compra y pago de anticipo.\n- Forma de pago: 70% contra orden de compra (anticipo) y 30% contra entrega.\n- Garantía: 2 años para equipo analizador y sensores.\n- Incluye capacitación técnica y protocolos clínicos Sunvou Chile.";

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unitPriceUSD?: number;
}

type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected';

export default function QuotationsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_RATE);
  const [status, setStatus] = useState<QuotationStatus>('pending');
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [notes, setNotes] = useState(DEFAULT_NOTES);

  useEffect(() => {
    setIsMounted(true);
    resetForm();
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

  const applyExchangeRate = (rate: number) => {
    const updatedItems = items.map(item => {
      if (item.unitPriceUSD !== undefined) {
        const isSensor = item.description.toLowerCase().includes("sensor");
        const multiplier = isSensor ? SENSOR_DISCOUNT : 1.0;
        return { ...item, unitPrice: Math.round(item.unitPriceUSD * rate * COMMERCIAL_MARKUP * multiplier) };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleRateChange = (newRate: number) => {
    setExchangeRate(newRate);
    applyExchangeRate(newRate);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  
  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateNetTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const calculateIVA = () => calculateNetTotal() * IVA_RATE;
  const calculateGrossTotal = () => calculateNetTotal() * (1 + IVA_RATE);

  const handleSaveQuotation = async () => {
    if (!db || !clientName || !clientEmail || items.length === 0 || items.some(i => !i.description)) {
      toast({ variant: "destructive", title: "Error", description: "Completa los datos del cliente." });
      return;
    }

    const netTotal = calculateNetTotal();
    const quotationData = {
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      items,
      total: netTotal,
      notes,
      exchangeRate,
      status,
    };

    try {
      if (editingQuoteId) {
        const quoteRef = doc(db, "quotations", editingQuoteId);
        updateDocumentNonBlocking(quoteRef, { ...quotationData, updatedAt: serverTimestamp() });
        toast({ title: "Cotización actualizada" });
      } else {
        const quotationsRef = collection(db, "quotations");
        addDocumentNonBlocking(quotationsRef, { ...quotationData, createdAt: serverTimestamp() });
        toast({ title: "Cotización creada" });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  const updateStatus = async (id: string, newStatus: QuotationStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "quotations", id), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Estado actualizado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  }

  const handleEditOpen = (quote: any) => {
    setEditingQuoteId(quote.id);
    setClientName(quote.clientName || "");
    setClientCompany(quote.clientCompany || "");
    setClientEmail(quote.clientEmail || "");
    setClientPhone(quote.clientPhone || "");
    setItems(quote.items || []);
    setNotes(quote.notes || DEFAULT_NOTES);
    setExchangeRate(quote.exchangeRate || DEFAULT_USD_RATE);
    setStatus(quote.status || 'pending');
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingQuoteId(null);
    setClientName("");
    setClientCompany("");
    setClientEmail("");
    setClientPhone("");
    setExchangeRate(DEFAULT_USD_RATE);
    setStatus('pending');
    setItems(SUNVOU_CATALOG.map(c => {
      const isSensor = c.description.toLowerCase().includes("sensor");
      const multiplier = isSensor ? SENSOR_DISCOUNT : 1.0;
      return {
        description: c.description,
        quantity: 1,
        unitPriceUSD: c.unitPriceUSD,
        unitPrice: Math.round(c.unitPriceUSD * DEFAULT_USD_RATE * COMMERCIAL_MARKUP * multiplier)
      };
    }));
    setNotes(DEFAULT_NOTES);
  };

  const downloadQuotationPDF = (quote: any) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 15;

    const primaryColor = [28, 104, 182]; // Azul Oralab
    const secondaryColor = [25, 204, 204]; // Turquesa
    
    // Header Institucional
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TRESNA - ORALAB", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("División de Diagnóstico de Aire Espirado", margin, 32);
    doc.text("Representante Oficial Sunvou® Breath Diagnostics en Chile", margin, 37);

    doc.setFontSize(9);
    doc.text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 155, 25);
    doc.text(`Propuesta: SUN-${quote.id.substr(0, 6).toUpperCase()}`, 155, 30);

    y = 55;

    // Sección de Introducción Institucional
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRESENTACIÓN INSTITUCIONAL", margin, y);
    y += 7;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const introText = "Tresna SpA, mediante su unidad clínica Oralab, actúa como representante oficial y exclusivo de Sunvou® Breath Diagnostics en el territorio nacional. Sunvou® es una marca líder mundial en el desarrollo de analizadores de gases de alta precisión para el diagnóstico no invasivo de trastornos gastrointestinales. Con presencia en más de 40 países, sus equipos utilizan sensores electromecánicos de última generación que garantizan mediciones estables de H2, CH4, H2S y CO2, cumpliendo con los estándares internacionales de exactitud clínica.";
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, margin, y);
    y += (splitIntro.length * 5) + 8;

    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Datos del Cliente
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATARIO", margin, y);
    y += 7;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, 170, 35, 3, 3, 'FD');
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${quote.clientName}`, margin + 5, y + 10);
    doc.text(`Institución: ${quote.clientCompany || 'Particular'}`, margin + 5, y + 18);
    doc.text(`Email: ${quote.clientEmail}`, margin + 5, y + 26);
    doc.text(`Teléfono: ${quote.clientPhone || 'No registrado'}`, 110, y + 10);
    y += 45;

    // Tabla de Items
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE EQUIPAMIENTO E INSUMOS", margin, y);
    y += 7;

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 170, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Descripción del Producto / Servicio", margin + 3, y + 6);
    doc.text("Cant.", 130, y + 6);
    doc.text("Unitario", 145, y + 6);
    doc.text("Subtotal", 172, y + 6);
    y += 11;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    quote.items.forEach((item: any) => {
      const splitDesc = doc.splitTextToSize(item.description, 95);
      const rowHeight = (splitDesc.length * 5) + 3;
      
      if (y + rowHeight > pageHeight - 65) {
        doc.addPage();
        y = 20;
      }

      doc.text(splitDesc, margin + 3, y + 4);
      doc.text(item.quantity.toString(), 133, y + 4, { align: 'center' });
      doc.text(`$${Math.round(item.unitPrice).toLocaleString()}`, 158, y + 4, { align: 'right' });
      doc.text(`$${Math.round(item.unitPrice * item.quantity).toLocaleString()}`, 188, y + 4, { align: 'right' });
      y += rowHeight;
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, y, margin + 170, y);
    });

    y += 10;
    
    // Desglose de Totales
    const netTotal = quote.total;
    const iva = netTotal * IVA_RATE;
    const grossTotal = netTotal * (1 + IVA_RATE);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`SUBTOTAL NETO:`, 140, y, { align: 'right' });
    doc.text(`$${Math.round(netTotal).toLocaleString()}`, 188, y, { align: 'right' });
    y += 6;
    doc.text(`IVA (19%):`, 140, y, { align: 'right' });
    doc.text(`$${Math.round(iva).toLocaleString()}`, 188, y, { align: 'right' });
    y += 9;
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL (IVA INC.):`, 140, y, { align: 'right' });
    doc.text(`$${Math.round(grossTotal).toLocaleString()}`, 188, y, { align: 'right' });
    y += 15;

    // Notas y Condiciones
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.text("CONDICIONES COMERCIALES Y SOPORTE", margin, y);
    y += 6;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(quote.notes, 170);
    doc.text(splitNotes, margin, y);

    // Pie de Página Corporativo
    doc.setFillColor(245, 247, 249);
    doc.rect(0, pageHeight - 30, 210, 30, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Tresna SpA | Oralab Clinical Lab - Representación Oficial Sunvou® en Chile.", margin, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.text("Av. Apoquindo 3990, Of. 605, Las Condes, Santiago | contacto@oralab.cl", margin, pageHeight - 10);
    doc.text(`Tasa aplicada: $${quote.exchangeRate} CLP/USD`, 160, pageHeight - 10);

    doc.save(`Propuesta_Sunvou_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'pending': return <Badge variant="outline" className="bg-slate-50 text-slate-500 uppercase font-black text-[9px]">Borrador</Badge>;
      case 'sent': return <Badge variant="outline" className="bg-blue-50 text-blue-500 uppercase font-black text-[9px]">Enviada</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-50 text-green-600 uppercase font-black text-[9px]">Aceptada</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-500 uppercase font-black text-[9px]">Rechazada</Badge>;
      default: return <Badge>{s}</Badge>;
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
              <FileText className="h-8 w-8 text-secondary" /> CRM Sunvou Chile
            </h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-full bg-secondary font-black h-12 px-6">
                <Plus className="mr-2 h-5 w-5" /> Nueva Propuesta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary italic">
                  {editingQuoteId ? "Editar Cotización" : "Nueva Cotización Sunvou"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-primary">Tasa USD/CLP</Label>
                    <Input 
                      type="number" 
                      value={exchangeRate} 
                      onChange={(e) => handleRateChange(parseInt(e.target.value) || 0)}
                      className="bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-primary">Estado Comercial</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Borrador</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="accepted">Aceptada</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nombre Cliente</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Institución</Label><Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Teléfono</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-black text-primary">Detalle de Equipos e Insumos</Label>
                    <Button variant="outline" size="sm" onClick={addItem} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Ítem Especial</Button>
                  </div>
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-xl border border-primary/5">
                      <Input className="col-span-6 bg-white" placeholder="Descripción" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                      <Input type="number" className="col-span-2 bg-white" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} />
                      <Input type="number" className="col-span-3 bg-white font-bold" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)} />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <Textarea className="bg-white md:w-2/3" value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">Total IVA Inc.</p>
                    <p className="text-2xl font-black text-primary">${Math.round(calculateGrossTotal()).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveQuotation} className="bg-primary font-black px-8 rounded-full">
                  {editingQuoteId ? "Actualizar Propuesta" : "Emitir Cotización"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total IVA Inc.</TableHead>
                  <TableHead className="text-right">Gestión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuotesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando...</TableCell></TableRow>
                ) : quotations?.map((q) => (
                  <TableRow key={q.id} className="group">
                    <TableCell>{getStatusBadge(q.status)}</TableCell>
                    <TableCell className="text-xs font-bold">
                      {q.createdAt?.seconds ? format(new Date(q.createdAt.seconds * 1000), "dd/MM/yy") : "Reciente"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-primary">{q.clientName}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{q.clientCompany || "Particular"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-lg">
                      ${Math.round((q.total || 0) * 1.19).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(q)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => downloadQuotationPDF(q)} className="rounded-full border-primary/20 text-primary font-bold">
                          <Download className="mr-1 h-3.5 w-3.5" /> PDF
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600" onClick={() => { setQuoteToDelete(q.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-primary italic">¿Eliminar Cotización?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción borrará el registro permanente del CRM.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (quoteToDelete && db) {
                  await deleteDoc(doc(db, "quotations", quoteToDelete));
                  setQuoteToDelete(null);
                  toast({ title: "Registro eliminado" });
                }
              }}
              className="bg-red-500 hover:bg-red-600 rounded-full font-black"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
