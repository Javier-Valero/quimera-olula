import { Maquina } from "@olula/lib/diseño.js";
import { ContextoDocumentos, EstadoDocumentos } from "./diseño.ts";
import { cargarDocumentos } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDocumentos, ContextoDocumentos> = () => {
    return {
        lista: {
            cargar_documentos: cargarDocumentos,
            archivos_seleccionados: "archivos-seleccionados",
        },
        "archivos-seleccionados": {
            subida_cancelada: "lista",
            subir_archivos_solicitado: "subiendo",
        },
        subiendo: {
            documentos_subidos: [cargarDocumentos, "lista"],
        },
    };
};
