import { ProcesarContexto } from "@olula/lib/diseño.js";
import { descargarDocumentoAPI, getDocumentos } from "../../../../infraestructura.ts";
import { ContextoDocumentos, EstadoDocumentos } from "./diseño.ts";

type ProcesarDocumentos = ProcesarContexto<EstadoDocumentos, ContextoDocumentos>;

export const cargarDocumentos: ProcesarDocumentos = async (contexto, payload) => {
    const incidenciaId = (payload as string) || contexto.incidenciaId;

    try {
        const resultado = await getDocumentos(incidenciaId, { limite: 50, pagina: 1 });

        return {
            ...contexto,
            documentos: resultado.datos,
            incidenciaId,
            archivosSeleccionados: [],
        };
    } catch (error) {
        console.error("cargarDocumentos - error", error);
        throw error;
    }
};

export const seleccionarArchivos: ProcesarDocumentos = async (contexto, payload) => {
    const archivos = payload as File[];

    return {
        ...contexto,
        archivosSeleccionados: archivos,
    };
};

// Para solo descargar
export const descargarDocumento = async (documentoId: string, nombreArchivo: string): Promise<void> => {
    const blob = await descargarDocumentoAPI(documentoId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Para visualizar en nueva pestaña
export const abrirDocumento = async (documentoId: string): Promise<void> => {
    const blob = await descargarDocumentoAPI(documentoId);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

// Para descargar y abrir directamente
export const descargarYAbrirDocumento = async (documentoId: string, nombreArchivo: string): Promise<void> => {
    const blob = await descargarDocumentoAPI(documentoId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
};
