import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ContextoDetalleIncidencia, EstadoDetalleIncidencia } from "./diseño.ts";
import { cargarContexto, refrescarIncidencia } from "./dominio.ts";

/**
 * Máquina de estados para la vista detalle de incidencia.
 *
 * Patrón de transiciones:
 *   - string                    → transición simple de estado (sin efecto)
 *   - [fn, fn, ...]             → cadena de procesadores (pipe implícito)
 *   - [fn, fn, ..., "ESTADO"]   → pipe + cambio de estado al final
 *   - fn sola                   → procesador directo (puede devolver nuevo estado)
 *
 * Patrón de modales:
 *   - El estado BORRANDO activa el modal de borrado en la vista.
 *   - El modal emite el evento de resultado y el estado vuelve a ABIERTO o INICIAL.
 */
export const getMaquina: () => Maquina<EstadoDetalleIncidencia, ContextoDetalleIncidencia> = () => {
    return {
        INICIAL: {
            // Cuando llega un nuevo ID (por prop del maestro)
            incidencia_id_cambiado: [cargarContexto],

            // Cuando se deselecciona desde el maestro
            incidencia_deseleccionada: [
                publicar('incidencia_deseleccionada', null),
            ],
        },

        ABIERTO: {
            // Cambio guardado en API (por auto-guardado de useModelo)
            incidencia_guardada: [refrescarIncidencia],

            // Activar modal de borrado
            borrado_solicitado: "BORRANDO",

            // El detalle puede recargar la entidad (ej. tras acción externa)
            incidencia_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            // El modal confirmó el borrado; notifica al maestro y limpia el contexto
            incidencia_borrada: [
                publicar('incidencia_borrada', null),
                "INICIAL",
            ],

            // El modal canceló
            borrado_cancelado: "ABIERTO",
        },
    };
};
