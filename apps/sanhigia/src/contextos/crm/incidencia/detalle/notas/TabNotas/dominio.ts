import { ProcesarContexto } from "@olula/lib/diseño.js";
import { getNotas } from "../../../infraestructura.ts";
import { ContextoNotas, EstadoNotas } from "./diseño.ts";

type ProcesarNotas = ProcesarContexto<EstadoNotas, ContextoNotas>;

export const cargarNotas: ProcesarNotas = async (contexto, payload) => {
    const incidenciaId = (payload as string) || contexto.incidenciaId;
    const resultado = await getNotas(incidenciaId, { limite: 50, pagina: 1 });
    return {
        ...contexto,
        notas: resultado.datos,
        incidenciaId,
        cargando: false,
    }
}
