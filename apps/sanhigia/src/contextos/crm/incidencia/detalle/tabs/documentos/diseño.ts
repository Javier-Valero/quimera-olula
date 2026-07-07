import { Entidad, Paginacion } from "@olula/lib/diseño.ts";

export interface Documento extends Entidad {
    id: string;
    nombre: string;
    incidenciaId: string;
    urlDescarga: string;
    fechaSubida: string;
    agenteId: string;
    tipo: string;
    tamaño: number;
    versionId?: string;
    codigo?: string;
}

export type GetDocumentos = (
    incidenciaId: string,
    paginacion?: Paginacion
) => Promise<{ datos: Documento[]; total: number }>;

export type PostDocumento = (
    documento: Partial<Documento>,
    incidenciaId: string,
    archivo: File
) => Promise<string>;

export type DescargarDocumento = (codigo: string) => Promise<Blob>;
