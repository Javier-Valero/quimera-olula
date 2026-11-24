import { MesGrafico, MesHistorico } from "./diseño.ts";
import {
    añoDelPeriodo,
    familiaDesdeAPI,
    historicoDesdeAPI,
    maximoHistorico,
    mesesConObjetivoPendiente,
    mesInicial,
    parametrosPeriodo,
    periodoCompleto,
    resumenMes,
    textoVariacion,
    variacion,
} from "./dominio.ts";

describe("parametrosPeriodo", () => {
    test("los trimestres van con su año y una marca por trimestre", () => {
        expect(
            parametrosPeriodo(
                {
                    tipo: "trimestres",
                    trimestres: [
                        { año: 2025, numero: 1 },
                        { año: 2025, numero: 3 },
                    ],
                },
                "A1"
            )
        ).toEqual({ codAgente: "A1", customDates: false, anio: 2025, T1: true, T2: false, T3: true, T4: false });
    });

    test("las fechas concretas van como customDates y sin agente se piden todos", () => {
        expect(parametrosPeriodo({ tipo: "fechas", desde: "2026-01-15", hasta: "2026-02-15" }, null)).toEqual({
            codAgente: "TODOS",
            customDates: true,
            dateFrom: "2026-01-15",
            dateTo: "2026-02-15",
        });
    });
});

test("un periodo está completo con algún trimestre o con fechas ordenadas", () => {
    expect(periodoCompleto({ tipo: "trimestres", trimestres: [] })).toBe(false);
    expect(periodoCompleto({ tipo: "fechas", desde: "2026-03-01", hasta: "2026-01-01" })).toBe(false);
    expect(periodoCompleto({ tipo: "fechas", desde: "2026-01-01", hasta: "2026-03-01" })).toBe(true);
});

test("el año del gráfico es el del periodo elegido", () => {
    expect(añoDelPeriodo({ tipo: "trimestres", trimestres: [{ año: 2024, numero: 2 }] })).toBe(2024);
    expect(añoDelPeriodo({ tipo: "fechas", desde: "2025-05-01", hasta: "2025-06-01" })).toBe(2025);
});

test("la variación es respecto al año anterior y sin ventas anteriores no hay", () => {
    expect(variacion(112, 100)).toBeCloseTo(12);
    expect(variacion(100, 0)).toBeNull();
    expect(textoVariacion(12)).toBe("+12.0 %");
    expect(textoVariacion(null)).toBe("—");
});

test("el histórico se lee por mes y la escala cubre ventas, previsión y lo necesario", () => {
    const meses = historicoDesdeAPI({
        meses: ["2026-01", "2026-02", "2026-03"],
        ventas: [100, null, null],
        objetivo: [150, 150, 150],
        prevision: [null, 200, null],
    });
    expect(meses[1]).toEqual({ mes: "2026-02", ventas: null, objetivo: 150, prevision: 200 });
    expect(maximoHistorico(mesesConObjetivoPendiente(meses))).toBe(200);
});

test("una familia sin objetivo queda con objetivo nulo", () => {
    expect(
        familiaDesdeAPI({
            codfamilia: "BIO",
            descripcion: "Biomateriales",
            importe: 500,
            importe_anterior: 0,
            objetivo: null,
            subfamilias: [{ codsubfamilia: "B1", descripcion: "Hueso", importe: 500, importe_anterior: 0 }],
        })
    ).toEqual({
        codigo: "BIO",
        descripcion: "Biomateriales",
        importe: 500,
        importeAnterior: 0,
        objetivo: null,
        subfamilias: [{ codigo: "B1", descripcion: "Hueso", importe: 500, importeAnterior: 0 }],
    });
});

describe("objetivo pendiente del trimestre", () => {
    const trimestre = (ventas: (number | null)[], objetivo = 198000): MesHistorico[] =>
        ventas.map((v, i) => ({ mes: `2026-${10 + i}`, ventas: v, objetivo: objetivo / 3, prevision: null }));
    const necesarios = (meses: MesHistorico[]) => mesesConObjetivoPendiente(meses).map((m) => Math.round(m.necesario));

    test("cada mes necesita lo que queda del trimestre entre los meses que faltan", () => {
        expect(necesarios(trimestre([63000, 45000, null]))).toEqual([66000, 67500, 90000]);
    });

    test("los meses que aún no han llegado se reparten a partes iguales lo que queda", () => {
        expect(necesarios(trimestre([60000, null, null]))).toEqual([66000, 69000, 69000]);
    });

    test("si ya se ha cubierto el objetivo, lo necesario es 0", () => {
        expect(necesarios(trimestre([150000, 60000, null]))).toEqual([66000, 24000, 0]);
    });

    test("cada trimestre empieza de nuevo con su propio objetivo", () => {
        const meses = [...trimestre([0, 0, 0], 90000), ...trimestre([null, null, null], 30000)];
        expect(necesarios(meses)).toEqual([30000, 45000, 90000, 10000, 10000, 10000]);
    });
});

describe("gráfico mensual", () => {
    const mes = (datos: Partial<MesGrafico>): MesGrafico => ({
        mes: "2026-10",
        ventas: null,
        prevision: null,
        necesario: 0,
        objetivoTrimestre: 0,
        ...datos,
    });
    const hoy = new Date(2026, 10, 24);

    test("al entrar se elige el mes actual solo si es del año del gráfico", () => {
        const meses = [mes({ mes: "2026-10" }), mes({ mes: "2026-11" })];
        expect(mesInicial(meses, hoy)).toBe("2026-11");
        expect(mesInicial(meses, new Date(2027, 0, 5))).toBeNull();
    });

    test("muestra lo necesario con el tiempo verbal del mes y el % cubierto", () => {
        const datos = { necesario: 66022, objetivoTrimestre: 198065 };
        expect(resumenMes(mes({ ...datos, ventas: 63039 }), hoy)).toMatch(
            /^Octubre de 2026 · Ventas 63\.039\s€ · Necesitabas 66\.022\s€ \(95 %\)$/
        );
        expect(resumenMes(mes({ ...datos, mes: "2026-11", ventas: 45889 }), hoy)).toMatch(/· Necesitas 66\.022\s€ \(70 %\)$/);
        expect(resumenMes(mes({ ...datos, mes: "2026-12", prevision: 50000 }), hoy)).toMatch(
            /· Previsión 50\.000\s€ · Necesitarás 66\.022\s€ \(76 %\)$/
        );
    });

    test("distingue el trimestre ya cubierto del que no tiene objetivo", () => {
        expect(resumenMes(mes({ ventas: 1000, objetivoTrimestre: 9000 }), hoy)).toMatch(/· Objetivo del trimestre cubierto$/);
        expect(resumenMes(mes({}), hoy)).toMatch(/Sin ventas ni previsión · Sin objetivo$/);
    });
});
