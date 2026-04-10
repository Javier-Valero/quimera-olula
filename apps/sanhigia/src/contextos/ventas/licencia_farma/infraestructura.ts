import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { LicenciaFarma, LicenciaFarmaAPI, NuevaLicenciaFarma } from "./diseño.ts";

// const baseUrl = `/ss/licencia_farma`;
const baseUrl = `/ventas/licencia_farma`;


const licenciaFarmaFromAPI = (a: LicenciaFarmaAPI): LicenciaFarma => ({
    id: a.id,
    tipoLicencia: a.tipo_licencia,
    fechaCaducidad: a.fecha_caducidad,
    fechaInicio: a.fecha_inicio,
    fechaRevisionDatos: a.fecha_revision_datos,
    fechaRecepcionAcuerdos: a.fecha_recepcion_acuerdos,
    fechaEnvioDocumentacion: a.fecha_envio_documentacion,
    fechaFin: a.fecha_fin,
    tratoId: a.trato_id,
    estado: a.estado,
    nombreCliente: a.nombre_cliente,
    clienteId: a.cliente_id,
    agenteId: a.agente_id,
});

const licenciaFarmaToAPI = (l: Partial<LicenciaFarma>) => ({
    ...(l.tipoLicencia !== undefined && { tipo_licencia: l.tipoLicencia }),
    ...(l.fechaCaducidad !== undefined && { fecha_caducidad: l.fechaCaducidad }),
    ...(l.fechaInicio !== undefined && { fecha_inicio: l.fechaInicio }),
    ...(l.fechaRevisionDatos !== undefined && { fecha_revision_datos: l.fechaRevisionDatos }),
    ...(l.fechaRecepcionAcuerdos !== undefined && { fecha_recepcion_acuerdos: l.fechaRecepcionAcuerdos }),
    ...(l.fechaEnvioDocumentacion !== undefined && { fecha_envio_documentacion: l.fechaEnvioDocumentacion }),
    ...(l.fechaFin !== undefined && { fecha_fin: l.fechaFin }),
    ...(l.tratoId !== undefined && { trato_id: l.tratoId }),
    ...(l.estado !== undefined && { estado: l.estado }),
    ...(l.clienteId !== undefined && { cliente_id: l.clienteId }),
    ...(l.agenteId !== undefined && { agente_id: l.agenteId }),
});

const nuevaLicenciaFarmaToAPI = (n: NuevaLicenciaFarma) => ({
    tipo_licencia: n.tipoLicencia,
    fecha_caducidad: n.fechaCaducidad,
    trato_id: n.tratoId,
    cliente_id: n.clienteId,
});

export const getLicenciaFarma = async (id: string): Promise<LicenciaFarma> =>
    await RestAPI.get<{ datos: LicenciaFarmaAPI }>(`${baseUrl}/${id}`).then((r) => licenciaFarmaFromAPI(r.datos));

export const getLicenciasFarma = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
): RespuestaLista<LicenciaFarma> => {
    const q = criteriaQuery(filtro, orden, paginacion);
    const respuesta = await RestAPI.get<{ datos: LicenciaFarmaAPI[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(licenciaFarmaFromAPI), total: respuesta.total };
};

export const postLicenciaFarma = async (nueva: NuevaLicenciaFarma): Promise<string> =>
    await RestAPI.post(baseUrl, nuevaLicenciaFarmaToAPI(nueva)).then((r) => r.id);

export const patchLicenciaFarma = async (id: string, cambios: Partial<LicenciaFarma>): Promise<void> =>
    await RestAPI.patch(`${baseUrl}/${id}`, { cambios: licenciaFarmaToAPI(cambios) });

export const deleteLicenciaFarma = async (id: string): Promise<void> =>
    await RestAPI.delete(`${baseUrl}/${id}`);
