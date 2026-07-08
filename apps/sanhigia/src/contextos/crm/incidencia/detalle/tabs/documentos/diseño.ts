import { Entidad, Paginacion } from "@olula/lib/diseño.ts";

export interface Documento extends Entidad {
    id: string;
    nombre: string;
    incidenciaId: string;
    codigo: string;
    fechaSubida: string;
    horaSubida: string;
    versionActualId: string;
}

export type GetDocumentos = (
    incidenciaId: string,
    paginacion?: Paginacion
) => Promise<{ datos: Documento[]; total: number }>;

export type PostDocumento = (documento: FormData) => Promise<string>;
