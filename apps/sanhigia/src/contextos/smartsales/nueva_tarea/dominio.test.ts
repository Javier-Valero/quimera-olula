import { FormularioTarea } from "./diseño.ts";
import { erroresFormulario, opcionesMotivoTarea, sugerenciasVisibles, tareaParaAPI, tituloTarea } from "./dominio.ts";

const formulario = (datos: Partial<FormularioTarea> = {}): FormularioTarea => ({
    cliente: { codigo: "000123", nombre: "Clínica Dental ABC" },
    tratoSinCliente: null,
    titulo: "",
    tituloManual: false,
    idTrato: null,
    tipo: "Cita",
    fecha: "2026-10-30",
    hora: "10:30",
    idMotivo: "2",
    producto: null,
    nota: "",
    ...datos,
});

const motivos = [{ id: "2", descripcion: "Presentación", activo: true }];

describe("erroresFormulario", () => {
    test("exige cliente y limita la nota a 1000 caracteres", () => {
        expect(erroresFormulario(formulario())).toEqual([]);
        expect(erroresFormulario(formulario({ cliente: null }))).toEqual(["Elige un cliente"]);
        expect(erroresFormulario(formulario({ nota: "x".repeat(1001) }))).toHaveLength(1);
    });

    test("desde un trato sin cliente no se pide cliente", () => {
        const tratoSinCliente = { id: "74793", titulo: "pruebas", contacto: "Contacto de prueba" };
        expect(erroresFormulario(formulario({ cliente: null, tratoSinCliente }))).toEqual([]);
    });
});

describe("título escrito por el comercial", () => {
    test("se usa en lugar del automático y es obligatorio", () => {
        const escrito = formulario({ titulo: "  Llevar catálogo nuevo  ", tituloManual: true });
        expect(tituloTarea(escrito, motivos)).toBe("Llevar catálogo nuevo");
        expect(tareaParaAPI(escrito, motivos).titulo).toBe("Llevar catálogo nuevo");
        expect(erroresFormulario(formulario({ titulo: " ", tituloManual: true }))).toEqual(["Indica el título"]);
        expect(erroresFormulario(formulario({ titulo: "x".repeat(101), tituloManual: true }))).toEqual([
            "El título no puede pasar de 100 caracteres",
        ]);
    });

    test("mientras no se escribe, el título vacío no es un error porque se usa el automático", () => {
        expect(erroresFormulario(formulario())).toEqual([]);
        expect(tareaParaAPI(formulario(), motivos).titulo).toBe("Visita · Clínica Dental ABC · Presentación");
    });
});

describe("tituloTarea en un trato sin cliente", () => {
    test("usa el contacto del trato o, si no lo tiene, su título", () => {
        const tratoSinCliente = { id: "74793", titulo: "pruebas", contacto: "Contacto de prueba" };
        expect(tituloTarea(formulario({ cliente: null, tratoSinCliente, tipo: "Llamada" }), motivos)).toBe(
            "Llamada · Contacto de prueba · Presentación"
        );
        expect(tituloTarea(formulario({ cliente: null, tratoSinCliente: { ...tratoSinCliente, contacto: null }, idMotivo: null }), motivos)).toBe(
            "Visita · pruebas"
        );
    });
});

describe("tareaParaAPI", () => {
    test("el título junta tipo, cliente y motivo, y Cita se llama Visita", () => {
        expect(tituloTarea(formulario(), motivos)).toBe("Visita · Clínica Dental ABC · Presentación");
    });

    test("manda el producto en el campo de su nivel y la hora con segundos", () => {
        const api = tareaParaAPI(
            formulario({ producto: { tipo: "subfamilia", codigo: "PTE", descripcion: "PTE" } }),
            motivos
        );
        expect(api).toMatchObject({
            hora: "10:30:00",
            idmotivo: 2,
            referencia: null,
            codfamilia: null,
            codsubfamilia: "PTE",
        });
    });
});

describe("sugerenciasVisibles", () => {
    test("por defecto solo las de afinidad superior al 70 %", () => {
        const sugerencias = [
            { codSubfamilia: "A", descripcion: "A", score: 0.92 },
            { codSubfamilia: "B", descripcion: "B", score: 0.7 },
        ];
        expect(sugerenciasVisibles(sugerencias, false).map((s) => s.codSubfamilia)).toEqual(["A"]);
        expect(sugerenciasVisibles(sugerencias, true)).toHaveLength(2);
    });
});

describe("opcionesMotivoTarea", () => {
    const todos = [
        { id: "1", descripcion: "Presentación", activo: true },
        { id: "2", descripcion: "Seguimiento", activo: false },
    ];

    test("al crear solo se ofrecen los motivos activos", () => {
        expect(opcionesMotivoTarea(todos)).toEqual([{ valor: "1", descripcion: "Presentación" }]);
    });

    test("al editar, el motivo desactivado de la tarea sigue con su nombre", () => {
        expect(opcionesMotivoTarea(todos, "2")).toEqual([
            { valor: "1", descripcion: "Presentación" },
            { valor: "2", descripcion: "Seguimiento (inactivo)" },
        ]);
        expect(opcionesMotivoTarea(todos, "9")).toContainEqual({ valor: "9", descripcion: "Motivo 9 (inactivo)" });
    });
});
