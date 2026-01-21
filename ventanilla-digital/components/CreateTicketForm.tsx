"use client";

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createTicket } from "@/app/actions/createTicket";

import Button from "./ui/button";
import Input from "./ui/input";
import Label from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Textarea from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ciudadesColombia } from "../lib/data/ciudades-colombia";
import { paises } from "../lib/data/paises";
import { calcularFechaSLAPorDiasHabiles, formatearFechaSLA } from "../lib/sla-calculator";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const emptyToUndefined = <T,>(value: T) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return (trimmed === "" ? undefined : trimmed) as unknown as T;
  }
  return value;
};

const optionalText = () =>
  z.preprocess(emptyToUndefined, z.string().min(1, "Este campo es requerido").optional());

const optionalEmail = () =>
  z.preprocess(emptyToUndefined, z.string().email("Email inválido").optional());

const ticketSchema = z
  .object({
    solicitanteNombre: z.string().min(1, "El nombre es requerido"),
    solicitanteCargo: z.string().min(1, "El cargo es requerido"),
    solicitanteGerencia: z.string().min(1, "La gerencia es requerida"),
    solicitanteEmail: z.string().email("Email inválido"),
    tipoEntidad: z.enum(["PERSONA_NATURAL", "EMPRESA_LOCAL", "EMPRESA_EXTRANJERA"]),
    // Entidad
    nombrePersona: optionalText(),
    personaCorreo: optionalEmail(),
    personaTelefono: z.preprocess(emptyToUndefined, z.string().optional()),
    nit: z.preprocess(emptyToUndefined, z.string().optional()),
    taxId: z.preprocess(emptyToUndefined, z.string().optional()),
    empresaNombre: optionalText(),
    pais: optionalText(),
    ciudad: optionalText(),
    direccion: z.preprocess(emptyToUndefined, z.string().optional()),
    telefono: z.preprocess(emptyToUndefined, z.string().optional()),
    tipoTicket: z.enum(["CONSULTA", "SOPORTE_TECNICO", "RECLAMO", "SOLICITUD_CAMBIO", "INCIDENTE"]),
    prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
    diasResolucion: z.coerce.number().int().min(1, "Los días deben ser al menos 1"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    // Asignación (opcional)
    asignadoNombre: z.preprocess(emptyToUndefined, z.string().optional()),
    asignadoCargo: z.preprocess(emptyToUndefined, z.string().optional()),
    asignadoEmail: optionalEmail(),
    asignadoGerencia: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .superRefine((data, ctx) => {
    // Validaciones por tipo de entidad
    if (data.tipoEntidad === "PERSONA_NATURAL") {
      if (!data.nombrePersona) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nombrePersona"],
          message: "El nombre completo es requerido",
        });
      }
      if (!data.personaCorreo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["personaCorreo"],
          message: "El correo es requerido",
        });
      }
      // Teléfono es opcional (según requerimiento)
    }

    if (data.tipoEntidad === "EMPRESA_LOCAL") {
      if (!data.empresaNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["empresaNombre"],
          message: "La razón social es requerida",
        });
      }
      if (!data.ciudad) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ciudad"],
          message: "La ciudad es requerida",
        });
      }
      // NIT es opcional (según requerimiento)
    }

    if (data.tipoEntidad === "EMPRESA_EXTRANJERA") {
      if (!data.empresaNombre) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["empresaNombre"],
          message: "La razón social es requerida",
        });
      }
      if (!data.pais) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pais"],
          message: "El país es requerido",
        });
      }
      if (!data.ciudad) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ciudad"],
          message: "La ciudad es requerida",
        });
      }
      // Tax ID es opcional (según requerimiento)
    }
  })
  .refine((data) => {
    if (data.prioridad === "ALTA") return data.diasResolucion <= 5;
    if (data.prioridad === "MEDIA") return data.diasResolucion <= 10;
    return data.diasResolucion <= 15;
  }, {
    message: "Los días no corresponden a la prioridad seleccionada",
    path: ["diasResolucion"],
  });

type TicketFormData = z.infer<typeof ticketSchema>;

interface CreateTicketFormProps {
  currentUser?: {
    nombre: string;
    cargo: string;
    gerencia: string;
    email: string;
  };
}

