import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaIncidencia } from "./diseño.ts";

export const nuevaIncidenciaVacia: NuevaIncidencia = {
    descripcion: "",
    nombreCliente: "",
    prioridad: "Media",
    descripcionLarga: "",
    estado: "Nueva",
    fecha: new Date(),
};

export const metaNuevaIncidencia: MetaModelo<NuevaIncidencia> = {
    campos: {
        descripcion: { requerido: true, validacion: (incidencia: NuevaIncidencia) => stringNoVacio(incidencia.descripcion) },
        nombreCliente: { requerido: true },
        fecha: { requerido: true, tipo: "fecha" },
        descripcionLarga: { requerido: false },
        prioridad: { requerido: true },
        estado: { requerido: true, tipo: "selector" }
    },
};