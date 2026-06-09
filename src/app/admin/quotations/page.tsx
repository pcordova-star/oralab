
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

// Catálogo Base Sunvou (Precios fábrica USD)
const SUNVOU_CATALOG = [
  { description: "Analizador Breath Diagnostics Sunvou-DA7349 (H2/CH4/H2S/CO2)", unitPriceUSD: 5000 },
  { description: "Sensor Hidrógeno SV-eH2-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 900 },
  { description: "Sensor Metano SV-eCH4-03 (Incluye 300 boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Sensor Sulfuro de Hidrógeno SV-eH2S-03 (Incluye boquillas y sensor)", unitPriceUSD: 1350 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 4 Bolsas)", unitPriceUSD: 2 },
  { description: "Kit de Muestreo SV-OSKB (1 pieza Y + 7 Bolsas)", unitPriceUSD: 3.5 },
  { description: "Capacitación Técnica y Protocolos Clínicos Sunvou Chile", unitPriceUSD: 0 }
];

const DEFAULT_NOTES = "Vigencia de cotización: 15 días.\n- Plazo de Entrega: Aproximadamente 15-20 días hábiles tras recepción de orden de compra y pago de anticipo.\n- Forma de pago: 50% contra orden de compra (anticipo) y 50% contra entrega.\n- Garantía: 2 años para equipo analizador y sensores.\n- Incluye capacitación técnica y protocolos clínicos Sunvou Chile.";

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

  // CRM State
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_RATE);
  const [status, setStatus] = useState<QuotationStatus>('pending');

  // Form State
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
        return { ...item, unitPrice: item.unitPriceUSD * rate * COMMERCIAL_MARKUP };
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
      toast({ variant: "destructive", title: "Error", description: "Completa los datos del cliente y asegúrate de tener ítems válidos." });
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
        toast({ title: "Cotización actualizada", description: "Los cambios se han guardado en el CRM." });
      } else {
        const quotationsRef = collection(db, "quotations");
        addDocumentNonBlocking(quotationsRef, { ...quotationData, createdAt: serverTimestamp() });
        toast({ title: "Cotización creada", description: "Propuesta registrada exitosamente." });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo procesar la operación." });
    }
  }

  const updateStatus = async (id: string, newStatus: QuotationStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "quotations", id), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "Estado actualizado", description: `La propuesta ha sido marcada como ${getStatusLabel(newStatus)}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado." });
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
    setItems(SUNVOU_CATALOG.map(c => ({
      description: c.description,
      quantity: 1,
      unitPriceUSD: c.unitPriceUSD,
      unitPrice: c.unitPriceUSD * DEFAULT_USD_RATE * COMMERCIAL_MARKUP
    })));
    setNotes(DEFAULT_NOTES);
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'pending': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      default: return s;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'pending': return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 uppercase font-black text-[9px]"><Clock className="h-3 w-3 mr-1" /> Borrador</Badge>;
      case 'sent': return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200 uppercase font-black text-[9px]"><Send className="h-3 w-3 mr-1" /> Enviada</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 uppercase font-black text-[9px]"><CheckCircle className="h-3 w-3 mr-1" /> Aceptada</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200 uppercase font-black text-[9px]"><XCircle className="h-3 w-3 mr-1" /> Rechazada</Badge>;
      default: return <Badge>{s}</Badge>;
    }
  };

  const downloadQuotationPDF = (quote: any) => {
    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    let y = 15;

    const primaryRGB = [28, 104, 182];
    
    // Cabecera
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("TRESNA - ORALAB", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Representación Oficial Sunvou® Breath Diagnostics en Chile", margin, 32);

    doc.setFontSize(10);
    doc.text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 145, 25);
    doc.text(`Propuesta: SUN-${quote.id.substr(0, 6).toUpperCase()}`, 145, 30);

    y = 55;

    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PROPUESTA TÉCNICO-COMERCIAL", margin, y);
    y += 15;

    // Datos del Cliente
    doc.setFillColor(245, 247, 249);
    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(margin, y, 170, 40, 3, 3, 'FD');
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATARIO", margin + 5, y + 10);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${quote.clientName}`, margin + 5, y + 20);
    doc.text(`Institución: ${quote.clientCompany || 'Particular'}`, margin + 5, y + 28);
    
    doc.text(`Email: ${quote.clientEmail}`, 110, y + 20);
    doc.text(`Teléfono: ${quote.clientPhone || 'No registrado'}`, 110, y + 28);
    y += 50;

    // Tabla de Items
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE EQUIPAMIENTO E INSUMOS", margin, y);
    y += 8;

    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(margin, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("Descripción del Producto", margin + 5, y + 7);
    doc.text("Cant.", 140, y + 7);
    doc.text("Unitario", 160, y + 7);
    y += 10;

    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    quote.items.forEach((item: any) => {
      const splitDesc = doc.splitTextToSize(item.description, 110);
      doc.text(splitDesc, margin + 5, y + 7);
      doc.text(item.quantity.toString(), 140, y + 7);
      doc.text(`$${Math.round(item.unitPrice).toLocaleString()}`, 160, y + 7);
      y += (splitDesc.length * 5) + 5;
      doc.line(margin, y, margin + 170, y);
    });

    y += 10;
    
    // Desglose de Totales
    const netTotal = quote.total;
    const iva = netTotal * IVA_RATE;
    const grossTotal = netTotal * (1 + IVA_RATE);
    const rightValueMargin = 190;
    const labelsMargin = 110;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`SUBTOTAL NETO:`, labelsMargin, y);
    doc.text(`$${Math.round(netTotal).toLocaleString()}`, rightValueMargin, y, { align: 'right' });
    y += 7;
    doc.text(`IVA (19%):`, labelsMargin, y);
    doc.text(`$${Math.round(iva).toLocaleString()}`, rightValueMargin, y, { align: 'right' });
    y += 10;
    
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL (IVA INC.):`, labelsMargin - 10, y);
    doc.text(`$${Math.round(grossTotal).toLocaleString()}`, rightValueMargin, y, { align: 'right' });
    y += 15;

    // Verificar si hay espacio para las notas antes del footer
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 20;
    }

    // Notas
    if (quote.notes) {
      doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
      doc.setFontSize(11);
      doc.text("CONDICIONES COMERCIALES Y LOGÍSTICA", margin, y);
      y += 8;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(quote.notes, 170);
      doc.text(splitNotes, margin, y);
    }

    // Pie de Página
    doc.setFillColor(245, 247, 249);
    doc.rect(0, pageHeight - 35, 210, 35, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TRESNA - Representante oficial para su línea Oralab Breath Diagnostics.", margin, pageHeight - 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Apoquindo 3992, Of. 605, Las Condes, Santiago | contacto@oralab.cl", margin, pageHeight - 15);
    doc.text("Tasa de cambio aplicada: $" + (quote.exchangeRate || DEFAULT_USD_RATE) + " CLP/USD", margin, pageHeight - 10);
    
    doc.setFontSize(7);
    doc.text("v2.1.6", 190, pageHeight - 5, { align: 'right' });

    doc.save(`Sunvou_Propuesta_${quote.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("¿Eliminar esta cotización del registro?")) return;
    try {
      await deleteDoc(doc(db, "quotations", id));
      toast({ title: "Eliminado", description: "Cotización eliminada correctamente." });
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
              <FileText className="h-8 w-8 text-secondary" /> CRM Sunvou Chile
            </h1>
            <p className="text-muted-foreground font-medium">Gestión comercial de Tresna - Representación Sunvou®.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-full bg-secondary hover:bg-secondary/90 font-black h-12 px-6 shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Nueva Propuesta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-primary italic">
                  {editingQuoteId ? "Editar Cotización Sunvou" : "Nueva Cotización Sunvou"}
                </DialogTitle>
                <CardDescription>Ajusta la tasa de cambio y el estado comercial de la propuesta.</CardDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase flex items-center gap-1 text-primary">
                      <DollarSign className="h-3 w-3" /> Tasa del día (USD/CLP)
                    </Label>
                    <Input 
                      type="number" 
                      value={exchangeRate} 
                      onChange={(e) => handleRateChange(parseInt(e.target.value) || 0)}
                      className="bg-white font-black text-lg text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase flex items-center gap-1 text-primary">
                      <Clock className="h-3 w-3" /> Estado Comercial
                    </Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
                      <SelectTrigger className="bg-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Borrador</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="accepted">Aceptada</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <p className="text-[10px] font-bold text-muted-foreground italic mb-2">
                      *Representante Oficial: Tresna. Entrega 15-20 días hábiles.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-1"><User className="h-3 w-3" /> Cliente Destinatario</Label>
                      <Input placeholder="Ej: Dr. Roberto Gómez" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-1"><Building2 className="h-3 w-3" /> Institución / Clínica</Label>
                      <Input placeholder="Ej: Clínica Las Condes" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-1"><Mail className="h-3 w-3" /> Email de contacto</Label>
                      <Input type="email" placeholder="cliente@correo.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</Label>
                      <Input placeholder="+56 9 ..." value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-black text-lg text-primary flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Detalle de Insumos y Equipos</Label>
                    <Button variant="outline" size="sm" onClick={addItem} className="text-primary font-bold border-primary/20 rounded-full">
                      <Plus className="mr-1 h-4 w-4" /> Ítem Especial
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-3 rounded-xl border border-primary/5 hover:border-primary/20 transition-all">
                        <div className="col-span-12 md:col-span-6 space-y-1">
                          <Input 
                            placeholder="Descripción del ítem..." 
                            className="bg-white"
                            value={item.description} 
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2 space-y-1">
                          <div className="relative">
                            <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              className="pl-7 bg-white"
                              value={item.quantity} 
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-3 space-y-1">
                          <div className="relative">
                            <span className="absolute left-2 top-2.5 text-muted-foreground font-bold text-xs">$</span>
                            <Input 
                              type="number" 
                              className="pl-6 bg-white font-black text-primary"
                              value={item.unitPrice} 
                              onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 md:col-span-1 text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-primary/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-left w-full md:w-auto">
                      <Label className="font-bold block mb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Notas y Condiciones comerciales</Label>
                      <Textarea 
                        className="bg-white min-h-[120px] w-full md:w-[400px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="text-right space-y-1 w-full md:w-auto">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Subtotal Neto: ${Math.round(calculateNetTotal()).toLocaleString()}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">IVA (19%): ${Math.round(calculateIVA()).toLocaleString()}</div>
                      <div className="text-2xl font-black text-primary flex items-center justify-end gap-2 italic">
                        <Calculator className="h-6 w-6 text-secondary" />
                        TOTAL IVA INC: ${Math.round(calculateGrossTotal()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-full" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveQuotation} className="bg-primary font-black px-8 rounded-full shadow-lg">
                  {editingQuoteId ? "Guardar Cambios" : "Emitir Cotización"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-xl border-primary/10 overflow-hidden rounded-[2rem]">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary font-bold">Embudo de Ventas Tresna - Sunvou</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">Gestión oficial de representaciones Sunvou Chile.</p>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="font-black text-[10px] uppercase">Estado</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Fecha</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Cliente / Clínica</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Tasa</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Total IVA Inc.</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">Gestión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuotesLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12">Buscando propuestas...</TableCell></TableRow>
                ) : quotations?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-medium italic">No hay cotizaciones registradas aún.</TableCell></TableRow>
                ) : (
                  quotations?.map((q) => (
                    <TableRow key={q.id} className="hover:bg-primary/5 transition-colors group">
                      <TableCell>{getStatusBadge(q.status)}</TableCell>
                      <TableCell className="font-bold text-xs">
                        {q.createdAt?.seconds ? format(new Date(q.createdAt.seconds * 1000), "dd/MM/yy") : "Reciente"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-primary group-hover:underline cursor-pointer">{q.clientName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{q.clientCompany || "Particular"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground text-xs">
                        ${q.exchangeRate || DEFAULT_USD_RATE}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-black text-primary text-lg">
                          ${Math.round((q.total || 0) * (1 + IVA_RATE)).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <div className="flex border-r pr-2 mr-2 gap-1">
                            {q.status !== 'accepted' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-green-500 hover:bg-green-50 rounded-full"
                                onClick={() => updateStatus(q.id, 'accepted')}
                                title="Marcar como Aceptada"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {q.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-blue-500 hover:bg-blue-50 rounded-full"
                                onClick={() => updateStatus(q.id, 'sent')}
                                title="Marcar como Enviada"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-primary hover:bg-primary/10 h-8 w-8"
                            onClick={() => handleEditOpen(q)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold shadow-sm"
                            onClick={() => downloadQuotationPDF(q)}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" /> PDF
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-300 hover:text-red-600 rounded-full h-8 w-8"
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
