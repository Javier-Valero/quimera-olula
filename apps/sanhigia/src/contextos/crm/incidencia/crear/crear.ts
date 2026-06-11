import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaIncidencia } from "./diseño.ts";

export const nuevaIncidenciaVacia: NuevaIncidencia = {
    descripcion: "",
    nombreCliente: "",
    prioridad: "Media",
    observaciones: "",
    estado: "Nueva",
    fecha: new Date(),
};

export const metaNuevaIncidencia: MetaModelo<NuevaIncidencia> = {
    campos: {
        descripcion: { requerido: true, validacion: (incidencia: NuevaIncidencia) => stringNoVacio(incidencia.descripcion) },
        nombreCliente: { requerido: true },
        fecha: { requerido: true, tipo: "fecha" },
        observaciones: { requerido: true, validacion: (incidencia: NuevaIncidencia) => stringNoVacio(incidencia.observaciones) },
        prioridad: { requerido: true },
        estado: { requerido: true, tipo: "selector" }
    },
};