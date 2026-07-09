import { Filtro, Orden, Paginacion } from "../diseño.ts";
import { criteriaQuery } from "../infraestructura.ts";
import { RestAPI } from "./rest_api.ts";

const DOCUMENTAL_BASE_URL = "/documental/carpeta";

export interface CarpetaGenerico {
    id: string;
    nombre: string;
    carpeta_padre_id: string | null;
    creado_por: string;
    fecha_alta: string;
    hora_alta: string;
}

export interface SubCarpeta {
    id: string;
    nombre: string;
    cantidad_subcarpetas: number;
    cantidad_documentos: number;
}

export interface CarpetaContenido {
    id: string;
    nombre: string;
    carpeta_padre_id: string | null;
    subcarpetas: SubCarpeta[];
    cantidad_documentos: number;
}

/**
 * API para carpetas documentales
 */
export const CarpetasAPI = {
    /**
     * Obtiene una carpeta específica con su estructura jerárquica
     */
    async obtener(carpeta_id: string): Promise<CarpetaContenido> {
        const respuesta = await RestAPI.get<CarpetaContenido>(
            `${DOCUMENTAL_BASE_URL}/${carpeta_id}`
        );
        return respuesta;
    },

    /**
     * Lista carpetas con criterios
     * @param filtro Filtro con pares [campo, valor]
     * @param orden Orden de resultados
     * @param paginacion Configuración de paginación
     */
    async listar(
        filtro: Filtro = [],
        orden: Orden = [],
        paginacion: Paginacion = { limite: 50, pagina: 1 }
    ): Promise<{ datos: SubCarpeta[]; total: number }> {
        const q = criteriaQuery(filtro, orden, paginacion);
        const respuesta = await RestAPI.get<{ datos: SubCarpeta[]; total: number }>(
            DOCUMENTAL_BASE_URL + q
        );
        return respuesta;
    },

    /**
     * Crea una nueva carpeta
     */
    async crear(nombre: string, carpeta_padre_id?: string | null): Promise<string> {
        const formData = new FormData();
        formData.append("nombre", nombre);
        if (carpeta_padre_id) {
            formData.append("carpeta_padre_id", carpeta_padre_id);
        }

        const respuesta = await RestAPI.post(
            DOCUMENTAL_BASE_URL,
            formData,
            "Error al crear carpeta"
        );
        return (respuesta as { id: string }).id;
    },

    /**
     * Cambia el nombre de una carpeta
     */
    async cambiarNombre(carpeta_id: string, nombre: string): Promise<void> {
        const formData = new FormData();
        formData.append("nombre", nombre);

        await RestAPI.patch(
            `${DOCUMENTAL_BASE_URL}/${carpeta_id}`,
            formData,
            "Error al cambiar nombre de carpeta"
        );
    },

    /**
     * Borra una carpeta
     */
    async borrar(carpeta_id: string): Promise<void> {
        await RestAPI.delete(
            `${DOCUMENTAL_BASE_URL}/${carpeta_id}`,
            "Error al borrar carpeta"
        );
    },
};
