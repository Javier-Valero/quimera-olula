import { serializarParams } from "./serializarParams";

// Salidas obtenidas con `$.param` de jQuery 3.7.1 antes de eliminar la dependencia
describe("serializarParams (equivalente a $.param)", () => {
  test("parámetros de consulta habituales de la API", () => {
    const params = {
      fields: "id,nombre",
      filter: JSON.stringify(["and", ["nombre", "like", "a b&c"]]),
      page: JSON.stringify({ limit: 50, next: 2 }),
    };
    expect(serializarParams(params)).toBe(
      "fields=id%2Cnombre&filter=%5B%22and%22%2C%5B%22nombre%22%2C%22like%22%2C%22a%20b%26c%22%5D%5D&page=%7B%22limit%22%3A50%2C%22next%22%3A2%7D",
    );
  });

  test("arrays", () => {
    expect(serializarParams({ order: ["nombre", "-fecha"], fields: ["a", "b"] })).toBe(
      "order%5B%5D=nombre&order%5B%5D=-fecha&fields%5B%5D=a&fields%5B%5D=b",
    );
    expect(serializarParams({ "a[]": [1, 2], anidado: [[1, 2], [3]] })).toBe(
      "a%5B%5D=1&a%5B%5D=2&anidado%5B0%5D%5B%5D=1&anidado%5B0%5D%5B%5D=2&anidado%5B1%5D%5B%5D=3",
    );
  });

  test("objetos anidados y valores vacíos", () => {
    expect(
      serializarParams({ extra: { a: 1, b: { c: [1, { d: "x" }] } }, vacio: null, indefinido: undefined, cero: 0, falso: false }),
    ).toBe("extra%5Ba%5D=1&extra%5Bb%5D%5Bc%5D%5B%5D=1&extra%5Bb%5D%5Bc%5D%5B1%5D%5Bd%5D=x&vacio=&indefinido=&cero=0&falso=false");
  });

  test("caracteres especiales y funciones", () => {
    expect(serializarParams({ texto: "ñandú €/ ?=", fn: () => "f" })).toBe(
      "texto=%C3%B1and%C3%BA%20%E2%82%AC%2F%20%3F%3D&fn=f",
    );
  });

  test("array de {name, value} y vacío", () => {
    expect(serializarParams([{ name: "x", value: "1" }, { name: "y", value: null }])).toBe("x=1&y=");
    expect(serializarParams({})).toBe("");
  });
});
