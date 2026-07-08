import { ProcesarContexto } from "@olula/lib/diseño.js";
import { getDocumentos } from "../../../../infraestructura.ts";
import { ContextoDocumentos, EstadoDocumentos } from "./diseño.ts";

type ProcesarDocumentos = ProcesarContexto<EstadoDocumentos, ContextoDocumentos>;

export const cargarDocumentos: ProcesarDocumentos = async (contexto, payload) => {
    const incidenciaId = (payload as string) || contexto.incidenciaId;

    console.log("cargarDocumentos - iniciando carga", { incidenciaId });

    try {
        const resultado = await getDocumentos(incidenciaId, { limite: 50, pagina: 1 });
        console.log("cargarDocumentos - resultado", resultado);

        return {
            ...contexto,
            documentos: resultado.datos,
            incidenciaId,
            archivosSeleccionados: [],
        };
    } catch (error) {
        console.error("cargarDocumentos - error", error);
        throw error;
    }
};

export const seleccionarArchivos: ProcesarDocumentos = async (contexto, payload) => {
    const archivos = payload as File[];

    return {
        ...contexto,
        archivosSeleccionados: archivos,
    };
};
