import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaIncidencia } from "./diseño.ts";

export const nuevaIncidenciaVacia: NuevaIncidencia = {
    descripcion: "",
    clienteId: "",
    nombreCliente: "",
    prioridad: "Media",
    observaciones: "",
    estado: "Nueva",
    fecha: new Date(),
    facturaId: "",
    articuloId: "",
};

export const metaNuevaIncidencia: MetaModelo<NuevaIncidencia> = {
    campos: {
        descripcion: { requerido: true, validacion: (incidencia: NuevaIncidencia) => stringNoVacio(incidencia.descripcion) },
        // clienteId: { requerido: true },
        nombreCliente: { requerido: true },
        fecha: { requerido: true, tipo: "fecha" },
        observaciones: { requerido: true, validacion: (incidencia: NuevaIncidencia) => stringNoVacio(incidencia.observaciones) },
        prioridad: { requerido: true },
        estado: { requerido: true, tipo: "selector" }
    },
};