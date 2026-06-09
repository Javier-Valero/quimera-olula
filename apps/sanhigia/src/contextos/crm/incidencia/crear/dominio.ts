import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaIncidencia } from "../diseño.ts";

export const nuevaIncidenciaVacia: NuevaIncidencia = {
    fecha: new Date(),
    descripcion: "",
    prioridad: "Media",
    estado: "Nueva",
    nombreCliente: "",
    tipoIncidencia: undefined,
    descripcionLarga: "",
    clienteId: null,
}

export const metaNuevaIncidencia: MetaModelo<NuevaIncidencia> = {
    campos: {
        descripcion: { requerido: true, minimo: 5 },
        clienteId: { requerido: true },
        tipoIncidencia: { requerido: true },
        descripcionLarga: { requerido: true },
    }
};
