"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Ticket {
    idTicket: number;
    tipoSolicitud: string;
    usuarioNombre: string;
    empresaNombre: string | null;
    fechaSolicitud: Date;
    prioridad: string;
    estado: string;
    ansFechaCompromiso: Date | null;
}

const formatFecha = (fecha: Date | null) => {
    if (!fecha) return "—";
    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(fecha));
};

const badgeEstado = (estado: string) => {
    if (estado === "Abierto") return <Badge variant="info">Abierto</Badge>;
    if (estado === "En_Proceso") return <Badge variant="warning">En Proceso</Badge>;
    if (estado === "Cerrado") return <Badge variant="success">Cerrado</Badge>;
    return <Badge>{estado.replace("_", " ")}</Badge>;
};

const prioridadView = (prioridad: string) => {
    if (prioridad === "Alta") {
        return (
            <span className="inline-flex items-center gap-2 font-medium text-[#E84922]">
                <span className="h-2 w-2 rounded-full bg-[#E84922]" />
                Alta
            </span>
        );
    }
    return <span className="text-zinc-700 dark:text-zinc-200">{prioridad}</span>;
};

export default function DashboardClient({ tickets }: { tickets: Ticket[] }) {
    // State for metrics (derived from ALL tickets)
    const total = tickets.length;
    const enProceso = tickets.filter(t => t.estado === "En_Proceso").length;
    const cerrados = tickets.filter(t => t.estado === "Cerrado").length;
    const abiertos = tickets.filter(t => t.estado === "Abierto").length; // "No iniciada"

    // State for filters
    const [filterText, setFilterText] = useState("");
    const [filterEstado, setFilterEstado] = useState("TODOS");
    const [filterTipo, setFilterTipo] = useState("TODOS");
    const [filterDept, setFilterDept] = useState("TODOS"); // Placeholder if we had department data

    // Filter Logic
    const filteredTickets = tickets.filter((t) => {
        const matchesText =
            t.idTicket.toString().includes(filterText) ||
            t.tipoSolicitud.toLowerCase().includes(filterText.toLowerCase()) ||
            t.usuarioNombre.toLowerCase().includes(filterText.toLowerCase());

        const matchesEstado = filterEstado === "TODOS" || t.estado === filterEstado;
        const matchesTipo = filterTipo === "TODOS" || t.tipoSolicitud === filterTipo;

        return matchesText && matchesEstado && matchesTipo;
    });

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-4 space-y-4">
            {/* Métricas Header */}
            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-center">
                    {/* Big Number 1 */}
                    <div className="text-center">
                        <span className="block text-4xl font-bold text-[#00B050] mb-0">{total}</span>
                        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                            Total de Solicitudes
                        </span>
                    </div>

                    {/* Big Number 2 */}
                    <div className="text-center">
                        <span className="block text-4xl font-bold text-[#8B5CF6] mb-0">{enProceso}</span>
                        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                            En Gestión
                        </span>
                    </div>

                    {/* Big Number 3 */}
                    <div className="text-center">
                        <span className="block text-4xl font-bold text-[#3B82F6] mb-0">{abiertos}</span>
                        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                            Pendientes
                        </span>
                    </div>

                    {/* Status List (Right Side) */}
                    <div className="bg-white/50 p-3 rounded-lg">
                        <h3 className="text-xs font-bold text-zinc-800 mb-2 uppercase tracking-wide text-center lg:text-left">
                            Estado de gestión
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-white border border-zinc-200 px-3 py-1 rounded">
                                <span className="text-xs font-medium text-zinc-700">Cerrada</span>
                                <span className="font-bold text-zinc-900 text-sm">{cerrados}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white border border-zinc-200 px-3 py-1 rounded">
                                <span className="text-xs font-medium text-zinc-700">En proceso</span>
                                <span className="font-bold text-zinc-900 text-sm">{enProceso}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white border border-zinc-200 px-3 py-1 rounded">
                                <span className="text-xs font-medium text-zinc-700">No iniciada</span>
                                <span className="font-bold text-zinc-900 text-sm">{abiertos}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros Funcionales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 items-end rounded-lg border border-zinc-100 shadow-sm">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500">Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="ID, Asunto, Solicitante..."
                            className="pl-9 h-10 bg-zinc-50"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500">Estado de gestión</label>
                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger className="h-10 bg-zinc-50">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                            <SelectItem value="Abierto">No iniciada</SelectItem>
                            <SelectItem value="En_Proceso">En proceso</SelectItem>
                            <SelectItem value="Cerrado">Cerrada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500">Tipo de solicitud</label>
                    <Select value={filterTipo} onValueChange={setFilterTipo}>
                        <SelectTrigger className="h-10 bg-zinc-50">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                            <SelectItem value="CONSULTA">Consulta</SelectItem>
                            <SelectItem value="SOPORTE_TECNICO">Soporte Técnico</SelectItem>
                            <SelectItem value="RECLAMO">Reclamo</SelectItem>
                            <SelectItem value="SOLICITUD_CAMBIO">Solicitud de Cambio</SelectItem>
                            <SelectItem value="INCIDENTE">Incidente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Placeholder for Department Filter */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500">Departamento</label>
                    <Select value={filterDept} onValueChange={setFilterDept} disabled>
                        <SelectTrigger className="h-10 bg-zinc-50 opacity-50 cursor-not-allowed">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabla de Tickets */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="font-semibold text-zinc-700">ID</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Asunto</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Solicitante</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Fecha</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Prioridad</TableHead>
                            <TableHead className="font-semibold text-zinc-700">Estado</TableHead>
                            <TableHead className="font-semibold text-zinc-700 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.idTicket} className="hover:bg-zinc-50">
                                    <TableCell>
                                        <Link
                                            className="text-[#E84922] font-semibold hover:underline"
                                            href={`/dashboard/${ticket.idTicket}`}
                                        >
                                            #{ticket.idTicket}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-medium text-zinc-800">
                                        {ticket.tipoSolicitud.replace(/_/g, " ")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{ticket.usuarioNombre}</span>
                                            <span className="text-xs text-zinc-500">
                                                {ticket.empresaNombre ?? "Persona Natural"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-600">{formatFecha(ticket.fechaSolicitud)}</TableCell>
                                    <TableCell>{prioridadView(ticket.prioridad)}</TableCell>
                                    <TableCell>{badgeEstado(ticket.estado)}</TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            className="text-sm font-medium text-[#E84922] hover:text-[#cf3d1f] hover:underline"
                                            href={`/dashboard/${ticket.idTicket}`}
                                        >
                                            Ver detalle
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    No se encontraron solicitudes con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
