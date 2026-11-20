import { Tarea } from "../comun/diseño.ts";
import { sumarDias, tareaAtrasada } from "../comun/dominio.ts";
import { FiltroTareasRango } from "../tareas/diseño.ts";
import { TareasHoy } from "./diseño.ts";

const momento = (tarea: Tarea) => `${tarea.fecha}T${tarea.hora ?? "00:00"}`;

const porMomento = (a: Tarea, b: Tarea) => momento(a).localeCompare(momento(b));

export const separarTareasHoy = (tareas: Tarea[], hoy: string): TareasHoy => ({
    deHoy: tareas.filter((t) => t.fecha === hoy).sort(porMomento),
    anteriores: tareas.filter((t) => t.fecha < hoy).sort(porMomento),
});

// Atrasadas de días anteriores que se tienen en cuenta: las de los últimos DIAS_ATRASADAS días.
// Las anteriores ("antiguas") solo se cuentan y se ven aparte. Pendiente de confirmar con Jesús.
export const DIAS_ATRASADAS = 90;

export const filtrosAtrasadas = (hoy: string, agente: string | null): { recientes: FiltroTareasRango; antiguas: FiltroTareasRango } => {
    const ayer = sumarDias(hoy, -1);
    const ultimaAntigua = sumarDias(hoy, -DIAS_ATRASADAS - 1);
    return {
        recientes: { desde: ayer, hasta: ayer, agente, conAtrasadas: true, atrasadasDesde: sumarDias(hoy, -DIAS_ATRASADAS) },
        antiguas: { desde: ultimaAntigua, hasta: ultimaAntigua, agente, conAtrasadas: true },
    };
};

export const contarAtrasadas =(tareas: Tarea[], ahora: Date = new Date()): number =>
    tareas.filter((tarea) => tareaAtrasada(tarea, ahora)).length;

export const saludo = (ahora: Date = new Date()): string => {
    const hora = ahora.getHours();
    if (hora < 14) return "Buenos días";
    if (hora < 21) return "Buenas tardes";
    return "Buenas noches";
};