export default function CreateTicketForm({ currentUser }: CreateTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<Array<{ nombre: string; email: string; cargo: string; gerencia: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema) as any,
    defaultValues: {
      solicitanteNombre: currentUser?.nombre || "",
      solicitanteCargo: currentUser?.cargo || "",
      solicitanteGerencia: currentUser?.gerencia || "",
      solicitanteEmail: currentUser?.email || "",
      tipoEntidad: "PERSONA_NATURAL",
      tipoTicket: "CONSULTA",
      prioridad: "MEDIA",
      diasResolucion: 3,
    },
  });

  const tipoEntidad = watch("tipoEntidad");
  const prioridad = watch("prioridad");
  const paisSeleccionado = watch("pais");
  const diasResolucion = watch("diasResolucion");
  const fechaSLAEstimada = calcularFechaSLAPorDiasHabiles(new Date(), Number(diasResolucion || 0));

  React.useEffect(() => {
    if (!diasResolucion) return;
    const dias = Number(diasResolucion);
    if (!Number.isFinite(dias)) return;
    if (dias <= 5) {
      setValue("prioridad", "ALTA");
      return;
    }
    if (dias <= 10) {
      setValue("prioridad", "MEDIA");
      return;
    }
    setValue("prioridad", "BAJA");
  }, [diasResolucion, setValue]);

  const handleFormSubmit: SubmitHandler<TicketFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createTicket(data);
      setSubmitSuccess(true);
      reset({
        ...data,
        descripcion: "",
      });
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError("Error al crear la Solicitud. Por favor, inténtalo de nuevo.");
      console.error("Error al enviar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#E84922]">Crear Nueva Solicitud</CardTitle>
        <CardDescription>
          Completa el formulario para registrar tu solicitud en el sistema de Ventanilla de Servicio Digital
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-[#E84922]/20 pb-2 text-[#E84922]">Datos del Solicitante</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solicitanteNombre">Nombre Completo *</Label>
                <Input id="solicitanteNombre" {...register("solicitanteNombre")} disabled className="bg-gray-50" />
                {errors.solicitanteNombre && (
                  <p className="text-sm text-red-500">{errors.solicitanteNombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solicitanteCargo">Cargo *</Label>
                <Input
                  id="solicitanteCargo"
                  {...register("solicitanteCargo")}
                  disabled={Boolean(currentUser?.cargo)}
                  className="bg-gray-50"
                />
                {errors.solicitanteCargo && (
                  <p className="text-sm text-red-500">{errors.solicitanteCargo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solicitanteGerencia">Gerencia *</Label>
                <Input
                  id="solicitanteGerencia"
                  {...register("solicitanteGerencia")}
                  disabled
                  className="bg-gray-50"
                />
                {!currentUser?.gerencia ? (
                  <p className="text-xs text-amber-600">
                    No se pudo detectar tu gerencia automáticamente. Verifica que tu usuario tenga <strong>department</strong> en Microsoft Entra ID.
                  </p>
                ) : null}
                {errors.solicitanteGerencia && (
                  <p className="text-sm text-red-500">{errors.solicitanteGerencia.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="solicitanteEmail">Correo Electrónico *</Label>
                <Input id="solicitanteEmail" type="email" {...register("solicitanteEmail")} disabled className="bg-gray-50" />
                {errors.solicitanteEmail && (
                  <p className="text-sm text-red-500">{errors.solicitanteEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-[#E84922]/20 pb-2 text-[#E84922]">Información de la Entidad</h3>

            <div className="space-y-2">
              <Label htmlFor="tipoEntidad">Tipo de Entidad *</Label>
              <Select value={tipoEntidad} onValueChange={(value) => setValue("tipoEntidad", value as TicketFormData["tipoEntidad"])}>
                <SelectTrigger id="tipoEntidad">
                  <SelectValue placeholder="Selecciona el tipo de entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONA_NATURAL">Persona Natural</SelectItem>
                  <SelectItem value="EMPRESA_LOCAL">Empresa Local (Colombia)</SelectItem>
                  <SelectItem value="EMPRESA_EXTRANJERA">Empresa Extranjera</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoEntidad && (
                <p className="text-sm text-red-500">{errors.tipoEntidad.message}</p>
              )}
            </div>

            {tipoEntidad === "PERSONA_NATURAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="nombrePersona">Nombre Completo *</Label>
                  <Input id="nombrePersona" {...register("nombrePersona")} placeholder="Nombre completo de la persona" />
                  {errors.nombrePersona && <p className="text-sm text-red-500">{errors.nombrePersona.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personaCorreo">Correo *</Label>
                  <Input id="personaCorreo" type="email" {...register("personaCorreo")} placeholder="correo@ejemplo.com" />
                  {errors.personaCorreo && <p className="text-sm text-red-500">{errors.personaCorreo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personaTelefono">Teléfono (Opcional)</Label>
                  <Input id="personaTelefono" {...register("personaTelefono")} placeholder="Ej: +57 300 1234567" />
                  {errors.personaTelefono && <p className="text-sm text-red-500">{errors.personaTelefono.message}</p>}
                </div>
              </div>
            )}

            {tipoEntidad === "EMPRESA_LOCAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT (Opcional)</Label>
                  <Input id="nit" {...register("nit")} placeholder="Ej: 900123456-7" />
                  {errors.nit && <p className="text-sm text-red-500">{errors.nit.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresaNombre">Razón Social *</Label>
                  <Input id="empresaNombre" {...register("empresaNombre")} placeholder="Nombre de la empresa" />
                  {errors.empresaNombre && <p className="text-sm text-red-500">{errors.empresaNombre.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais-local">País</Label>
                  <Input id="pais-local" value="Colombia" disabled className="bg-gray-100" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Select value={watch("ciudad") || ""} onValueChange={(value) => setValue("ciudad", value)}>
                    <SelectTrigger id="ciudad">
                      <SelectValue placeholder="Selecciona una ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudadesColombia.map((ciudad) => (
                        <SelectItem key={ciudad} value={ciudad}>
                          {ciudad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ciudad && <p className="text-sm text-red-500">{errors.ciudad.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" {...register("direccion")} placeholder="Dirección de la empresa" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" {...register("telefono")} placeholder="Ej: +57 300 1234567" />
                </div>
              </div>
            )}

            {tipoEntidad === "EMPRESA_EXTRANJERA" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / Registro Fiscal (Opcional)</Label>
                  <Input id="taxId" {...register("taxId")} placeholder="Ej: EIN 12-3456789" />
                  {errors.taxId && <p className="text-sm text-red-500">{errors.taxId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresaNombreExt">Razón Social *</Label>
                  <Input id="empresaNombreExt" {...register("empresaNombre")} placeholder="Nombre de la empresa" />
                  {errors.empresaNombre && <p className="text-sm text-red-500">{errors.empresaNombre.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Select value={paisSeleccionado || ""} onValueChange={(value) => setValue("pais", value)}>
                    <SelectTrigger id="pais">
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                    <SelectContent>
                      {paises.map((pais) => (
                        <SelectItem key={pais} value={pais}>
                          {pais}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pais && <p className="text-sm text-red-500">{errors.pais.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudadExt">Ciudad *</Label>
                  <Input id="ciudadExt" {...register("ciudad")} placeholder="Nombre de la ciudad" />
                  {errors.ciudad && <p className="text-sm text-red-500">{errors.ciudad.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionExt">Dirección</Label>
                  <Input id="direccionExt" {...register("direccion")} placeholder="Dirección de la empresa" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefonoExt">Teléfono</Label>
                  <Input id="telefonoExt" {...register("telefono")} placeholder="Ej: +1 555 1234567" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-[#E84922]/20 pb-2 text-[#E84922]">Detalles de la Solicitud</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoTicket">Tipo de Solicitud *</Label>
                <Select value={watch("tipoTicket")} onValueChange={(value) => setValue("tipoTicket", value as TicketFormData["tipoTicket"])}>
                  <SelectTrigger id="tipoTicket">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTA">Consulta</SelectItem>
                    <SelectItem value="SOPORTE_TECNICO">Soporte Técnico</SelectItem>
                    <SelectItem value="RECLAMO">Reclamo</SelectItem>
                    <SelectItem value="SOLICITUD_CAMBIO">Solicitud de Cambio</SelectItem>
                    <SelectItem value="INCIDENTE">Incidente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoTicket && <p className="text-sm text-red-500">{errors.tipoTicket.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad *</Label>
                <Select value={prioridad} onValueChange={(value) => setValue("prioridad", value as TicketFormData["prioridad"])}>
                  <SelectTrigger id="prioridad">
                    <SelectValue placeholder="Selecciona la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALTA">Alta (1 día hábil)</SelectItem>
                    <SelectItem value="MEDIA">Media (3 días hábiles)</SelectItem>
                    <SelectItem value="BAJA">Baja (5 días hábiles)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.prioridad && <p className="text-sm text-red-500">{errors.prioridad.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasResolucion">Días estimados *</Label>
                <Input
                  id="diasResolucion"
                  type="number"
                  min={1}
                  max={prioridad === "ALTA" ? 5 : prioridad === "MEDIA" ? 10 : 15}
                  {...register("diasResolucion")}
                />
                {errors.diasResolucion && <p className="text-sm text-red-500">{errors.diasResolucion.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción de la Solicitud *</Label>
                <Textarea id="descripcion" {...register("descripcion")} placeholder="Describe detalladamente tu solicitud o problema..." rows={5} />
                {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-[#E84922]/20 pb-2 text-[#E84922]">Asignación de la Solicitud</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asignadoNombre">Nombre del responsable</Label>
                <Input
                  id="asignadoNombre"
                  {...register("asignadoNombre")}
                  placeholder="Nombre del responsable"
                  onChange={async (e) => {
                    const nombre = e.target.value;
                    setValue("asignadoNombre", nombre);
                    if (nombre && nombre.length >= 2) {
                      setIsSearching(true);
                      try {
                        const response = await fetch(`/api/search-user?name=${encodeURIComponent(nombre)}`);
                        if (response.ok) {
                          const data = await response.json();
                          const results: Array<{ nombre: string; email: string; cargo: string; gerencia: string }> = Array.isArray(data)
                            ? data
                            : Array.isArray(data?.results)
                              ? data.results
                              : [];

                          setUserSuggestions(results);

                          // Si hay una sola coincidencia, autocompletar de una
                          if (results.length === 1) {
                            const u = results[0];
                            setValue("asignadoNombre", u.nombre || nombre);
                            setValue("asignadoCargo", u.cargo || "");
                            setValue("asignadoGerencia", u.gerencia || "");
                            if (u.email) setValue("asignadoEmail", u.email);
                            setUserSuggestions([]);
                          }
                        } else {
                          // Si falla la búsqueda, limpiar campos para que el usuario pueda escribir manualmente
                          console.log("Búsqueda no disponible, puedes escribir manualmente");
                        }
                      } catch (error) {
                        console.error("Error buscando usuario:", error);
                      } finally {
                        setIsSearching(false);
                      }
                    } else {
                      setValue("asignadoCargo", "");
                      setValue("asignadoEmail", "");
                      setValue("asignadoGerencia", "");
                      setUserSuggestions([]);
                    }
                  }}
                />
                {isSearching && <p className="text-xs text-blue-500">Buscando...</p>}
                {!isSearching && userSuggestions.length > 1 && (
                  <div className="mt-2 rounded-md border bg-white shadow-sm">
                    {userSuggestions.slice(0, 5).map((u) => (
                      <button
                        key={`${u.email}-${u.nombre}`}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                        onClick={() => {
                          setValue("asignadoNombre", u.nombre);
                          setValue("asignadoCargo", u.cargo || "");
                          setValue("asignadoGerencia", u.gerencia || "");
                          if (u.email) setValue("asignadoEmail", u.email);
                          setUserSuggestions([]);
                        }}
                      >
                        <div className="font-medium">{u.nombre || "—"}</div>
                        <div className="text-xs text-zinc-600">
                          {u.cargo || "Sin cargo"} · {u.gerencia || "Sin gerencia"} · {u.email || "Sin correo"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="asignadoGerencia">Gerencia del responsable</Label>
                <Input
                  id="asignadoGerencia"
                  {...register("asignadoGerencia")}
                  placeholder="Gerencia del responsable"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asignadoCargo">Cargo del responsable</Label>
                <Input id="asignadoCargo" {...register("asignadoCargo")} placeholder="Cargo del responsable" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asignadoEmail">Correo del responsable</Label>
                <Input id="asignadoEmail" type="email" {...register("asignadoEmail")} placeholder="correo@empresa.com" />
                {errors.asignadoEmail && <p className="text-sm text-red-500">{errors.asignadoEmail.message}</p>}
              </div>
            </div>
          </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Fecha de Compromiso SLA:</strong> {formatearFechaSLA(fechaSLAEstimada)}
                <br />
                <span className="text-sm text-gray-600">
                  Basado en {diasResolucion} día(s) hábil(es) estimado(s) (excluye fines de semana)
                </span>
              </AlertDescription>
            </Alert>
          </div>

          

          {submitSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Solicitud creado exitosamente! Se ha enviado una notificación al área correspondiente.
              </AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Solicitud"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
