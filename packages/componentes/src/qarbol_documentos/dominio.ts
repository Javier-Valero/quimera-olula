import { DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ContextoArbolDocumentos, EstadoArbolDocumentos } from "./diseño.ts";

type ProcesarArbolDocumentos = ProcesarContexto<EstadoArbolDocumentos, ContextoArbolDocumentos>;

export const cargarArbol: ProcesarArbolDocumentos = async (contexto) => {
    const nodos = await DocumentosAPI.obtenerArbol(
        contexto.configuracion.tipoObjeto,
        contexto.configuracion.objetoId
    );

    return {
        ...contexto,
        nodos,
    };
};
