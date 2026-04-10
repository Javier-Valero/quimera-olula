import { Entidad } from "@olula/lib/diseño.ts";

export interface LicenciaFarma extends Entidad {
    id: string;
    tipoLicencia: string;
    fechaCaducidad: string;
    fechaInicio: string | null;
    fechaRevisionDatos: string | null;
    fechaRecepcionAcuerdos: string | null;
    fechaEnvioDocumentacion: string | null;
    fechaFin: string | null;
    tratoId: string | null;
    estado: string | null;
    nombreCliente: string | null;
    clienteId: string | null;
    agenteId: string | null;
}

export interface LicenciaFarmaAPI {
    id: string;
    tipo_licencia: string;
    fecha_caducidad: string;
    fecha_inicio: string | null;
    fecha_revision_datos: string | null;
    fecha_recepcion_acuerdos: string | null;
    fecha_envio_documentacion: string | null;
    fecha_fin: string | null;
    trato_id: string | null;
    estado: string | null;
    nombre_cliente: string | null;
    cliente_id: string | null;
    agente_id: string | null;
}

export type NuevaLicenciaFarma = {
    tipoLicencia: string;
    fechaCaducidad: string;
    tratoId: string | null;
    clienteId: string | null;
};
