import { Maquina } from "@olula/lib/diseño.js";
import { ContextoArbolDocumentos, EstadoArbolDocumentos } from "./diseño.ts";
import { cargarArbol } from "./dominio.ts";

export const getMaquinaArbolDocumentos: () => Maquina<EstadoArbolDocumentos, ContextoArbolDocumentos> = () => {
    return {
        cargando: {
            cargar_arbol: [cargarArbol, "cargado"],
        },
        cargado: {
            recargar_solicitado: [cargarArbol, "cargado"],
        },
    };
};
