import { DocumentosAPI, filtroVinculoDocumentos } from "@olula/lib/api/documentos.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ContextoGestorDocumentos, EstadoGestorDocumentos } from "./diseño.ts";

type ProcesarGestorDocumentos = ProcesarContexto<EstadoGestorDocumentos, ContextoGestorDocumentos>;

export const cargarDocumentos: ProcesarGestorDocumentos = async (contexto) => {
    try {
        const filtro = filtroVinculoDocumentos(
            contexto.configuracion.vinculoTipo,
            contexto.configuracion.vinculoId
        );

        const resultado = await DocumentosAPI.obtener(
            filtro,
            [],
            { limite: 50, pagina: 1 }
        );

        return {
            ...contexto,
            documentos: resultado.datos,
            archivosSeleccionados: [],
            cargando: false,
        };
    } catch (error) {
        console.error("cargarDocumentos - error", error);
        throw error;
    }
};

export const agregarArchivosSeleccionados: ProcesarGestorDocumentos = async (contexto, payload) => {
    const archivosNuevos = payload as File[];

    return {
        ...contexto,
        archivosSeleccionados: [...contexto.archivosSeleccionados, ...archivosNuevos],
    };
};

export const eliminarArchivoSeleccionado: ProcesarGestorDocumentos = async (contexto, payload) => {
    const indice = payload as number;

    return {
        ...contexto,
        archivosSeleccionados: contexto.archivosSeleccionados.filter((_, i) => i !== indice),
    };
};

/**
 * Descarga un Blob a través del navegador
 */
export const descargarDocumento = async (blob: Blob, nombreArchivo: string): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Abre un Blob en una nueva pestaña
 */
export const abrirDocumento = async (blob: Blob): Promise<void> => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

/**
 * Descarga y abre un Blob directamente
 */
export const descargarYAbrirDocumento = async (blob: Blob, nombreArchivo: string): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
};
