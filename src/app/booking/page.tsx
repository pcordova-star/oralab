"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const regions = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
  "Valparaíso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Ñuble", 
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

const chileanCommunes = Array.from(new Set([
  "Santiago", "Concepción", "Viña del Mar", "Valparaíso", "Antofagasta", "Temuco", 
  "La Serena", "Rancagua", "Puerto Montt", "Talca", "Arica", "Iquique", 
  "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", 
  "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", 
  "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", 
  "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", 
  "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", 
  "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San Miguel", 
  "San Ramón", "Vitacura", "Colina", "Lampa", "Tiltil", 
  "Pirque", "San José de Maipo", "Buin", "Paine", "Calera de Tango", 
  "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", 
  "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
])).sort();

const bookingSchema = z.object({
  firstName: z.string().min(2, "Requerido"),
  lastNameFather: z.string().min(2, "Requerido"),
  lastNameMother: z.string().min(2, "Requerido"),
  email: z.string().email("Email inválido").min(1, "Requerido"),
  phone: z.string().length(8, "Deben ser 8 dígitos"),
  address: z.string().min(5, "Dirección requerida"),
  birthDay: z.string().min(1, "Día"),
  birthMonth: z.string().min(1, "Mes"),
  birthYear: z.string().min(4, "Año"),
  diagnosis: z.string().min(2, "Indique el diagnóstico"),
  weight: z.string().min(1, "Indique peso"),
  doctor: z.string().min(2, "Indique el médico"),
  country: z.string().min(1, "Seleccione país"),
  region: z.string().min(1, "Seleccione región"),
  commune: z.string().min(1, "Seleccione comuna"),
  sex: z.enum(["not_specified", "male", "female"], {
    required_error: "Seleccione una opción",
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = useFirestore();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastNameFather: "",
      lastNameMother: "",
      email: "",
      phone: "",
      address: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      diagnosis: "",
      weight: "",
      doctor: "",
      country: "Chile",
      region: "",
      commune: "",
      sex: "not_specified",
    },
  });

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = [
    { v: "01", l: "Enero" }, { v: "02", l: "Febrero" }, { v: "03", l: "Marzo" },
    { v: "04", l: "Abril" }, { v: "05", l: "Mayo" }, { v: "06", l: "Junio" },
    { v: "07", l: "Julio" }, { v: "08", l: "Agosto" }, { v: "09", l: "Septiembre" },
    { v: "10", l: "Octubre" }, { v: "11", l: "Noviembre" }, { v: "12", l: "Diciembre" }
  ];
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  function onSubmit(values: BookingFormValues) {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Inténtalo más tarde.",
      });
      return;
    }

    setIsSubmitting(true);
    const fullPhone = `+56 9 ${values.phone}`;
    const birthDate = `${values.birthYear}-${values.birthMonth}-${values.birthDay.padStart(2, '0')}`;
    
    const bookingData = {
      firstName: values.firstName,
      lastNameFather: values.lastNameFather,
      lastNameMother: values.lastNameMother,
      email: values.email,
      phone: fullPhone,
      address: values.address,
      birthDate: birthDate,
      diagnosis: values.diagnosis,
      weight: values.weight,
      doctor: values.doctor,
      country: values.country,
      region: values.region,
      commune: values.commune,
      sex: values.sex,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    const bookingsRef = collection(db, "bookings");
    
    addDocumentNonBlocking(bookingsRef, bookingData)
      .then(() => {
        toast({
          title: "Solicitud enviada correctamente",
          description: "Nos pondremos en contacto contigo a la brevedad para confirmar tu hora.",
        });
        setIsSubmitting(false);
        form.reset();
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-12">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-medium">
          <ChevronLeft className="mr-1 h-4 w-4" /> Volver
        </Link>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-primary/5 rounded-t-lg border-b border-primary/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-primary font-bold">Reserva tu Examen</CardTitle>
            </div>
            <CardDescription className="text-base italic">
              Completa los datos para coordinar tu cita.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombres</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pablo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lastNameFather"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido Paterno</FormLabel>
                          <FormControl>
                            <Input placeholder="Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastNameMother"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido Materno</FormLabel>
                          <FormControl>
                            <Input placeholder="González" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="usuario@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Chile</FormLabel>
                        <div className="flex gap-2 items-center">
                          <div className="bg-muted px-3 h-10 flex items-center rounded-md text-sm border font-medium">
                            +56 9
                          </div>
                          <FormControl>
                            <Input placeholder="12345678" maxLength={8} {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle, número, depto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="birthDay"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Día" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthMonth"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Mes" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {months.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthYear"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Año" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico en la orden</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Sospecha de SIBO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso aproximado (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 70" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico que emite la orden</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Chile">Chile</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Región</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chileanCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Sexo asignado al nacer</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border">
                            <RadioGroupItem value="not_specified" id="sex-none" />
                            <label htmlFor="sex-none" className="text-sm font-medium leading-none cursor-pointer flex-1">No especifica</label>
                          </div>
                          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border">
                            <RadioGroupItem value="male" id="sex-male" />
                            <label htmlFor="sex-male" className="text-sm font-medium leading-none cursor-pointer flex-1">Masculino</label>
                          </div>
                          <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border">
                            <RadioGroupItem value="female" id="sex-female" />
                            <label htmlFor="sex-female" className="text-sm font-medium leading-none cursor-pointer flex-1">Femenino</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando solicitud..." : "Agendar Cita"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}