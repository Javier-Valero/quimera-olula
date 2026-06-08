import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia, NuevaIncidencia } from "../diseño.ts";
import { getIncidencia, getIncidencias, postIncidencia } from "../infraestructura.ts";
import { ContextoMaestroIncidencia, EstadoMaestroIncidencia } from "./diseño.ts";

/**
 * Tipo para todos los handlers del maestro
 */
type ProcesarMaestro = ProcesarContexto<EstadoMaestroIncidencia, ContextoMaestroIncidencia>;

/**
 * Patrón: usar accionesListaActivaEntidades para reducir código.
 * Genera automáticamente: cambiar, activar, desactivar, incluir, quitar,
 * recargar, ampliar (paginación incremental), filtrar (cambio de criteria).
 */
const conIncidencias = (fn: ProcesarListaActivaEntidades<Incidencia>) =>
    (ctx: ContextoMaestroIncidencia) => ({ ...ctx, incidencias: fn(ctx.incidencias) });

export const Incidencias = accionesListaActivaEntidades(conIncidencias);

/**
 * Recargar lista desde API (reemplaza la lista entera)
 */
export const recargarIncidencias: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);
    return Incidencias.recargar(contexto, resultado);
};

/**
 * Ampliar lista (paginación incremental: añade elementos a los existentes)
 * Se usa con el evento "siguiente_pagina"
 */
export const ampliarIncidencias: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);
    return Incidencias.ampliar(contexto, resultado);
};

/**
 * Crear nueva incidencia y activarla inmediatamente
 */
export const crearIncidenciaProceso: ProcesarMaestro = async (contexto, payload) => {
    const nuevaIncidencia = payload as NuevaIncidencia;
    const idIncidencia = await postIncidencia(nuevaIncidencia);
    const incidencia = await getIncidencia(idIncidencia);
    const resultado = await Incidencias.incluir(contexto, incidencia);

    // Extraer contexto de la tupla [contexto, eventos] si es necesario
    const contextoActualizado = Array.isArray(resultado) ? resultado[0] : resultado;

    return {
        ...contextoActualizado,
        incidencias: {
            ...contextoActualizado.incidencias,
            activo: incidencia.id,  // activo es el ID (string), no la entidad
        },
    };
};
