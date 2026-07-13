import { ArbolCarpetasRespuesta, CarpetaEnArbol, DocumentoEnArbol } from "@olula/lib/api/carpetas.ts";
import { Contexto } from "@olula/lib/diseño.ts";

export type EstadoGestorDocumental =
    | "cargando_carpeta_raiz"
    | "lista"
    | "creando_carpeta"
    | "renombrando_carpeta"
    | "eliminando_carpeta"
    | "error";

export type ContextoGestorDocumental = Contexto<EstadoGestorDocumental> & {
    arbolCarpetas: ArbolCarpetasRespuesta | null;
    carpetaActual: CarpetaEnArbol | null;
    documentosSinCarpeta: DocumentoEnArbol[];
    historialCarpetas: CarpetaEnArbol[];
    nuevaCarpetaNombre: string;
    carpetaAEditar: CarpetaEnArbol | null;
    carpetaAEditarNombre: string;
    carpetaAEliminar: CarpetaEnArbol | null;
    error: Error | null;
};

export type EventoGestorDocumental =
    | "arbol_cargado"
    | "carpeta_seleccionada"
    | "navegar_carpeta"
    | "navegar_atras"
    | "ir_a_raiz"
    | "comenzar_crear_carpeta"
    | "nombre_nueva_carpeta"
    | "crear_carpeta"
    | "carpeta_creada"
    | "cancelar_crear_carpeta"
    | "comenzar_renombrar_carpeta"
    | "nombre_carpeta_editada"
    | "renombrar_carpeta"
    | "carpeta_renombrada"
    | "cancelar_renombrar"
    | "comenzar_eliminar_carpeta"
    | "eliminar_carpeta"
    | "carpeta_eliminada"
    | "cancelar_eliminar"
    | "error"
    | "limpiar_error";

export interface ConfiguracionGestorDocumental {
    contenedor_id: string;
    contenedor_tipo: string;
}

export interface GestorDocumentalProps {
    contenedor_id: string;
    contenedor_tipo: string;
    mostrarCarpetas?: boolean;
    onCarpetaSeleccionada?: (carpeta: CarpetaEnArbol | null) => void;
    onError?: (error: Error) => void;
}
