import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Incidencia } from "../diseño.ts";
import { getIncidencia, patchIncidencia } from "../infraestructura.ts";
import { ContextoDetalleIncidencia, EstadoDetalleIncidencia } from "./diseño.ts";

/**
 * Tipo para handlers del detalle
 */
type ProcesarDetalle = ProcesarContexto<EstadoDetalleIncidencia, ContextoDetalleIncidencia>;

/**
 * Alias de pipe para este contexto.
 * Permite encadenar procesadores de forma legible:
 *
 *   return pipeIncidencia(contexto, [
 *       refrescarIncidencia,
 *       'ABIERTO',
 *   ]);
 */
const pipeIncidencia = ejecutarListaProcesos<EstadoDetalleIncidencia, ContextoDetalleIncidencia>;

/**
 * Metadatos del formulario: validaciones y configuración de campos.
 *
 * Opciones de campo:
 *   - requerido: true|false
 *   - minimo / maximo: longitud mínima/máxima
 *   - tipo: "fecha" | "moneda" | ...
 *
 * Opciones de modelo:
 *   - editable: (incidencia) => boolean  → deshabilita todos los campos si devuelve false
 *   - onChange: (incidencia, campo, valor, otros?) => incidencia  → side-effects entre campos
 */
export const metaIncidencia: MetaModelo<Incidencia> = {
    campos: {
        descripcion: { requerido: true, minimo: 5 },
        descripcionLarga: { requerido: false },
        nombreCliente: { requerido: true, minimo: 3 },
        fecha: { requerido: true, tipo: 'fecha' },
        prioridad: { requerido: true },
        estado: { requerido: true },
        clienteId: { requerido: false },
        articuloId: { requerido: false },
        enGarantia: { requerido: false },
        resolucion: { requerido: false },
    },
    editable: (incidencia: Incidencia) => incidencia.estado !== 'Rechazada' && incidencia.estado !== 'Cerrada',
};

/**
 * Incidencia vacía para inicialización
 */
export const incidenciaVacia = (): Incidencia => ({
    id: '',
    fecha: new Date(),
    descripcion: '',
    descripcionLarga: null,
    prioridad: 'Media',
    estado: 'Nueva',
    clienteId: null,
    nombreCliente: '',
    articuloId: null,
    descripcionReferencia: null,
    presupuestoId: null,
    codigoPresupuesto: null,
    familiaId: null,
    agenteId: null,
    enGarantia: false,
    tipoIncidencia: null,
    proveedorId: null,
    transportistaId: null,
    resolucion: null,
});

/**
 * Refresca la incidencia desde la API.
 *
 * Patrón: después de una operación que modifica la entidad en el servidor,
 * volver a cargarla para tener el estado actualizado.
 * También emite el evento "incidencia_cambiada" hacia el maestro para sincronizar la lista.
 */
export const refrescarIncidencia: ProcesarDetalle = async (contexto) => {
    const incidencia = await getIncidencia(contexto.incidencia.id);
    return [
        { ...contexto, incidencia },
        [["incidencia_cambiada", incidencia]],  // propaga al maestro
    ];
};

/**
 * Guarda cambios en la API.
 * Se llama desde el auto-guardado de useModelo (ver DetalleIncidencia.tsx).
 */
export const guardarIncidencia = async (
    contexto: ContextoDetalleIncidencia,
    incidencia: Incidencia
): Promise<void> => {
    // Solo actualizar si hay cambios
    if (JSON.stringify(incidencia) !== JSON.stringify(contexto.incidencia)) {
        await patchIncidencia(incidencia.id, incidencia);
    }
};

/**
 * Carga la incidencia desde la API y la activa.
 * Se invoca cuando cambia el ID recibido por prop.
 */
export const cargarIncidencia: (_: string) => ProcesarDetalle =
    (idIncidencia) => async (contexto) => {
        const incidencia = await getIncidencia(idIncidencia);
        return pipeIncidencia(contexto, [
            async (ctx) => ({ ...ctx, incidencia }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idIncidencia = payload as string;
    if (idIncidencia) {
        return cargarIncidencia(idIncidencia)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', incidencia: incidenciaVacia() };
};
