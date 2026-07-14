import { NodoArbol } from "@olula/lib/api/documentos.ts";
import { Contexto } from "@olula/lib/diseño.ts";

export type ConfiguracionArbolDocumentos = {
    tipoObjeto: string;
    objetoId: string;
};

export type EstadoArbolDocumentos = "cargando" | "cargado";

export type ContextoArbolDocumentos = Contexto<EstadoArbolDocumentos> & {
    nodos: NodoArbol[];
    configuracion: ConfiguracionArbolDocumentos;
};
