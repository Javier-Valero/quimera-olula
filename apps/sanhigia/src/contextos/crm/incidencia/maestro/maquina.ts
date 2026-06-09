import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroIncidencia, EstadoMaestroIncidencia } from "./diseño.ts";
import { ampliarIncidencias, Incidencias, recargarIncidencias } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroIncidencia, ContextoMaestroIncidencia> = () => {
    return {
        INICIAL: {
            incidencia_cambiada: Incidencias.cambiar,
            incidencia_seleccionada: [Incidencias.activar],
            incidencia_deseleccionada: Incidencias.desactivar,
            incidencia_borrada: Incidencias.quitar,
            incidencia_creada: Incidencias.incluir,
            recarga_de_incidencias_solicitada: recargarIncidencias,
            criteria_cambiado: [Incidencias.filtrar, recargarIncidencias],
            siguiente_pagina: [Incidencias.filtrar, ampliarIncidencias],
            creacion_solicitada: "CREANDO_INCIDENCIA",
        },

        CREANDO_INCIDENCIA: {
            incidencia_creada: [Incidencias.incluir, "INICIAL"],
            creacion_cancelada: "INICIAL",
        },
    };
};
