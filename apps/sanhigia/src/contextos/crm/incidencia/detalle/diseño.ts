import { Incidencia } from "../diseño.ts";

/**
 * Estados posibles en la vista de detalle.
 *
 * Patrón de estados: el detalle puede tener sub-estados para operaciones
 * que abren modales (BORRANDO, CAMBIANDO_X, etc.).
 * En ese caso el estado principal (ABIERTO) se bifurca según datos de la entidad.
 */
export type EstadoDetalleIncidencia =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

/**
 * Contexto del detalle (edición de una incidencia)
 *
 * Nota: no se guarda la incidencia inicial separado.
 * El auto-guardado de useModelo se encarga de persistir en API al cambiar.
 */
export type ContextoDetalleIncidencia = {
    estado: EstadoDetalleIncidencia;
    incidencia: Incidencia;
};
