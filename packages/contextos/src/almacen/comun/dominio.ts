import { Filtro } from "@olula/lib/diseño.ts";

export const PALET_ID = "6";

/** Campo de texto vacío. `useModelo` deja en `null` el campo que se borra, aunque su tipo sea `string`. */
export const sinTexto = (s: string | null | undefined): boolean => !s || s.trim() === "";

/** Busca por descripción o código y, con `soloPorLotes`, solo entre los artículos por lotes. */
export const filtroBusquedaArticulo = (texto: string, soloPorLotes = false): Filtro => {
    const porTexto = { or: [["descripcion", "~", texto], ["id", "~", texto]] };
    return (soloPorLotes ? { and: [["por_lotes", "=", "true"], porTexto] } : porTexto) as Filtro;
};
