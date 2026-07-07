import { getAcciones } from "#/crm/accion/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { DescargarDocumento, GetDocumentos, PostDocumento } from "./detalle/tabs/documentos/diseño.ts";
import { GetNotas, Nota, PostNota } from "./detalle/tabs/notas/diseño.ts";
import { GetTareas, Tarea } from "./detalle/tabs/tareas/diseño.ts";
import { CategoriaIncidencia, DeleteIncidencia, EstadoIncidencia, GetIncidencia, GetIncidencias, Incidencia, PatchIncidencia, PostIncidencia, PrioridadIncidencia, TipoIncidencia } from "./diseño.ts";

const baseUrlIncidencia = new ApiUrls().INCIDENCIA;
const baseUrlTarea = new ApiUrls().TAREA;
const baseUrlNota = new ApiUrls().NOTA_INCIDENCIA;
// const baseUrlDocumento = new ApiUrls().DOCUMENTO_INCIDENCIA;
const baseUrlCategoria = new ApiUrls().CATEGORIA_INCIDENCIA;
const baseUrlSubCategoria = new ApiUrls().SUBCATEGORIA_INCIDENCIA;
const baseUrlDocumentalDocumento = new ApiUrls().DOCUMENTAL_DOCUMENTO;

// ============================================
// DOCUMENTAL - TIPOS
// ============================================

interface DocumentoResumenAPI {
    id: string;
    codigo: string;
    nombre: string;
    tipo: string;
}

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
    codigo_factura?: string;
    articulo_id?: string;
    presupuesto_id?: string;
    codigo_presupuesto?: string;
    en_garantia?: boolean;
    categoria_incidencia?: string;
    subcategoria_incidencia: string;
    codigo_albaran?: string;
    agente_id?: string;
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
    tipoIncidencia: api.tipo_incidencia as TipoIncidencia,
    facturaId: api.factura_id || "",
    codigoFactura: api.codigo_factura || "",
    articuloId: api.articulo_id || "",
    presupuestoId: api.presupuesto_id,
    codigoPresupuesto: api.codigo_presupuesto,
    enGarantia: api.en_garantia || false,
    categoriaIncidencia: api.categoria_incidencia as CategoriaIncidencia,
    subCategoriaIncidencia: api.subcategoria_incidencia,
    codigoAlbaran: api.codigo_albaran,
    agenteId: api.agente_id || "",
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
    ...(incidencia.codigoFactura && { codigo_factura: incidencia.codigoFactura }),
    ...(incidencia.articuloId !== undefined && { articulo_id: incidencia.tipoIncidencia === "Proveedor" ? incidencia.articuloId : "" }),
    ...(incidencia.categoriaIncidencia && { categoria_incidencia: incidencia.categoriaIncidencia }),
    ...(incidencia.subCategoriaIncidencia !== undefined && { subcategoria_incidencia: incidencia.subCategoriaIncidencia }),
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

interface CategoriaAPI {
    id: string;
    descripcion: string;
    tipo_causante: string;
}

export const getCategorias = async (filtro: Filtro, orden: Orden, paginacion: Paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: CategoriaAPI[]; total: number }>(baseUrlCategoria + q);
    return { datos: respuesta.datos, total: respuesta.total };
};

interface SubCategoriaAPI {
    id: string;
    descripcion: string;
    categoria_id: string;
}

export const getSubCategorias = async (filtro: Filtro, orden: Orden, paginacion: Paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: SubCategoriaAPI[]; total: number }>(baseUrlSubCategoria + q);
    return { datos: respuesta.datos, total: respuesta.total };
};

export const crearPresupuestoIncidencia = async (incidenciaId: string) => {
    await RestAPI.post(`${baseUrlIncidencia}/${incidenciaId}/crear_presupuesto`, {}, "Error al crear presupuesto");
}

interface NotaAPI {
    id: string;
    texto: string;
    fecha: string;
    agente_id: string;
    incidencia_id: string;
}

const notaDesdeApi = (api: NotaAPI): Nota => ({
    id: api.id,
    texto: api.texto,
    fecha: api.fecha,
    agenteId: api.agente_id,
    incidenciaId: api.incidencia_id,
});

export const getNotas: GetNotas = (incidenciaId, paginacion) => {
    const filtro: Filtro = [['incidencia_id', incidenciaId]];
    const orden: Orden = ["fecha", "DESC", "idnota", "DESC"];
    const q = criteriaQuery(filtro, orden, paginacion || { limite: 50, pagina: 1 });

    return RestAPI.get<{ datos: NotaAPI[]; total: number }>(baseUrlNota + q).then(respuesta => ({
        datos: respuesta.datos.map(notaDesdeApi),
        total: respuesta.total
    }));
};

export const postNota: PostNota = async (nota) => {
    return await RestAPI.post(baseUrlNota, nota, "Error al guardar Nota").then(
        (respuesta) => respuesta.id
    );
};

export const getDocumentos: GetDocumentos = (incidenciaId, _paginacion) => {
    try {
        // GET documentos vinculados a esta incidencia desde backend
        return RestAPI.get<{ datos: DocumentoResumenAPI[] }>(
            `${baseUrlDocumentalDocumento}/documentos_por_vinculo/INCIDENCIA/${incidenciaId}`,
            "Error al obtener Documentos"
        ).then(respuesta => ({
            datos: respuesta.datos.map(doc => ({
                id: doc.id,
                nombre: doc.nombre,
                incidenciaId: incidenciaId,
                urlDescarga: `${baseUrlDocumentalDocumento}/contenido_por_codigo/${doc.codigo}`,
                fechaSubida: new Date().toISOString(),
                agenteId: "",
                tipo: doc.tipo,
                tamaño: 0,
                codigo: doc.codigo,
            })),
            total: respuesta.datos.length
        })).catch(error => {
            console.error("Error obteniendo documentos:", error);
            return { datos: [], total: 0 };
        });
    } catch (error) {
        console.error("Error en getDocumentos:", error);
        return Promise.resolve({
            datos: [],
            total: 0
        });
    }
};

export const postDocumento: PostDocumento = async (documento, incidenciaId, archivo) => {
    try {
        // 1️⃣ CREAR DOCUMENTO (backend genera ID + código automáticamente)
        const respuestaDocumento = await RestAPI.post(
            baseUrlDocumentalDocumento,
            {
                nombre: documento.nombre || archivo.name,
                nombre_fichero: archivo.name,
                tipo: "DOCUMENTO",  // Tipo de documento corto (≤20 caracteres), no MIME type
                versiones: [
                    {
                        id: "1",
                        codigo: "v1.0",
                    }
                ],
                vinculos: [
                    {
                        objeto_id: incidenciaId,
                        tipo: "INCIDENCIA"
                    }
                ]
            } as unknown,
            "Error al crear Documento"
        ) as { id: string; codigo: string };

        const documentoId = respuestaDocumento.id;

        // 2️⃣ CARGAR CONTENIDO (ARCHIVO)
        const formData = new FormData();
        formData.append("contenido", archivo);

        await RestAPI.put(
            `${baseUrlDocumentalDocumento}/${documentoId}/version/1/cargar_contenido`,
            formData,
            "Error al cargar contenido del Documento"
        );

        return documentoId;
    } catch (error) {
        console.error("Error en postDocumento:", error);
        throw error;
    }
};

export const descargarDocumento: DescargarDocumento = async (codigo) => {
    try {
        const response = await fetch(
            `${baseUrlDocumentalDocumento}/contenido_por_codigo/${codigo}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Error al descargar documento: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error("Error en descargarDocumento:", error);
        throw error;
    }
};