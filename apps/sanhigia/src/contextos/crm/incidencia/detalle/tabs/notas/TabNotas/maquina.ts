import { Maquina } from "@olula/lib/diseño.js";
import { ContextoNotas, EstadoNotas } from "./diseño.ts";
import { cargarNotas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoNotas, ContextoNotas> = () => {
    return {
        lista: {
            cargar_notas: cargarNotas,
            crear_nota_solicitado: "creando",
        },
        creando: {
            nota_creada: [cargarNotas, "lista"],
            creacion_nota_cancelada: "lista",
        },
    }
}
