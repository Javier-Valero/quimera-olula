import { Contexto } from "@olula/lib/diseño.ts";
import { Documento } from "../diseño.ts";

export type EstadoDocumentos = "lista" | "archivos-seleccionados" | "subiendo";

export type ContextoDocumentos = Contexto<EstadoDocumentos> & {
    documentos: Documento[];
    cargando: boolean;
    incidenciaId: string;
    archivosSeleccionados: File[];
};
