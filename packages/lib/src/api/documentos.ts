import { Filtro, Orden, Paginacion } from "../diseño.ts";
import { criteriaQuery } from "../infraestructura.ts";
import { RestAPI } from "./rest_api.ts";

const DOCUMENTAL_BASE_URL = "/documental/documento";

/**
 * Interfaz genérica para documentos
 */
export interface DocumentoGenerico {
    id: string;
    nombre: string;
    fechaSubida: string;
    horaSubida: string;
    versionActualId: string | null;
    [key: string]: unknown;
}

/**
 * Transforma dato del backend, convirtiendo "None" string a null
 */
const transformarDocumento = (doc: unknown): DocumentoGenerico => {
    const data = doc as Record<string, unknown>;
    return {
        id: String(data.id || ""),
        nombre: String(data.nombre || ""),
        fechaSubida: String(data.fechaSubida || data.fecha_creacion || ""),
        horaSubida: String(data.horaSubida || data.hora_creacion || ""),
        versionActualId:
            data.versionActualId === "None" ||
                data.versionActualId === null ||
                data.versionActualId === undefined ||
                data.version_actual_id === "None" ||
                data.version_actual_id === null ||
                data.version_actual_id === undefined
                ? null
                : String(data.versionActualId || data.version_actual_id || ""),
        ...data,
    };
};

/**
 * API para documentos de la API de documentos (genérico para todas las aplicaciones)
 */
export const DocumentosAPI = {
    /**
     * Obtiene documentos relacionados con un objeto específico
     * @param filtro Filtro con pares [campo, valor]
     * @param orden Orden de resultados
     * @param paginacion Configuración de paginación
     */
    async obtener(
        filtro: Filtro,
        orden: Orden = [],
        paginacion: Paginacion = { limite: 50, pagina: 1 }
    ): Promise<{ datos: DocumentoGenerico[]; total: number }> {
        const q = criteriaQuery(filtro, orden, paginacion);

        const respuesta = await RestAPI.get<{ datos: unknown[]; total: number }>(
            DOCUMENTAL_BASE_URL + q
        );
        return {
            datos: respuesta.datos.map(transformarDocumento),
            total: respuesta.total,
        };
    },

    /**
     * Sube un nuevo documento
     * @param formData FormData con los campos del documento
     */
    async crear(formData: FormData): Promise<string> {
        const respuesta = await RestAPI.post(
            DOCUMENTAL_BASE_URL,
            formData,
            "Error al guardar documento"
        );
        return (respuesta as { id: string }).id;
    },

    /**
     * Descarga un documento
     * @param documentoId ID del documento a descargar
     */
    async descargar(documentoId: string): Promise<Blob> {
        return await RestAPI.blob(`${DOCUMENTAL_BASE_URL}/${documentoId}/descargar`);
    },

    /**
     * Elimina un documento
     * @param documentoId ID del documento a eliminar
     */
    async eliminar(documentoId: string): Promise<void> {
        await RestAPI.delete(`${DOCUMENTAL_BASE_URL}/${documentoId}`, "Error al borrar documento");
    },
};
