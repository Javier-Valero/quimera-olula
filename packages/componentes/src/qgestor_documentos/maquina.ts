import { Maquina } from "@olula/lib/diseño.js";
import { ContextoGestorDocumentos, EstadoGestorDocumentos } from "./diseño.ts";
import { cargarDocumentos, seleccionarArchivos } from "./dominio.ts";

export const getMaquinaGestorDocumentos: () => Maquina<EstadoGestorDocumentos, ContextoGestorDocumentos> = () => {
    return {
        lista: {
            cargar_documentos: cargarDocumentos,
            archivos_seleccionados: [seleccionarArchivos, "archivos-seleccionados"],
        },
        "archivos-seleccionados": {
            subida_cancelada: "lista",
            subir_archivos_solicitado: "subiendo",
        },
        subiendo: {
            documentos_subidos: [cargarDocumentos, "lista"],
            subida_cancelada: "lista",
        },
    };
};
