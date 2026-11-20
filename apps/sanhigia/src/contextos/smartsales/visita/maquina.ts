import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoVisita, EstadoVisita } from "./diseño.ts";
import {
    cambiarClienteDocumentoProceso,
    cambiarDireccionDocumentoProceso,
    cambiarDocumentoProceso,
    cambiarProceso,
    cancelarDocumentoProceso,
    cargarProceso,
    confirmarDocumentoProceso,
    ganarTratoProceso,
    guardarProceso,
    iniciarProceso,
    pedirFinalizacionProceso,
    perderTratoProceso,
    volverProceso,
} from "./dominio.ts";

export const getMaquina = (): Maquina<EstadoVisita, ContextoVisita> => ({
    CARGANDO: {
        cargar: cargarProceso,
    },
    PENDIENTE: {
        iniciar: iniciarProceso,
        finalizar: pedirFinalizacionProceso,
        cambiar: cambiarProceso,
    },
    EN_CURSO: {
        finalizar: pedirFinalizacionProceso,
        cambiar: cambiarProceso,
    },
    FINALIZANDO: {
        cambiar: cambiarProceso,
        volver: volverProceso,
        guardar: guardarProceso,
    },
    DOCUMENTO: {
        cambiar_documento: cambiarDocumentoProceso,
        cambiar_direccion: cambiarDireccionDocumentoProceso,
        cambiar_cliente: cambiarClienteDocumentoProceso,
        confirmar_documento: confirmarDocumentoProceso,
        cancelar_documento: cancelarDocumentoProceso,
    },
    CERRANDO_TRATO: {
        cambiar: cambiarProceso,
        ganar_trato: ganarTratoProceso,
        perder_trato: perderTratoProceso,
        mantener_abierto: "TERMINADA",
    },
    TERMINADA: {},
});
