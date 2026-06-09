import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, publicar } from "@olula/lib/dominio.js";
import { Incidencia } from "../diseño.ts";
import {
    deleteIncidencia,
    getIncidencia,
    patchIncidencia,
} from "../infraestructura.ts";
import { ContextoIncidencia, EstadoIncidencia } from "./diseño.ts";

export const metaIncidencia: MetaModelo<Incidencia> = {
    campos: {
        descripcion: { requerido: true, minimo: 5 },
        descripcionLarga: { requerido: false },
        nombreCliente: { requerido: true, minimo: 3 },
        fecha: { requerido: true, tipo: "fecha" },
        prioridad: { requerido: true },
        estado: { requerido: true },
        clienteId: { requerido: false },
        articuloId: { requerido: false },
        enGarantia: { requerido: false },
        resolucion: { requerido: false },
    },
    editable: (incidencia: Incidencia) =>
        incidencia.estado !== "Rechazada" && incidencia.estado !== "Cerrada",
};

export const incidenciaVacia = (): Incidencia => ({
    id: "",
    fecha: new Date(),
    descripcion: "",
    descripcionLarga: null,
    prioridad: "Media",
    estado: "Nueva",
    clienteId: null,
    nombreCliente: "",
    articuloId: null,
    descripcionReferencia: null,
    presupuestoId: null,
    codigoPresupuesto: null,
    familiaId: null,
    agenteId: null,
    enGarantia: false,
    tipoIncidencia: undefined,
    proveedorId: null,
    transportistaId: null,
    resolucion: null,
});

type ProcesarIncidencia = ProcesarContexto<EstadoIncidencia, ContextoIncidencia>;

const pipeIncidencia = ejecutarListaProcesos<EstadoIncidencia, ContextoIncidencia>;

export const incidenciaVacioContexto = (): Incidencia => ({ ...incidenciaVacia() });

const cargarIncidencia: (_: string) => ProcesarIncidencia = (idIncidencia) =>
    async (contexto) => {
        const incidencia = await getIncidencia(idIncidencia);
        return {
            ...contexto,
            incidencia,
            incidenciaInicial: incidencia,
        };
    };

export const refrescarIncidencia: ProcesarIncidencia = async (contexto) => {
    const incidencia = await getIncidencia(contexto.incidencia.id);
    return [
        {
            ...contexto,
            incidencia: {
                ...contexto.incidencia,
                ...incidencia,
            },
        },
        [["incidencia_cambiada", incidencia]],
    ];
};

export const cancelarCambioIncidencia: ProcesarIncidencia = async (contexto) => {
    return {
        ...contexto,
        incidencia: contexto.incidenciaInicial,
    };
};

export const abiertoContexto: ProcesarIncidencia = async (contexto) => {
    return {
        ...contexto,
        estado: "ABIERTO",
    };
};

export const getContextoVacio: ProcesarIncidencia = async (contexto) => {
    return {
        ...contexto,
        estado: "INICIAL",
        incidencia: incidenciaVacioContexto(),
        incidenciaInicial: incidenciaVacioContexto(),
    };
};

export const cargarContexto: ProcesarIncidencia = async (contexto, payload) => {
    const idIncidencia = payload as string;
    if (idIncidencia) {
        return pipeIncidencia(contexto, [
            cargarIncidencia(idIncidencia),
            abiertoContexto,
        ]);
    } else {
        return getContextoVacio(contexto);
    }
};

export const cambiarIncidencia: ProcesarIncidencia = async (contexto, payload) => {
    const incidencia = payload as Incidencia;
    await patchIncidencia(contexto.incidencia.id, incidencia);

    return pipeIncidencia(contexto, [
        refrescarIncidencia,
        "ABIERTO",
    ]);
};

export const borrarIncidencia: ProcesarIncidencia = async (contexto, payload) => {
    const { incidenciaId } = payload as { incidenciaId: string } ?? { incidenciaId: contexto.incidencia.id };
    await deleteIncidencia(incidenciaId);

    return pipeIncidencia(contexto, [
        getContextoVacio,
        publicar("incidencia_borrada", null),
    ]);
};
