import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { Incidencia, IncidenciaAPI, NuevaIncidencia } from "./diseño.ts";

const baseUrl = new ApiUrls().INCIDENCIA;

/**
 * Mapea respuesta de API (snake_case) a interfaz del dominio (camelCase)
 * Convierte tipos del API a tipos del dominio (ej: string a Date)
 */
const incidenciaFromAPI = (api: IncidenciaAPI): Incidencia => ({
    id: api.id,
    fecha: new Date(Date.parse(api.fecha)),
    descripcion: api.descripcion,
    descripcionLarga: api.descripcionlarga || null,
    prioridad: api.prioridad,
    estado: api.estado,
    clienteId: api.cliente_id || null,
    nombreCliente: api.nombre_cliente,
    articuloId: api.articulo_id || null,
    descripcionReferencia: api.descripcion_referencia || null,
    presupuestoId: api.presupuesto_id || null,
    codigoPresupuesto: api.codigo_presupuesto || null,
    familiaId: api.familia_id || null,
    agenteId: api.agente_id || null,
    enGarantia: api.en_garantia,
    tipoIncidencia: api.tipo_incidencia || null,
    proveedorId: api.proveedor_id || null,
    transportistaId: api.transportista_id || null,
    resolucion: api.resolucion || null,
});

/**
 * Mapea dominio (camelCase) a API (snake_case)
 * Convierte tipos del dominio a tipos que entiende el backend
 */
export const incidenciaToAPI = (m: Incidencia): IncidenciaAPI => ({
    id: m.id,
    fecha: m.fecha.toISOString().split('T')[0],
    descripcion: m.descripcion,
    descripcionlarga: m.descripcionLarga || undefined,
    prioridad: m.prioridad,
    estado: m.estado,
    cliente_id: m.clienteId || undefined,
    nombre_cliente: m.nombreCliente,
    articulo_id: m.articuloId || undefined,
    descripcion_referencia: m.descripcionReferencia || undefined,
    presupuesto_id: m.presupuestoId || undefined,
    codigo_presupuesto: m.codigoPresupuesto || undefined,
    familia_id: m.familiaId || undefined,
    agente_id: m.agenteId || undefined,
    en_garantia: m.enGarantia,
    tipo_incidencia: m.tipoIncidencia || undefined,
    proveedor_id: m.proveedorId || undefined,
    transportista_id: m.transportistaId || undefined,
    resolucion: m.resolucion || undefined,
});

const nuevaIncidenciaToAPI = (m: NuevaIncidencia): Omit<IncidenciaAPI, "id"> => ({
    fecha: m.fecha.toISOString().split('T')[0],
    descripcion: m.descripcion,
    prioridad: m.prioridad,
    estado: m.estado,
    nombre_cliente: m.nombreCliente,
    cliente_id: m.clienteId || undefined,
    en_garantia: false,
});

const patchIncidenciaToAPI = (m: Partial<Incidencia>): Partial<IncidenciaAPI> => {
    const result: Partial<IncidenciaAPI> = {};
    if (m.fecha) result.fecha = m.fecha.toISOString().split('T')[0];
    if (m.descripcion) result.descripcion = m.descripcion;
    if (m.descripcionLarga !== undefined) result.descripcionlarga = m.descripcionLarga;
    if (m.prioridad) result.prioridad = m.prioridad;
    if (m.estado) result.estado = m.estado;
    if (m.clienteId !== undefined) result.cliente_id = m.clienteId;
    if (m.nombreCliente) result.nombre_cliente = m.nombreCliente;
    if (m.articuloId !== undefined) result.articulo_id = m.articuloId;
    if (m.descripcionReferencia !== undefined) result.descripcion_referencia = m.descripcionReferencia;
    if (m.presupuestoId !== undefined) result.presupuesto_id = m.presupuestoId;
    if (m.codigoPresupuesto !== undefined) result.codigo_presupuesto = m.codigoPresupuesto;
    if (m.familiaId !== undefined) result.familia_id = m.familiaId;
    if (m.agenteId !== undefined) result.agente_id = m.agenteId;
    if (m.enGarantia !== undefined) result.en_garantia = m.enGarantia;
    if (m.tipoIncidencia !== undefined) result.tipo_incidencia = m.tipoIncidencia;
    if (m.proveedorId !== undefined) result.proveedor_id = m.proveedorId;
    if (m.transportistaId !== undefined) result.transportista_id = m.transportistaId;
    if (m.resolucion !== undefined) result.resolucion = m.resolucion;
    return result;
};

/**
 * Obtener una incidencia por ID
 */
export const getIncidencia = async (id: string): Promise<Incidencia> =>
    RestAPI.get<{ datos: IncidenciaAPI }>(`${baseUrl}/${id}`, "Error al obtener incidencia").then((respuesta) => {
        return incidenciaFromAPI(respuesta.datos);
    });

/**
 * Obtener lista de incidencias con filtros
 */
export const getIncidencias = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): Promise<RespuestaLista<Incidencia>> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: IncidenciaAPI[]; total: number }>(
        `${baseUrl}${q}`,
        "Error al obtener incidencias"
    );
    return {
        datos: respuesta.datos.map(incidenciaFromAPI),
        total: respuesta.total,
    };
};

/**
 * Crear nueva incidencia
 */
export const postIncidencia = async (incidencia: NuevaIncidencia): Promise<string> =>
    RestAPI.post<ReturnType<typeof nuevaIncidenciaToAPI>>(
        `${baseUrl}`,
        nuevaIncidenciaToAPI(incidencia),
        "Error al crear incidencia"
    ).then((respuesta) => {
        return respuesta.id;
    });

/**
 * Actualizar incidencia existente
 */
export const patchIncidencia = async (id: string, incidencia: Partial<Incidencia>): Promise<void> => {
    await RestAPI.patch<ReturnType<typeof patchIncidenciaToAPI>>(
        `${baseUrl}/${id}`,
        patchIncidenciaToAPI(incidencia),
        "Error al actualizar incidencia"
    );
};

/**
 * Eliminar incidencia
 */
export const deleteIncidencia = async (id: string): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al eliminar incidencia");
};
