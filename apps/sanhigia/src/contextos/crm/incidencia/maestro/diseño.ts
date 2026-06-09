import { MetaTabla } from "@olula/componentes/index.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Incidencia } from "../diseño.ts";

export type EstadoMaestroIncidencia = "INICIAL" | "CREANDO_INCIDENCIA";

export type ContextoMaestroIncidencia = {
    estado: EstadoMaestroIncidencia;
    incidencias: ListaActivaEntidades<Incidencia>;
};

export const metaTablaIncidencia: MetaTabla<Incidencia> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "nombreCliente", cabecera: "Cliente" },
    {
        id: "tipoIncidencia",
        cabecera: "Tipo",
        render: (i: Incidencia) => i.tipoIncidencia === "Transportista" ? "Transporte" : "Producto",
    },
];
