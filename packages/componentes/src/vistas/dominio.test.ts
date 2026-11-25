import { ColumnaCatalogo } from "./diseño.ts";
import {
  aplicarAcciones,
  aplicarColumnas,
  aplicarTarjeta,
  configTablaDesdeVisibles,
  modoDeVista,
  ordenPorDefecto,
} from "./dominio.ts";

const catalogo: ColumnaCatalogo[] = [
  { id: "codigo" },
  { id: "fecha" },
  { id: "cliente" },
  { id: "total" },
  { id: "observaciones", oculta: true },
];

const ids = (columnas: { id: string }[]) => columnas.map((c) => c.id);

describe("aplicarColumnas", () => {
  test("sin configuración, las del catálogo que no son ocultas", () => {
    expect(ids(aplicarColumnas(catalogo))).toEqual(["codigo", "fecha", "cliente", "total"]);
  });

  test("respeta el orden y las ocultas del usuario", () => {
    const config = {
      columnas: ["total", "codigo"],
      ocultas: ["fecha", "cliente", "observaciones"],
    };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["total", "codigo"]);
  });

  test("una columna oculta por defecto se ve si el usuario la eligió", () => {
    const config = { columnas: ["observaciones", "codigo"], ocultas: [] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual([
      "observaciones",
      "codigo",
      "fecha",
      "cliente",
      "total",
    ]);
  });

  test("ignora ids que ya no están en el catálogo", () => {
    const config = {
      columnas: ["codigo", "borrada", "total"],
      ocultas: ["fecha", "cliente", "observaciones"],
    };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo", "total"]);
  });

  test("una columna nueva visible sale detrás de la que le precede en el catálogo", () => {
    // `cliente` no estaba cuando el usuario guardó.
    const config = { columnas: ["fecha", "codigo", "total"], ocultas: ["observaciones"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual([
      "fecha",
      "cliente",
      "codigo",
      "total",
    ]);
  });

  test("una columna nueva sin predecesora colocada va al principio", () => {
    const config = { columnas: ["total"], ocultas: ["fecha", "cliente", "observaciones"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo", "total"]);
  });

  test("una columna nueva oculta por defecto no aparece", () => {
    const config = { columnas: ["codigo"], ocultas: ["fecha", "cliente", "total"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo"]);
  });

  test("conserva el resto de propiedades de la columna", () => {
    const conCabecera = [{ id: "codigo", cabecera: "Código" }];
    expect(aplicarColumnas(conCabecera, { columnas: ["codigo"] })).toEqual(conCabecera);
  });
});

describe("configTablaDesdeVisibles", () => {
  test("lo no elegido pasa a ocultas y se conserva el orden guardado", () => {
    expect(
      configTablaDesdeVisibles(catalogo, ["total", "codigo", "borrada"], {
        columnas: [],
        orden: ["fecha", "DESC"],
      })
    ).toEqual({
      columnas: ["total", "codigo"],
      ocultas: ["fecha", "cliente", "observaciones"],
      orden: ["fecha", "DESC"],
    });
  });

  test("ida y vuelta con aplicarColumnas", () => {
    const config = configTablaDesdeVisibles(catalogo, ["cliente", "fecha"]);
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["cliente", "fecha"]);
  });
});

describe("aplicarAcciones", () => {
  const acciones = [
    { id: "albaranar", texto: "Albarán parcial" },
    { id: "imprimir", texto: "Imprimir" },
    { texto: "Sin id" },
    { id: "borrar", texto: "Borrar" },
  ];
  const textos = (lista: { texto: string }[]) => lista.map((a) => a.texto);

  test("sin prioridad, el orden del código", () => {
    expect(aplicarAcciones(acciones)).toBe(acciones);
    expect(aplicarAcciones(acciones, [])).toBe(acciones);
  });

  test("ordena por la prioridad guardada; las sin id siguen a su predecesora", () => {
    expect(textos(aplicarAcciones(acciones, ["imprimir", "borrar", "albaranar"]))).toEqual([
      "Imprimir",
      "Sin id",
      "Borrar",
      "Albarán parcial",
    ]);
  });

  test("las nuevas y las desconocidas", () => {
    // `borrar` es nueva (no está en la prioridad) y `vieja` ya no existe.
    expect(textos(aplicarAcciones(acciones, ["vieja", "imprimir", "albaranar"]))).toEqual([
      "Imprimir",
      "Sin id",
      "Borrar",
      "Albarán parcial",
    ]);
  });
});

describe("aplicarTarjeta", () => {
  test("quita los huecos con ids que ya no existen", () => {
    expect(
      aplicarTarjeta(catalogo, {
        titulo: "cliente",
        subtitulo: "borrada",
        etiqueta: "fecha",
        campos: ["total", "borrada"],
      })
    ).toEqual({ titulo: "cliente", subtitulo: undefined, etiqueta: "fecha", campos: ["total"] });
  });

  test("sin configuración, undefined", () => {
    expect(aplicarTarjeta(catalogo)).toBeUndefined();
  });
});

describe("orden y modo", () => {
  test("la ordenación guardada manda sobre la del código", () => {
    expect(ordenPorDefecto({ tabla: { columnas: [], orden: ["total", "ASC"] } }, ["fecha", "DESC"]))
      .toEqual(["total", "ASC"]);
    expect(ordenPorDefecto(undefined, ["fecha", "DESC"])).toEqual(["fecha", "DESC"]);
  });

  test("el modo guardado solo si la pantalla lo admite", () => {
    expect(modoDeVista({ modo: "tarjetas" }, ["tabla", "tarjetas"], "tabla")).toBe("tarjetas");
    expect(modoDeVista({ modo: "kanban" }, ["tabla", "tarjetas"], "tabla")).toBe("tabla");
    expect(modoDeVista(undefined, ["tabla"])).toBeUndefined();
  });
});
