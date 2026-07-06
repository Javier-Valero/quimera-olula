import { Maquina } from "@olula/lib/diseño.js";
import { ContextoNotas, EstadoNotas } from "./diseño.ts";
import { cargarNotas, crearNota } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoNotas, ContextoNotas> = () => {
    return {
        lista: {
            cargar_notas: cargarNotas,
            crear_nota: crearNota,
        },
        creando: {
            crear_nota: crearNota,
        },
    }
}
