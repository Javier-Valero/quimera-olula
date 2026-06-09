import { Incidencia } from "../diseño.ts";

export type EstadoIncidencia =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO_INCIDENCIA";

export type ContextoIncidencia = {
    estado: EstadoIncidencia;
    incidencia: Incidencia;
    incidenciaInicial: Incidencia;
};
