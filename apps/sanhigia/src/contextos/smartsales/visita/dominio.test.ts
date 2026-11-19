import { ContextoVisita, TareaVisita } from "./diseño.ts";
import {
    cambiarProceso,
    contextoInicial,
    destinoAlTerminar,
    erroresFinalizacion,
    erroresPerdida,
    estadoSegunTarea,
    finalizacionParaAPI,
    puedeGenerarSiguiente,
} from "./dominio.ts";

const tarea = (datos: Partial<TareaVisita> = {}): TareaVisita => ({
    id: "7",
    titulo: "Visita",
    tipo: "Cita",
    fecha: "2026-10-28",
    hora: "10:00:00",
    completada: false,
    enCurso: false,
    fechaInicio: null,
    horaInicio: null,
    posicionInicio: null,
    nota: "",
    idTrato: "40",
    codCliente: "000123",
    nombreCliente: "Clínica",
    interlocutor: null,
    ...datos,
});

const contexto = (datos: Partial<ContextoVisita> = {}): ContextoVisita => ({
    ...contextoInicial,
    estado: "FINALIZANDO",
    tarea: tarea(),
    horaFin: "11:15",
    ...datos,
});

describe("estadoSegunTarea", () => {
    test("pendiente, en curso o terminada según la tarea", () => {
        expect(estadoSegunTarea(tarea())).toBe("PENDIENTE");
        expect(estadoSegunTarea(tarea({ enCurso: true }))).toBe("EN_CURSO");
        expect(estadoSegunTarea(tarea({ completada: true }))).toBe("TERMINADA");
    });
});

describe("validaciones", () => {
    test("la finalización exige hora y limita la nota", () => {
        expect(erroresFinalizacion(contexto())).toEqual([]);
        expect(erroresFinalizacion(contexto({ horaFin: "" }))).toHaveLength(1);
        expect(erroresFinalizacion(contexto({ nota: "x".repeat(1001) }))).toHaveLength(1);
    });

    test("marcar el trato como perdido exige causa", () => {
        expect(erroresPerdida(contexto({ estadoTrato: "Perdido" }))).toEqual(["Indica la causa de la pérdida"]);
        expect(erroresPerdida(contexto({ estadoTrato: "Perdido", idCausa: "3" }))).toEqual([]);
    });
});

describe("finalizacionParaAPI", () => {
    test("usa la fecha de inicio de la visita y la hora de fin con segundos", () => {
        const api = finalizacionParaAPI(
            contexto({ tarea: tarea({ fechaInicio: "2026-10-27" }), interlocutor: "C001" }),
            { latitud: 41.6, longitud: -0.9 },
            new Date(2026, 9, 28)
        );
        expect(api).toEqual({
            completada: true,
            fechafin: "2026-10-27",
            horafin: "11:15:00",
            latitudfin: 41.6,
            longitudfin: -0.9,
            nota: "",
            interlocutor: "C001",
        });
    });
});

describe("siguiente tarea", () => {
    test("no se puede generar si el siguiente paso es crear pedido, y elegirlo la desmarca", async () => {
        expect(puedeGenerarSiguiente(contexto({ siguientePaso: "pedido" }))).toBe(false);
        expect(puedeGenerarSiguiente(contexto({ siguientePaso: "presupuesto" }))).toBe(true);
        const ctx = (await cambiarProceso(contexto({ generarSiguiente: true }), { siguientePaso: "pedido" })) as ContextoVisita;
        expect(ctx.generarSiguiente).toBe(false);
    });
});

describe("destinoAlTerminar", () => {
    test("el presupuesto o pedido creado lleva a su ficha para añadir líneas", () => {
        expect(destinoAlTerminar(contexto({ documentoCreado: { tipo: "pedido", id: "88" } }))).toBe("/ventas/pedidos/88");
        expect(destinoAlTerminar(contexto({ documentoCreado: { tipo: "presupuesto", id: "12" } }))).toBe("/ventas/presupuestos/12");
    });

    test("generar la siguiente tarea va antes que el documento creado", () => {
        expect(
            destinoAlTerminar(contexto({ documentoCreado: { tipo: "presupuesto", id: "12" }, generarSiguiente: true }))
        ).toBe("/ss/mi-tarea/nueva?cliente=000123&trato=40");
    });

    test("lo que no se resuelve en la visita se termina en la ficha del trato", () => {
        expect(destinoAlTerminar(contexto({ accionEnFicha: "ganar" }))).toBe("/ss/mi-trato/40?accion=ganar");
        expect(destinoAlTerminar(contexto({ accionEnFicha: "presupuesto" }))).toBe("/ss/mi-trato/40?accion=presupuesto");
    });

    test("elegir un siguiente paso sin llegar a crear el documento no cambia el destino", () => {
        expect(destinoAlTerminar(contexto({ siguientePaso: "pedido" }))).toBe("/ss/mi-agenda");
    });

    test("generar siguiente tarea precarga cliente y, si sigue abierto, el trato", () => {
        expect(destinoAlTerminar(contexto({ generarSiguiente: true }))).toBe("/ss/mi-tarea/nueva?cliente=000123&trato=40");
        expect(destinoAlTerminar(contexto({ generarSiguiente: true, tratoCerrado: true }))).toBe(
            "/ss/mi-tarea/nueva?cliente=000123"
        );
    });

    test("si no, vuelve a la agenda", () => {
        expect(destinoAlTerminar(contexto())).toBe("/ss/mi-agenda");
    });
});
