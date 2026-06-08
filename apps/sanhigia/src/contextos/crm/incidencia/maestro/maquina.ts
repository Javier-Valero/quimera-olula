import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroIncidencia, EstadoMaestroIncidencia } from "./diseño.ts";
import * as dominio from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroIncidencia, ContextoMaestroIncidencia> = () => {
    return {
        INICIAL: {
            // Selección de entidades
            incidencia_seleccionada: [dominio.Incidencias.activar],
            incidencia_deseleccionada: [dominio.Incidencias.desactivar],

            // Sincronización con detalle
            incidencia_cambiada: [dominio.Incidencias.cambiar],
            incidencia_borrada: [dominio.Incidencias.quitar],
            incidencia_creada: [dominio.Incidencias.incluir],

            // Recarga completa (al montar o cambiar filtros)
            recarga_de_incidencias_solicitada: dominio.recargarIncidencias,

            // Cambio de criteria → actualiza criteria en lista y recarga desde cero
            criteria_cambiado: [dominio.Incidencias.filtrar, dominio.recargarIncidencias],

            // Paginación incremental → actualiza criteria y añade al final de la lista
            siguiente_pagina: [dominio.Incidencias.filtrar, dominio.ampliarIncidencias],

            // Crear entidad directamente (sin estado modal separado)
            crear_incidencia_solicitado: dominio.crearIncidenciaProceso,
        },
    };
};
