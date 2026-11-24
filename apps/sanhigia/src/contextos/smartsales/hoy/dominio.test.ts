import { Tarea } from "../comun/diseño.ts";
import { contarAtrasadas, filtrosAtrasadas, separarTareasHoy } from "./dominio.ts";

describe("filtrosAtrasadas", () => {
    test("recientes: de hace 90 días a ayer; antiguas: hasta el día 91 hacia atrás", () => {
        const { recientes, antiguas } = filtrosAtrasadas("2026-11-21", "13");
        expect(recientes).toEqual({
            desde: "2026-11-20",
            hasta: "2026-11-20",
            agente: "13",
            conAtrasadas: true,
            atrasadasDesde: "2026-08-23",
        });
        expect(antiguas).toEqual({ desde: "2026-08-22", hasta: "2026-08-22", agente: "13", conAtrasadas: true });
    });

    test("cruza el cambio de año", () => {
        expect(filtrosAtrasadas("2026-01-01", null).recientes).toMatchObject({ hasta: "2025-12-31", atrasadasDesde: "2025-10-03" });
    });
});

const tarea = (id: string, fecha: string, hora: string | null): Tarea => ({
    id,
    titulo: id,
    fecha,
    hora,
    tipo: "Cita",
    completada: false,
    enCurso: false,
    nombreCliente: null,
    nombreContacto: null,
    codCliente: null,
});

describe("separarTareasHoy", () => {
    test("primero las de hoy por hora y aparte las de días anteriores", () => {
        const { deHoy, anteriores } = separarTareasHoy(
            [
                tarea("hoy-tarde", "2026-10-28", "17:00:00"),
                tarea("ayer", "2026-10-27", "09:00:00"),
                tarea("hoy-mañana", "2026-10-28", "09:00:00"),
                tarea("antes", "2026-10-20", "12:00:00"),
            ],
            "2026-10-28"
        );

        expect(deHoy.map((t) => t.id)).toEqual(["hoy-mañana", "hoy-tarde"]);
        expect(anteriores.map((t) => t.id)).toEqual(["antes", "ayer"]);
    });
});

describe("contarAtrasadas", () => {
    test("cuenta las de hoy pasadas de hora y las de días anteriores", () => {
        const ahora = new Date(2026, 9, 28, 12, 0);
        expect(
            contarAtrasadas(
                [
                    tarea("1", "2026-10-28", "10:00:00"),
                    tarea("2", "2026-10-28", "13:00:00"),
                    tarea("3", "2026-10-27", "18:00:00"),
                ],
                ahora
            )
        ).toBe(2);
    });
});
