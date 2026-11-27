import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { MetaModelo, plugin } from "@olula/lib/dominio.ts";
import {
    CambiosLote,
    FormEtiquetaLote,
    FormatoEtiquetaLote,
    Lote,
    NuevoLote,
    OpcionesEtiquetaLote,
} from "./diseño.ts";

export const ESTADOS_LOTE = [
    { valor: "PTE", descripcion: "Pendiente" },
    { valor: "TERMINADO", descripcion: "Terminado" },
];

/** Píldora del estado del lote: pendiente de recibir o terminado. */
export const etiquetaEstadoLote = (estado: string | null | undefined): EstadoEtiqueta =>
    estado === "TERMINADO"
        ? { texto: "Terminado", tono: "completado" }
        : estado === "PTE"
            ? { texto: "Pendiente", tono: "pendiente" }
            : { texto: estado || "—", tono: "borrador" };

/** Cantidad en formato español (hasta 3 decimales); vacía si no hay. */
export const formatearCantidad = (valor: number | string | null | undefined): string => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(valor);
    if (Number.isNaN(numero)) return String(valor);
    return numero.toLocaleString("es-ES", { maximumFractionDigits: 3 });
};

/** Fecha de la API ("AAAA-MM-DD") en dd/mm/aaaa, sin pasar por `Date` (sin desfases de zona). */
export const fechaDdMmAaaa = (fecha: string | null | undefined): string => {
    if (!fecha) return "";
    const [a, m, d] = fecha.slice(0, 10).split("-");
    return a && m && d ? `${d}/${m}/${a}` : fecha;
};

export const loteVacio = (): Lote => ({
    id: "", sku: "", articulo: "", caducidad: "", enAlmacen: 0, produccion: null,
    almacenId: "", fechaDisponible: "",
});

/**
 * Si los lotes llevan almacén y fecha disponible: solo con el plugin de trazabilidad de lascunas,
 * que tiene esas columnas (allí el almacén, la finca, es obligatorio). Cuando haya app lascunas en
 * quimera podrá sustituir estos formularios en vez de depender de esta comprobación.
 */
export const conAlmacenYFechaDisponible = (): boolean => plugin("trazabilidad") === "lascunas";

const LONGITUD_CODIGO_LOTE = 30;

/** Alta: código, artículo por lotes y, con almacén, el almacén. `true` o el motivo. */
export const validarNuevoLote = (nuevo: NuevoLote, conAlmacen: boolean): string | true => {
    if (!nuevo.id.trim()) return "El código es obligatorio";
    if (nuevo.id.trim().length > LONGITUD_CODIGO_LOTE) {
        return `El código admite como máximo ${LONGITUD_CODIGO_LOTE} caracteres`;
    }
    if (!nuevo.sku) return "El artículo es obligatorio";
    if (nuevo.porLotes === false) return "El artículo no se gestiona por lotes";
    if (conAlmacen && !nuevo.almacenId) return "El almacén es obligatorio";
    return true;
};

/** Ficha: con almacén, no se puede dejar sin él. */
export const validarLote = (lote: Lote, conAlmacen: boolean): string | true =>
    conAlmacen && !lote.almacenId ? "El almacén es obligatorio" : true;

/** Constante estable (no función) para el formulario de alta. */
export const nuevoLoteVacio: NuevoLote = {
    id: "", sku: "", porLotes: null, caducidad: "", almacenId: "", fechaDisponible: "",
};

export const metaNuevoLote = (conAlmacen: boolean): MetaModelo<NuevoLote> => ({
    campos: {
        id: { requerido: true },
        sku: { requerido: true },
        caducidad: { requerido: false },
        almacenId: { requerido: conAlmacen },
        fechaDisponible: { requerido: false },
    },
    validacion: (nuevo) => validarNuevoLote(nuevo, conAlmacen),
});

