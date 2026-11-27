import { describe, expect, it } from "vitest";
import { Lote, NuevoLote } from "../diseño.ts";
import { cambiosLote, loteVacio, nuevoLoteVacio, validarLote, validarNuevoLote } from "../dominio.ts";
import { cambiosLoteAApi, loteDesdeApi, nuevoLoteAApi } from "../infraestructura.ts";

const nuevo = (cambios: Partial<NuevoLote> = {}): NuevoLote => ({
    ...nuevoLoteVacio, id: "L00001", sku: "PLANTA", porLotes: true, ...cambios,
});

const lote = (cambios: Partial<Lote> = {}): Lote => ({
    ...loteVacio(), id: "L00001", sku: "PLANTA", caducidad: "2027-01-31", almacenId: "FIN1",
    fechaDisponible: "2026-12-01", ...cambios,
});

describe("lote: alta", () => {
    it("pide código, artículo por lotes y, con almacén, el almacén", () => {
        expect(validarNuevoLote(nuevo(), false)).toBe(true);
        expect(validarNuevoLote(nuevo({ id: "  " }), false)).toBe("El código es obligatorio");
        expect(validarNuevoLote(nuevo({ id: "X".repeat(31) }), false))
            .toBe("El código admite como máximo 30 caracteres");
        expect(validarNuevoLote(nuevo({ sku: "" }), false)).toBe("El artículo es obligatorio");
        expect(validarNuevoLote(nuevo({ porLotes: false }), false)).toBe("El artículo no se gestiona por lotes");
        expect(validarNuevoLote(nuevo(), true)).toBe("El almacén es obligatorio");
        expect(validarNuevoLote(nuevo({ almacenId: "FIN1" }), true)).toBe(true);
    });

    it("manda a la API solo lo que hay (sin almacén ni fecha si están vacíos)", () => {
        expect(nuevoLoteAApi(nuevo({ id: " L00001 " }))).toEqual({
            id: "L00001", articulo_id: "PLANTA", caducidad: null,
        });
        expect(nuevoLoteAApi(nuevo({ caducidad: "2027-01-31", almacenId: "FIN1", fechaDisponible: "2026-12-01" })))
            .toEqual({
                id: "L00001", articulo_id: "PLANTA", caducidad: "2027-01-31",
                almacen_id: "FIN1", fecha_disponible: "2026-12-01",
            });
    });
});

describe("lote: ficha", () => {
    it("lee almacén y fecha disponible (lascunas)", () => {
        const leido = loteDesdeApi({
            id: "L00001", sku: "PLANTA", caducidad: null, almacen_id: "FIN1", fecha_disponible: "2026-12-01",
        });
        expect(leido.almacenId).toBe("FIN1");
        expect(leido.fechaDisponible).toBe("2026-12-01");
    });

    it("con almacén no se puede dejar sin él", () => {
        expect(validarLote(lote({ almacenId: "" }), true)).toBe("El almacén es obligatorio");
        expect(validarLote(lote({ almacenId: "" }), false)).toBe(true);
    });

    it("solo cambia lo que se ha tocado; sin almacén, ni almacén ni fecha", () => {
        const anterior = lote();
        expect(cambiosLote(anterior, anterior, true)).toEqual({});
        expect(cambiosLote(anterior, lote({ caducidad: "" }), true)).toEqual({ caducidad: "" });
        expect(cambiosLote(anterior, lote({ almacenId: "FIN2", fechaDisponible: "2026-12-15" }), true))
            .toEqual({ almacenId: "FIN2", fechaDisponible: "2026-12-15" });
        expect(cambiosLote(anterior, lote({ almacenId: "FIN2" }), false)).toEqual({});
    });

    it("un valor vacío se manda a la API como null (lo quita)", () => {
        expect(cambiosLoteAApi({ caducidad: "" })).toEqual({ caducidad: null });
        expect(cambiosLoteAApi({ almacenId: "FIN2", fechaDisponible: "2026-12-15" }))
            .toEqual({ almacen_id: "FIN2", fecha_disponible: "2026-12-15" });
    });
});
