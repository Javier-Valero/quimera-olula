import { DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { Filtro } from "@olula/lib/diseño.ts";
import { ContextoGestorDocumentos, EstadoGestorDocumentos } from "./diseño.ts";

type ProcesarGestorDocumentos = ProcesarContexto<EstadoGestorDocumentos, ContextoGestorDocumentos>;

export const cargarDocumentos: ProcesarGestorDocumentos = async (contexto) => {
    try {
        // Agregar _id al vinculo_tipo para el filtro si no lo tiene
        const vinculo_tipo_filtro = contexto.configuracion.vinculo_tipo.endsWith("_id")
            ? contexto.configuracion.vinculo_tipo
            : `${contexto.configuracion.vinculo_tipo}_id`;

        const filtro: Filtro = [
            [vinculo_tipo_filtro, contexto.configuracion.vinculo_id]
        ];

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

export const seleccionarArchivos: ProcesarGestorDocumentos = async (contexto, payload) => {
    const archivos = payload as File[];

    return {
        ...contexto,
        archivosSeleccionados: archivos,
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
