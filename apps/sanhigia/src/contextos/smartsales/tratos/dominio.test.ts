import { FiltrosTratos, FormularioTrato, TratoListaAPI } from "./diseño.ts";
import { debePreguntarAsociar, erroresTrato, filtroTratos, origenTrato, totalesDesdeAPI, totalSegunEstado, tratoParaAPI } from "./dominio.ts";

const trato = (datos: Partial<TratoListaAPI> = {}): TratoListaAPI => ({
    idtrato: 1,
    titulo: "Trato",
    nombrecliente: null,
    nombrecontacto: null,
    valor: 0,
    estado: "-",
    fecha: null,
    idcampania: null,
    idtipotrato: 3,
    cuentamarketing: null,
    ...datos,
});

const filtrosVacios: FiltrosTratos = {
    agente: null,
    estado: "todos",
    titulo: "",
    contacto: "",
    codCliente: "",
    cifNif: "",
    desde: "",
    hasta: "",
};

describe("origenTrato", () => {
    test("farma por tipo, campaña del comercial o de marketing por cuenta", () => {
        expect(origenTrato(trato({ idtipotrato: 9 }), "9")).toBe("farma");
        expect(origenTrato(trato({ idcampania: 5, cuentamarketing: "sanhigia" }), "9")).toBe("mkt");
        expect(origenTrato(trato({ idcampania: 5, cuentamarketing: "comercial" }), "9")).toBe("campaña");
        expect(origenTrato(trato(), "9")).toBeNull();
    });
});

describe("filtroTratos", () => {
    test("sin filtros no manda nada", () => {
        expect(filtroTratos(filtrosVacios)).toBeUndefined();
    });

    test("el agente incluye los tratos en los que es observador", () => {
        expect(filtroTratos({ ...filtrosVacios, agente: "A1", estado: "abiertos" })).toEqual({
            and: [{ or: [["codagente", "eq", "A1"], ["codagenteobservador", "eq", "A1"]] }, ["estado", "eq", "-"]],
        });
    });

    test("los contadores se piden sin el filtro de estado", () => {
        expect(filtroTratos({ ...filtrosVacios, estado: "ganados" }, false)).toBeUndefined();
    });
});

describe("totales", () => {
    test("abiertos es el total menos ganados y perdidos", () => {
        expect(totalesDesdeAPI({ total: 10, ganados: 3, perdidos: 2 })).toEqual({ abiertos: 5, ganados: 3, perdidos: 2 });
    });
});

test("totalSegunEstado da el total de la lista para el estado filtrado", () => {
    const totales = { abiertos: 5063, ganados: 700, perdidos: 257 };
    expect(totalSegunEstado(totales, "abiertos")).toBe(5063);
    expect(totalSegunEstado(totales, "perdidos")).toBe(257);
    expect(totalSegunEstado(totales, "todos")).toBe(6020);
});

describe("alta de trato", () => {
    const formulario: FormularioTrato = {
        titulo: " PTE para Clínica ",
        cliente: { codigo: "000123", nombre: "Clínica" },
        contacto: null,
        idTipoTrato: "4",
        valor: 0,
        familias: [{ codfamilia: "BIO", descripcion: "Biomateriales" }],
        producto: { tipo: "subfamilia", codigo: "PTE", descripcion: "PTE" },
    };
    const contacto = { codigo: "C9", nombre: "Ana" };

    test("valida título, cliente o contacto y tipo", () => {
        expect(erroresTrato(formulario)).toEqual([]);
        expect(erroresTrato({ ...formulario, titulo: "", cliente: null, idTipoTrato: null })).toEqual([
            "Indica el título",
            "Elige un cliente o un contacto",
            "Elige el tipo de trato",
        ]);
    });

    test("basta con el contacto, sin cliente", () => {
        expect(erroresTrato({ ...formulario, cliente: null, contacto })).toEqual([]);
    });

    test("un trato farma exige cliente, contacto y permiso, como en legacy", () => {
        const farma = { ...formulario, idTipoTrato: "7" };
        expect(erroresTrato(farma, "7")).toEqual(["Elige un contacto: este tipo de trato lo exige"]);
        expect(erroresTrato({ ...farma, cliente: null, contacto }, "7")).toEqual(["Elige un cliente: este tipo de trato lo exige"]);
        expect(erroresTrato({ ...farma, contacto }, "7", false)).toEqual(["No tienes permisos para usar este tipo de trato"]);
        expect(erroresTrato({ ...farma, contacto }, "7")).toEqual([]);
    });

    test("tras crear el trato se pregunta por asociar el contacto si no está en la lista, salvo a Marketing", () => {
        expect(debePreguntarAsociar("Comerciales", false)).toBe(true);
        expect(debePreguntarAsociar("Comerciales", true)).toBe(false);
        expect(debePreguntarAsociar("MKT", false)).toBe(false);
        expect(debePreguntarAsociar("Responsable de marketing", false)).toBe(false);
    });

    test("manda el contacto y, sin cliente, codcliente vacío", () => {
        expect(tratoParaAPI({ ...formulario, cliente: null, contacto }, "A1")).toMatchObject({ codcliente: null, codcontacto: "C9" });
    });

    test("manda las familias como en legacy y el producto en su campo", () => {
        const ahora = new Date(2026, 10, 19, 9, 7, 5);
        expect(tratoParaAPI(formulario, "A1", ahora)).toEqual({
            codagente: "A1",
            estado: "-",
            estadoasigagente: "Publicado",
            fecha: "2026-11-19",
            horaalta: "09:07:05",
            titulo: "PTE para Clínica",
            codcliente: "000123",
            codcontacto: null,
            idtipotrato: 4,
            valor: 0,
            familias: '{"codfamilia":"BIO","descripcion":"Biomateriales"}',
            referencia: null,
            codfamilia: null,
            codsubfamilia: "PTE",
        });
    });

    test("sin agente propio manda codagente vacío para que el backend asigne el del cliente", () => {
        expect(tratoParaAPI(formulario, "").codagente).toBeNull();
    });
});
