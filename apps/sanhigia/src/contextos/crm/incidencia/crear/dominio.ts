import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaIncidencia } from "../diseño.ts";

/**
 * Metadatos para formulario de creación de incidencia
 */
export const metaNuevaIncidencia: MetaModelo<NuevaIncidencia> = {
    campos: {
        descripcion: { requerido: true, minimo: 5 },
        nombreCliente: { requerido: true, minimo: 3 },
        fecha: { requerido: true },
        prioridad: { requerido: true },
        estado: { requerido: true },
        clienteId: { requerido: false },
    },
};

/**
 * Valor inicial vacío para nueva incidencia
 */
export const nuevaIncidenciaVacia = (): NuevaIncidencia => ({
    descripcion: '',
    nombreCliente: '',
    fecha: new Date(),
    prioridad: 'Media',
    estado: 'Nueva',
    clienteId: null,
});
