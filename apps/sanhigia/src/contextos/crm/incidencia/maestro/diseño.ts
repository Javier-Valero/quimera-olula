import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";

/**
 * Estados posibles del maestro
 */
export type EstadoMaestroIncidencia = 'INICIAL';

/**
 * Contexto del maestro (listado de incidencias)
 *
 * Usa ListaActivaEntidades (no ListaEntidades) para soportar:
 *   - paginación incremental (ampliar)
 *   - cambio de criteria (filtrar)
 *   - activo: string | undefined  → solo guarda el ID, no la entidad
 *   - criteria: Criteria           → guarda filtros/orden/paginación actuales
 */
export type ContextoMaestroIncidencia = {
    estado: EstadoMaestroIncidencia;
    incidencias: ListaActivaEntidades<Incidencia>;
};

/**
 * Metadatos para renderizar la tabla.
 *
 * Opciones de columna:
 *   - Sin nada extra     → renderiza el valor tal cual
 *   - tipo: "fecha"      → formatea como fecha
 *   - tipo: "moneda"     → formatea como moneda con divisa
 *   - render: (i) => ... → render personalizado; si usa JSX mover metaTabla a un .tsx
 */
export const metaTablaIncidencia: MetaTabla<Incidencia> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'fecha', cabecera: 'Fecha', tipo: 'fecha' },
    { id: 'descripcion', cabecera: 'Descripción' },
    { id: 'nombreCliente', cabecera: 'Cliente' },
    {
        id: 'prioridad',
        cabecera: 'Prioridad',
        render: (i: Incidencia) => i.prioridad,
    },
    {
        id: 'estado',
        cabecera: 'Estado',
        render: (i: Incidencia) => i.estado,
    },
];