/** Ficha del lote: solo caducidad y, con almacén, almacén y fecha disponible se editan. */
export const metaLote = (conAlmacen: boolean, editable: boolean): MetaModelo<Lote> => ({
    campos: {
        caducidad: { requerido: false },
        almacenId: { requerido: conAlmacen },
        fechaDisponible: { requerido: false },
    },
    editable: () => editable,
    validacion: (lote) => validarLote(lote, conAlmacen),
});

/** Lo que ha cambiado entre la ficha leída y la editada (vacío si nada). */
export const cambiosLote = (anterior: Lote, actual: Lote, conAlmacen: boolean): CambiosLote => {
    const cambios: CambiosLote = {};
    if (actual.caducidad !== anterior.caducidad) cambios.caducidad = actual.caducidad;
    if (conAlmacen) {
        if (actual.almacenId !== anterior.almacenId) cambios.almacenId = actual.almacenId;
        if (actual.fechaDisponible !== anterior.fechaDisponible) cambios.fechaDisponible = actual.fechaDisponible;
    }
    return cambios;
};

/** "Código · artículo". */
export const tituloLote = (lote: Lote): string =>
    lote.articulo ? `${lote.id} · ${lote.articulo}` : lote.id;

/** Texto del artículo: "referencia - descripción". */
export const textoArticulo = (lote: Pick<Lote, "sku" | "articulo">): string =>
    lote.articulo ? `${lote.sku} - ${lote.articulo}` : lote.sku;

/** Mensaje tras «Revisar lote» o «Revisar todos». */
export const mensajeRevisados = (revisados: number): string =>
    revisados === 1 ? "Se ha revisado 1 lote." : `Se han revisado ${formatearCantidad(revisados)} lotes.`;

export const FORMATOS_ETIQUETA_LOTE: { valor: FormatoEtiquetaLote; descripcion: string }[] = [
    { valor: "3x9", descripcion: "3 × 9 cm" },
    { valor: "2,5x6", descripcion: "2,5 × 6 cm" },
];

export const MAX_COPIAS_ETIQUETA = 500;

/** Una copia en el formato de siempre y sin cantidad (la pone el servidor). */
export const formEtiquetaPorDefecto = (): FormEtiquetaLote => ({ copias: "1", formato: "3x9", cantidad: "" });

/** «1.234,5» o «12,5» (español) y también «12.5». */
const numeroTecleado = (texto: string): number => {
    const t = texto.trim();
    return Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
};

/** El formulario de etiquetas a lo que se pide, o el motivo por el que no vale. */
export const opcionesEtiquetaDesdeForm = (form: FormEtiquetaLote): OpcionesEtiquetaLote | string => {
    const copias = Number(form.copias.trim());
    if (!Number.isInteger(copias) || copias < 1 || copias > MAX_COPIAS_ETIQUETA) {
        return `Las copias deben ser un número entero de 1 a ${MAX_COPIAS_ETIQUETA}`;
    }
    if (!FORMATOS_ETIQUETA_LOTE.some((f) => f.valor === form.formato)) return "Formato de etiqueta no válido";
    let cantidad: number | null = null;
    if (form.cantidad.trim() !== "") {
        cantidad = numeroTecleado(form.cantidad);
        if (Number.isNaN(cantidad) || cantidad < 0) return "La cantidad debe ser un número positivo";
    }
    return { copias, formato: form.formato, cantidad };
};

/** Parámetros de la petición de etiquetas (`copias`, `formato` y, si se indica, `cantidad`). */
export const queryEtiquetaLote = (opciones: OpcionesEtiquetaLote): string => {
    const params = new URLSearchParams({ copias: String(opciones.copias), formato: opciones.formato });
    if (opciones.cantidad !== null) params.set("cantidad", String(opciones.cantidad));
    return params.toString();
};

/** Nombre del PDF de etiquetas (el que da el servidor). */
export const nombreEtiquetaLote = (id: string): string => `etiqueta-lote-${id}.pdf`;
