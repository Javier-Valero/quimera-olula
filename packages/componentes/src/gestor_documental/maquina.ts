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
        carpeta_raiz_cargada: async (ctx, payload) => {
            const carpetaRaiz = payload as unknown;
            return [
                {
                    ...ctx,
                    estado: "lista",
                    carpetaRaiz: carpetaRaiz as ContextoGestorDocumental["carpetaRaiz"],
                    carpetaActual: carpetaRaiz as ContextoGestorDocumental["carpetaActual"],
                    historialCarpetas: [carpetaRaiz] as ContextoGestorDocumental["historialCarpetas"],
                    error: null,
                },
                [],
            ];
        },
        // Nuevo evento cuando se cargan carpetas (incluso si están vacías)
        carpetas_cargadas: async (ctx, _payload) => {
            // Solo registra el evento, la siguiente transición será carpeta_seleccionada
            return [
                {
                    ...ctx,
                },
                [],
            ];
        },
        // Nuevo evento con carpeta seleccionada (puede ser null si no hay carpetas)
        carpeta_seleccionada: async (ctx, payload) => {
            const carpeta = payload as ContextoGestorDocumental["carpetaActual"];
            return [
                {
                    ...ctx,
                    estado: "lista",
                    carpetaRaiz: carpeta,
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
            const carpetaActual = nuevoHistorial[nuevoHistorial.length - 1] || ctx.carpetaRaiz;
            return {
                ...ctx,
                carpetaActual,
                historialCarpetas: nuevoHistorial,
            };
        },
        ir_a_raiz: async (ctx) => {
            return {
                ...ctx,
                carpetaActual: ctx.carpetaRaiz,
                historialCarpetas: ctx.carpetaRaiz ? [ctx.carpetaRaiz] : [],
            };
        },
        comenzar_crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "creando_carpeta",
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
        cancelar_crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
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
    borrando_carpeta: {
        cancelar_crear_carpeta: async (ctx) => {
            return {
                ...ctx,
                estado: "lista",
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
            return {
                ...ctx,
                estado: "lista",
                carpetaActual: ctx.carpetaRaiz,
                historialCarpetas: ctx.carpetaRaiz ? [ctx.carpetaRaiz] : [],
                error: null,
            };
        },
    },
});
