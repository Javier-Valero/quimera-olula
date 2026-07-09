import { CarpetaContenido, SubCarpeta } from "@olula/lib/api/carpetas.ts";
import { Contexto } from "@olula/lib/diseño.ts";

export type EstadoGestorDocumental =
    | "cargando_carpeta_raiz"
    | "lista"
    | "creando_carpeta"
    | "renombrando_carpeta"
    | "borrando_carpeta"
    | "error";

export type ContextoGestorDocumental = Contexto<EstadoGestorDocumental> & {
    carpetaActual: CarpetaContenido | null;
    carpetaRaiz: CarpetaContenido | null;
    historialCarpetas: CarpetaContenido[];
    nuevaCarpetaNombre: string;
    carpetaAEditar: SubCarpeta | null;
    error: Error | null;
};

export type EventoGestorDocumental =
    | "cargar_carpeta_raiz"
    | "carpeta_raiz_cargada"
    | "carpetas_cargadas"
    | "carpeta_seleccionada"
    | "navegar_carpeta"
    | "navegar_atras"
    | "ir_a_raiz"
    | "comenzar_crear_carpeta"
    | "nombre_nueva_carpeta"
    | "crear_carpeta"
    | "carpeta_creada"
    | "cancelar_crear_carpeta"
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
    onCarpetaSeleccionada?: (carpeta: CarpetaContenido | null) => void;
    onError?: (error: Error) => void;
}
