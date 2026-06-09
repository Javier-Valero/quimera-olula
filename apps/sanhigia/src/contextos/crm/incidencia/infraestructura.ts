import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { Incidencia, IncidenciaAPI, NuevaIncidencia } from "./diseño.ts";

const baseUrl = new ApiUrls().INCIDENCIA;

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
    tipoIncidencia: api.tipo_incidencia,
    proveedorId: api.proveedor_id || null,
    transportistaId: api.transportista_id || null,
    resolucion: api.resolucion || null,
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
    if (m.fecha !== undefined) result.fecha = m.fecha.toISOString().split('T')[0];
    if (m.descripcion !== undefined) result.descripcion = m.descripcion;
    if (m.descripcionLarga !== undefined) result.descripcionlarga = m.descripcionLarga;
    if (m.prioridad !== undefined) result.prioridad = m.prioridad;
    if (m.estado !== undefined) result.estado = m.estado;
    if (m.clienteId !== undefined) result.cliente_id = m.clienteId;
    if (m.nombreCliente !== undefined) result.nombre_cliente = m.nombreCliente;
    if (m.resolucion !== undefined) result.resolucion = m.resolucion;
    return result;
};

export const getIncidencia = async (id: string): Promise<Incidencia> =>
    RestAPI.get<{ datos: IncidenciaAPI }>(`${baseUrl}/${id}`).then((respuesta) => incidenciaFromAPI(respuesta.datos));

export const getIncidencias = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): Promise<RespuestaLista<Incidencia>> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: IncidenciaAPI[]; total: number }>(`${baseUrl}${q}`);
    return { datos: respuesta.datos.map(incidenciaFromAPI), total: respuesta.total };
};

export const postIncidencia = async (incidencia: NuevaIncidencia): Promise<string> =>
    RestAPI.post<ReturnType<typeof nuevaIncidenciaToAPI>>(`${baseUrl}`, nuevaIncidenciaToAPI(incidencia)).then((respuesta) => respuesta.id);

export const patchIncidencia = async (id: string, incidencia: Partial<Incidencia>): Promise<void> => {
    await RestAPI.patch<ReturnType<typeof patchIncidenciaToAPI>>(`${baseUrl}/${id}`, patchIncidenciaToAPI(incidencia));
};

export const deleteIncidencia = async (id: string): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}`);
};
