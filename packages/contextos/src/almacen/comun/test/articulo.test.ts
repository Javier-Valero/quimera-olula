import { describe, expect, it } from "vitest";
import { filtroBusquedaArticulo } from "../dominio.ts";

describe("selector de artículo: filtro de búsqueda", () => {
    it("busca por descripción o código", () => {
        expect(filtroBusquedaArticulo("planta"))
            .toEqual({ or: [["descripcion", "~", "planta"], ["id", "~", "planta"]] });
    });

    it("con soloPorLotes, solo entre los artículos por lotes", () => {
        expect(filtroBusquedaArticulo("planta", true)).toEqual({
            and: [["por_lotes", "=", "true"], { or: [["descripcion", "~", "planta"], ["id", "~", "planta"]] }],
        });
    });
});
