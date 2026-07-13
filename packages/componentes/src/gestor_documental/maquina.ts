import { ArbolCarpetasRespuesta, CarpetaEnArbol } from "@olula/lib/api/carpetas.ts";
import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoGestorDocumental,
    EstadoGestorDocumental,
} from "./diseño.ts";

export const getMaquinaGestorDocumental = (): Maquina<
    EstadoGestorDocumental,
    ContextoGestorDocumental
> => ({
    cargando_carpeta_raiz: {
        arbol_cargado: async (ctx, payload) => {
            const arbol = payload as ArbolCarpetasRespuesta;
            return [
                {
                    ...ctx,
                    estado: "lista",
                    arbolCarpetas: arbol,
                    documentosSinCarpeta: arbol.documentos_sin_carpeta,
                    error: null,
                },
                [],
            ];
        },
        carpeta_seleccionada: async (ctx, payload) => {
            const carpeta = payload as CarpetaEnArbol | null;
            return [
                {
                    ...ctx,
                    estado: "lista",
                    carpetaActual: carpeta,
                    historialCarpetas: carpeta ? [carpeta] : [],
                    error: null,
                },
                [],
            ];
        },
        error: async (ctx, payload) => {
            const error = payload as Error;
            return [
                {
                    ...ctx,
                    estado: "error",
                    error,
                },
                [],
            ];
        },
    },
    lista: {
        navegar_carpeta: async (ctx, payload) => {
            const carpeta = payload as unknown as ContextoGestorDocumental["carpetaActual"];
            return {
                ...ctx,
                carpetaActual: carpeta,
                historialCarpetas: [...ctx.historialCarpetas, carpeta!],
            };
        },
        navegar_atras: async (ctx) => {
            const nuevoHistorial = ctx.historialCarpetas.slice(0, -1);
            const carpetaActual = nuevoHistorial[nuevoHistorial.length - 1] || null;
            return {
                ...ctx,
                carpetaActual,
                historialCarpetas: nuevoHistorial,
            };
        },
        ir_a_raiz: async (ctx) => {
            const carpetaRaiz = ctx.arbolCarpetas?.carpetas[0] || null;
            return {
                ...ctx,
                carpetaActual: carpetaRaiz,
                historialCarpetas: carpetaRaiz ? [carpetaRaiz] : [],
            };
        },
        comenzar_crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "creando_carpeta",
                nuevaCarpetaNombre: "",
            };
        },
        comenzar_renombrar_carpeta: async (ctx, payload) => {
            const carpeta = payload as CarpetaEnArbol;
            return {
                ...ctx,
                estado: "renombrando_carpeta",
                carpetaAEditar: carpeta,
                carpetaAEditarNombre: carpeta.nombre,
            };
        },
        nombre_carpeta_editada: async (ctx, payload) => {
            const nombre = payload as string;
            return {
                ...ctx,
                carpetaAEditarNombre: nombre,
            };
        },
        comenzar_eliminar_carpeta: async (ctx, payload) => {
            const carpeta = payload as CarpetaEnArbol;
            return {
                ...ctx,
                estado: "eliminando_carpeta",
                carpetaAEliminar: carpeta,
            };
        },
        error: async (ctx, payload) => {
            const error = payload as Error;
            return [
                {
                    ...ctx,
                    estado: "error",
                    error,
                },
                [],
            ];
        },
    },
    creando_carpeta: {
        nombre_nueva_carpeta: async (ctx, payload) => {
            const nombre = payload as string;
            return {
                ...ctx,
                nuevaCarpetaNombre: nombre,
            };
        },
        crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                nuevaCarpetaNombre: "",
            };
        },
        carpeta_creada: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                nuevaCarpetaNombre: "",
            };
        },
        cancelar_crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                nuevaCarpetaNombre: "",
            };
        },
        error: async (ctx, payload) => {
            const error = payload as Error;
            return [
                {
                    ...ctx,
                    estado: "error",
                    error,
                },
                [],
            ];
        },
    },
    renombrando_carpeta: {
        renombrar_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
            };
        },
        carpeta_renombrada: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                carpetaAEditar: null,
                carpetaAEditarNombre: "",
            };
        },
        cancelar_renombrar: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                carpetaAEditar: null,
                carpetaAEditarNombre: "",
            };
        },
        error: async (ctx, payload) => {
            const error = payload as Error;
            return [
                {
                    ...ctx,
                    estado: "error",
                    error,
                },
                [],
            ];
        },
    },
    eliminando_carpeta: {
        eliminar_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
            };
        },
        carpeta_eliminada: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                carpetaAEliminar: null,
            };
        },
        cancelar_eliminar: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                carpetaAEliminar: null,
            };
        },
        error: async (ctx, payload) => {
            const error = payload as Error;
            return [
                {
                    ...ctx,
                    estado: "error",
                    error,
                },
                [],
            ];
        },
    },
    error: {
        limpiar_error: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
                error: null,
            };
        },
        ir_a_raiz: async (ctx) => {
            const carpetaRaiz = ctx.arbolCarpetas?.carpetas[0] || null;
            return {
                ...ctx,
                estado: "lista",
                carpetaActual: carpetaRaiz,
                historialCarpetas: carpetaRaiz ? [carpetaRaiz] : [],
                error: null,
            };
        },
    },
});
