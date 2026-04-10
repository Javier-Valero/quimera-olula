import { EstadoModelo, initEstadoModelo, MetaModelo } from "@olula/lib/dominio.ts";
import { LicenciaFarma, NuevaLicenciaFarma } from "./diseño.ts";

export const licenciaFarmaVacia: LicenciaFarma = {
    id: '',
    tipoLicencia: '',
    fechaCaducidad: '',
    fechaInicio: null,
    fechaRevisionDatos: null,
    fechaRecepcionAcuerdos: null,
    fechaEnvioDocumentacion: null,
    fechaFin: null,
    tratoId: null,
    estado: null,
    nombreCliente: null,
    clienteId: null,
    agenteId: null,
};

export const nuevaLicenciaFarmaVacia: NuevaLicenciaFarma = {
    tipoLicencia: '',
    fechaCaducidad: '',
    tratoId: null,
    clienteId: null,
};

export const metaLicenciaFarma: MetaModelo<LicenciaFarma> = {
    campos: {
        tipoLicencia: { requerido: true, tipo: "texto" },
        fechaCaducidad: { requerido: true, tipo: "texto" },
    },
};

export const metaNuevaLicenciaFarma: MetaModelo<NuevaLicenciaFarma> = {
    campos: {
        tipoLicencia: { requerido: true, tipo: "texto" },
        fechaCaducidad: { requerido: true, tipo: "texto" },
    },
};

export const initEstadoLicenciaFarma = (licencia: LicenciaFarma): EstadoModelo<LicenciaFarma> =>
    initEstadoModelo(licencia);

export const initEstadoLicenciaFarmaVacia = () => initEstadoLicenciaFarma(licenciaFarmaVacia);
