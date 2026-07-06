import { Entidad, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export interface Tarea extends Entidad {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    tipo: string;
    completada: boolean;
    agente_id?: string | null;
    nota?: string | null;
    trato_id?: string | null;
    incidencia_id?: string | null;
    id_tarea_google?: string | null;
    fecha_fin?: string | null;
    hora_fin?: string | null;
    latitud_fin?: string | null;
    longitud_fin?: string | null;
}

export type GetTareas = (
    incidenciaId: string,
    paginacion?: Paginacion
) => RespuestaLista<Tarea>;
