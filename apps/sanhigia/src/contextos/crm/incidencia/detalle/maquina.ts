import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoIncidencia, EstadoIncidencia } from "./diseño.ts";
import {
    abiertoContexto,
    borrarIncidencia,
    cambiarIncidencia,
    cancelarCambioIncidencia,
    cargarContexto,
    getContextoVacio,
    refrescarIncidencia,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoIncidencia, ContextoIncidencia> = () => {
    return {
        INICIAL: {
            incidencia_id_cambiado: [cargarContexto],

            incidencia_deseleccionada: [
                getContextoVacio,
                publicar("incidencia_deseleccionada", null),
            ],
        },

        ABIERTO: {
            incidencia_deseleccionada: [
                getContextoVacio,
                publicar("incidencia_deseleccionada", null),
            ],

            incidencia_cargada: [abiertoContexto],

            incidencia_cambiada: [refrescarIncidencia],

            edicion_de_incidencia_lista: [cambiarIncidencia],

            edicion_de_incidencia_cancelada: [cancelarCambioIncidencia],

            borrado_solicitado: "BORRANDO_INCIDENCIA",
        },

        BORRANDO_INCIDENCIA: {
            borrado_de_incidencia_listo: borrarIncidencia,

            borrado_cancelado: "ABIERTO",
        },
    };
};
