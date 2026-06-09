import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";
import { getIncidencias } from "../infraestructura.ts";
import { ContextoMaestroIncidencia, EstadoMaestroIncidencia } from "./diseño.ts";

export type ProcesarMaestroIncidencia = ProcesarContexto<
    EstadoMaestroIncidencia,
    ContextoMaestroIncidencia
>;

const conIncidencias =
    (fn: ProcesarListaActivaEntidades<Incidencia>) =>
        (ctx: ContextoMaestroIncidencia) => ({ ...ctx, incidencias: fn(ctx.incidencias) });

export const Incidencias = accionesListaActivaEntidades(conIncidencias);

export const recargarIncidencias: ProcesarMaestroIncidencia = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.recargar(contexto, resultado);
}

export const ampliarIncidencias: ProcesarMaestroIncidencia = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getIncidencias(criteria.filtro, criteria.orden, criteria.paginacion);

    return Incidencias.ampliar(contexto, resultado);
}
