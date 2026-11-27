import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import {
    CambiosLote,
    DeleteLote,
    GetLote,
    GetLotes,
    Lote,
    NuevoLote,
    OpcionesEtiquetaLote,
    PatchLote,
    PostLote,
    RevisarLote,
    RevisarLotes,
} from "./diseño.ts";
import { queryEtiquetaLote } from "./dominio.ts";

const baseUrl = `/almacen/lote`;

/** Lote de la API. Sin el plugin `produccion`, de `estado` en adelante todo es `null`. */
export interface LoteApi {
    id: string;
    sku: string | null;
    articulo?: string | null;
    caducidad: string | null;
    en_almacen?: number | string | null;
    estado?: string | null;
    cantidad_programada?: number | string | null;
    cantidad_lote?: number | string | null;
    cantidad_total?: number | string | null;
    cantidad_usada?: number | string | null;
    cantidad_reservada?: number | string | null;
    cantidad_por_recibir?: number | string | null;
    cantidad_disponible?: number | string | null;
    orden_id?: string | null;
    fecha_fabricacion?: string | null;
    cliente_id?: string | null;
    cliente?: string | null;
    /** Solo con el plugin de trazabilidad de lascunas. */
    almacen_id?: string | null;
    fecha_disponible?: string | null;
}

interface NuevoLoteApi {
    id: string;
    articulo_id: string;
    caducidad: string | null;
    almacen_id?: string;
    fecha_disponible?: string;
}

/** Solo las claves presentes se cambian; `null` quita el valor. */
type CambiosLoteApi = {
    caducidad?: string | null;
    almacen_id?: string | null;
    fecha_disponible?: string | null;
};

const numero = (valor: number | string | null | undefined): number => Number(valor ?? 0) || 0;
const texto = (valor: string | number | null | undefined): string =>
    valor === null || valor === undefined ? "" : String(valor);
const fecha = (valor: string | null | undefined): string => texto(valor).slice(0, 10);

export const loteDesdeApi = (api: LoteApi): Lote => ({
    id: api.id,
    sku: texto(api.sku),
    articulo: texto(api.articulo),
    caducidad: fecha(api.caducidad),
    enAlmacen: numero(api.en_almacen),
    // El plugin `produccion` siempre da el estado (la columna es NOT NULL): sin él, no hay ficha.
    produccion: api.estado === null || api.estado === undefined
        ? null
        : {
            estado: api.estado,
            cantidadProgramada: numero(api.cantidad_programada),
            cantidadLote: numero(api.cantidad_lote),
            cantidadTotal: numero(api.cantidad_total),
            cantidadUsada: numero(api.cantidad_usada),
            cantidadReservada: numero(api.cantidad_reservada),
            cantidadPorRecibir: numero(api.cantidad_por_recibir),
            cantidadDisponible: numero(api.cantidad_disponible),
            ordenId: texto(api.orden_id),
            fechaFabricacion: fecha(api.fecha_fabricacion),
            clienteId: texto(api.cliente_id),
            cliente: texto(api.cliente),
        },
    almacenId: texto(api.almacen_id),
    fechaDisponible: fecha(api.fecha_disponible),
});

/** Texto vacío a `null`: así la API quita el valor. */
const textoONulo = (valor: string): string | null => (valor.trim() === "" ? null : valor.trim());

export const nuevoLoteAApi = (nuevo: NuevoLote): NuevoLoteApi => ({
    id: nuevo.id.trim(),
    articulo_id: nuevo.sku,
    caducidad: textoONulo(nuevo.caducidad),
    ...(nuevo.almacenId ? { almacen_id: nuevo.almacenId } : {}),
    ...(nuevo.fechaDisponible ? { fecha_disponible: nuevo.fechaDisponible } : {}),
});

export const cambiosLoteAApi = (cambios: CambiosLote): CambiosLoteApi => {
    const api: CambiosLoteApi = {};
    if (cambios.caducidad !== undefined) api.caducidad = textoONulo(cambios.caducidad);
    if (cambios.almacenId !== undefined) api.almacen_id = textoONulo(cambios.almacenId);
    if (cambios.fechaDisponible !== undefined) api.fecha_disponible = textoONulo(cambios.fechaDisponible);
    return api;
};

const url = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export const getLote: GetLote = async (id) => RestAPI.getItem<Lote, LoteApi>(url(id), loteDesdeApi);

export const getLotes: GetLotes = async (criteria: Criteria) =>
    RestAPI.getQuery<Lote, LoteApi>(baseUrl, criteria, loteDesdeApi);

export const postLote: PostLote = async (nuevo) => {
    const respuesta = await RestAPI.post<NuevoLoteApi>(baseUrl, nuevoLoteAApi(nuevo), "Error al crear el lote");
    return respuesta.id;
};

export const patchLote: PatchLote = async (id, cambios) => {
    await RestAPI.patch<CambiosLoteApi>(url(id), cambiosLoteAApi(cambios), "Error al guardar el lote");
};

export const deleteLote: DeleteLote = async (id) => {
    await RestAPI.delete(url(id), "Error al borrar el lote");
};

export const revisadosDesdeApi = (respuesta: { revisados?: number | string | null } | null | undefined): number =>
    numero(respuesta?.revisados);

export const revisarLote: RevisarLote = async (id) =>
    revisadosDesdeApi(await RestAPI.query<object, { revisados: number }>(`${url(id)}/revisar`, {}, "Error al revisar el lote"));

export const revisarLotes: RevisarLotes = async () =>
    revisadosDesdeApi(await RestAPI.query<object, { revisados: number }>(`${baseUrl}/revisar`, {}, "Error al revisar los lotes"));

/** Etiquetas del lote (PDF, una página por copia; regla `almacen.lote`). */
export const urlEtiquetaLote = (id: string, opciones: OpcionesEtiquetaLote): string =>
    `${url(id)}/etiqueta?${queryEtiquetaLote(opciones)}`;

export const getEtiquetaLote = async (id: string, opciones: OpcionesEtiquetaLote): Promise<Blob> =>
    RestAPI.blob(urlEtiquetaLote(id, opciones), "Error al imprimir las etiquetas del lote");
