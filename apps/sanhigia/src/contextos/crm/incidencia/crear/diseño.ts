import { EstadoIncidencia, PrioridadIncidencia, TipoIncidencia } from "../diseño.ts";

export type NuevaIncidencia = {
    descripcion: string;
    descripcionLarga: string;
    nombreCliente: string;
    tipoIncidencia?: TipoIncidencia;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    fecha: Date;
};