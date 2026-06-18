import { getAcciones } from "#/crm/accion/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { GetTareas, Tarea } from "./detalle/tareas/diseño.ts";
import { DeleteIncidencia, EstadoIncidencia, GetIncidencia, GetIncidencias, Incidencia, PatchIncidencia, PostIncidencia, PrioridadIncidencia, TipoIncidencia } from "./diseño.ts";

const baseUrlIncidencia = new ApiUrls().INCIDENCIA;
const baseUrlTarea = new ApiUrls().TAREA;

interface IncidenciaAPI {
    id: string;
    fecha: string;
    descripcion: string;
    descripcion_larga?: string | null;
    nombre_cliente: string;
    cliente_id: string;
    prioridad: string;
    estado: string;
    tipo_incidencia?: string;
    factura_id?: string;
    articulo_id?: string;
    presupuesto_id?: string;
    codigo_presupuesto?: string;
}

export const incidenciaDesdeApi = (api: IncidenciaAPI): Incidencia => ({
    id: api.id,
    fecha: new Date(Date.parse(api.fecha)),
    descripcion: api.descripcion,
    observaciones: api.descripcion_larga || "",
    clienteId: api.cliente_id || "",
    nombreCliente: api.nombre_cliente,
    prioridad: (api.prioridad as PrioridadIncidencia),
    estado: (api.estado as EstadoIncidencia),
    tipoIncidencia: api.tipo_incidencia as TipoIncidencia | undefined,
    facturaId: api.factura_id || "",
    articuloId: api.articulo_id || "",
    presupuestoId: api.presupuesto_id,
    codigoPresupuesto: api.codigo_presupuesto,
});

const incidenciaAApi = (incidencia: Partial<Incidencia>): Partial<IncidenciaAPI> => ({
    ...(incidencia.fecha && { fecha: incidencia.fecha.toISOString().slice(0, 10) }),
    ...(incidencia.descripcion && { descripcion: incidencia.descripcion }),
    ...(incidencia.observaciones && { descripcion_larga: incidencia.observaciones }),
    ...(incidencia.clienteId && { cliente_id: incidencia.clienteId }),
    ...(incidencia.nombreCliente && { nombre_cliente: incidencia.nombreCliente }),
    ...(incidencia.prioridad && { prioridad: incidencia.prioridad }),
    ...(incidencia.estado && { estado: incidencia.estado }),
    ...(incidencia.tipoIncidencia && { tipo_incidencia: incidencia.tipoIncidencia }),
    ...(incidencia.facturaId && { factura_id: incidencia.facturaId }),
    ...(incidencia.articuloId && { articulo_id: incidencia.articuloId }),
});

export const getIncidencia: GetIncidencia = async (id) =>
    await RestAPI.get<{ datos: IncidenciaAPI }>(`${baseUrlIncidencia}/${id}`).then((respuesta) =>
        incidenciaDesdeApi(respuesta.datos)
    );

export const getIncidencias: GetIncidencias = async (
    filtro, orden, paginacion
) => {

    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: IncidenciaAPI[]; total: number }>(baseUrlIncidencia + q);

    return { datos: respuesta.datos.map(incidenciaDesdeApi), total: respuesta.total };
};

export const postIncidencia: PostIncidencia = async (incidencia) => {
    const incidenciaAPI = incidenciaAApi(incidencia);

    return await RestAPI.post(baseUrlIncidencia, incidenciaAPI, "Error al guardar Incidencia").then(
        (respuesta) => respuesta.id
    );
};

export const patchIncidencia: PatchIncidencia = async (id, incidencia) => {
    const incidenciaAPI = incidenciaAApi(incidencia);

    const IncidenciaSinNulls = Object.fromEntries(
        Object.entries(incidenciaAPI).map(([k, v]) => [k, v === null ? "" : v])
    );

    await RestAPI.patch(`${baseUrlIncidencia}/${id}`, IncidenciaSinNulls, "Error al guardar Incidencia");
};

export const deleteIncidencia: DeleteIncidencia = async (id) => {
    await RestAPI.delete(`${baseUrlIncidencia}/${id}`, "Error al borrar Incidencia");
}

export const getAccionesIncidencia = async (incidenciaId: string) => {
    return getAcciones([['incidencia_id', incidenciaId]], [], { limite: 50, pagina: 1 });
};

interface TareaAPI {
    id: string;
    titulo: string;
    fecha: string;
    hora: string;
    tipo: string;
    completada: boolean;
    agente_id?: string | null;
    nota?: string | null;
    trato_id?: string | null;
    incidencia_id?: string | null;
    id_tarea_google?: string | null;
    fecha_fin?: string | null;
    hora_fin?: string | null;
    latitud_fin?: string | null;
    longitud_fin?: string | null;
}

const tareaDesdeApi = (api: TareaAPI): Tarea => ({
    id: api.id,
    titulo: api.titulo,
    fecha: api.fecha,
    hora: api.hora,
    tipo: api.tipo,
    completada: api.completada,
    agente_id: api.agente_id || undefined,
    nota: api.nota || undefined,
    trato_id: api.trato_id || undefined,
    incidencia_id: api.incidencia_id || undefined,
    id_tarea_google: api.id_tarea_google || undefined,
    fecha_fin: api.fecha_fin || undefined,
    hora_fin: api.hora_fin || undefined,
    latitud_fin: api.latitud_fin || undefined,
    longitud_fin: api.longitud_fin || undefined,
});

export const getTareas: GetTareas = async (incidenciaId, paginacion) => {
    const filtro: Filtro = [['incidencia_id', incidenciaId]];
    const q = criteriaQuery(filtro, [], paginacion || { limite: 50, pagina: 1 });

    const respuesta = await RestAPI.get<{ datos: TareaAPI[]; total: number }>(baseUrlTarea + q);
    return { datos: respuesta.datos.map(tareaDesdeApi), total: respuesta.total };
};


export const crearPresupuestoIncidencia = async (incidenciaId: string) => {
    await RestAPI.post(`${baseUrlIncidencia}/${incidenciaId}/crear_presupuesto`, {}, "Error al crear presupuesto");
}