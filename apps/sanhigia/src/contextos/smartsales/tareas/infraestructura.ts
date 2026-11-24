import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Pagina, Tarea } from "../comun/diseño.ts";
import { FiltroTareasRango, TareaAPI } from "./diseño.ts";

const baseUrl = "ss_tareas";

const campos = [
    "idtarea",
    "titulo",
    "fecha",
    "hora",
    "tipo",
    "completada",
    "encurso",
    "nombrecliente",
    "nombrecontactotrato",
    "codcliente",
    "codclienteincidencia",
];

export const tareaDesdeAPI = (tarea: TareaAPI): Tarea => ({
    id: String(tarea.idtarea),
    titulo: tarea.titulo,
    fecha: tarea.fecha.slice(0, 10),
    hora: tarea.hora,
    tipo: tarea.tipo,
    completada: tarea.completada,
    enCurso: !!tarea.encurso,
    nombreCliente: tarea.nombrecliente,
    nombreContacto: tarea.nombrecontactotrato,
    codCliente: tarea.codcliente ?? tarea.codclienteincidencia ?? null,
});

const filtroAgente = (agente: string | null) => (agente ? { and: [["codagente", "eq", agente]] } : undefined);

// Sin página, el backend devuelve hasta LIMITE_RANGO tareas ordenadas por fecha (Agenda).
export const LIMITE_RANGO = 800;

const extraRango = ({ desde, hasta, conAtrasadas = false, atrasadasDesde }: FiltroTareasRango) => ({
    desde,
    hasta,
    conAtrasadas,
    atrasadasDesde,
});

export const getTareasRango = async (filtro: FiltroTareasRango) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            action: "get_for_rango",
            staticAction: true,
            params: {
                filter: filtroAgente(filtro.agente),
                fields: campos,
                extra: extraRango(filtro),
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};

// Una página de tareas del rango, de la más reciente a la más antigua.
export const getPaginaTareasRango = async (filtro: FiltroTareasRango, limite: number, siguiente: unknown | null): Promise<Pagina<Tarea>> => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[]; page?: { next: unknown | null } }>(
        legacyUrl(baseUrl, {
            action: "get_for_rango",
            staticAction: true,
            params: {
                filter: filtroAgente(filtro.agente),
                fields: campos,
                order: { field: "fecha", direction: "DESC" },
                page: siguiente ? { limit: limite, next: siguiente } : { limit: limite },
                extra: extraRango(filtro),
            },
        })
    );

    return { elementos: respuesta.data.map(tareaDesdeAPI), siguiente: respuesta.page?.next ?? null };
};

export const contarTareasRango = async (filtro: FiltroTareasRango): Promise<number> => {
    const respuesta = await LegacyAPI.get<{ data: { total: number } }>(
        legacyUrl(baseUrl, {
            action: "contar_tareas_rango",
            staticAction: true,
            params: { filter: filtroAgente(filtro.agente), extra: extraRango(filtro) },
        })
    );

    return Number(respuesta.data.total) || 0;
};

export const getTareasCompletadas = async (agente: string | null, limite = 30) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            params: {
                filter: { and: [["completada", "eq", true], ...(agente ? [["codagente", "eq", agente]] : [])] },
                fields: campos,
                order: { field: "fecha", direction: "DESC" },
                page: { limit: limite },
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};

export const getTareasTrato = async (idTrato: string) => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl(baseUrl, {
            params: {
                filter: { and: [["idtrato", "eq", Number(idTrato)]] },
                fields: campos,
                order: { field: "fecha", direction: "ASC" },
                page: { limit: 100 },
            },
        })
    );

    return respuesta.data.map(tareaDesdeAPI);
};
