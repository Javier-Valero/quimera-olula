import {
  AccionCatalogo,
  ColumnaCatalogo,
  ConfigTabla,
  ConfigTarjeta,
  ConfigVista,
  ModoVista,
  SentidoOrden,
} from "./diseño.ts";

/**
 * Pone cada elemento nuevo (del catálogo, sin posición guardada) detrás del
 * elemento que le precede en el catálogo y ya está colocado; si no hay
 * ninguno, al principio. Así una columna nueva aparece donde la puso el código.
 */
const insertarNuevos = (
  colocados: string[],
  catalogo: string[],
  nuevos: Set<string>
): string[] =>
  catalogo.reduce((resultado, id, posicion) => {
    if (!nuevos.has(id)) return resultado;
    const anterior = catalogo
      .slice(0, posicion)
      .reverse()
      .find((previo) => resultado.includes(previo));
    const indice = anterior === undefined ? 0 : resultado.indexOf(anterior) + 1;
    return [...resultado.slice(0, indice), id, ...resultado.slice(indice)];
  }, colocados);

/**
 * Columnas visibles y en orden según la configuración. Los ids que ya no están
 * en el catálogo se ignoran; las columnas nuevas salen según `oculta`. Sin
 * configuración, las del catálogo que no son ocultas.
 */
export const aplicarColumnas = <C extends ColumnaCatalogo>(
  catalogo: C[],
  config?: ConfigTabla
): C[] => {
  const porId = new Map(catalogo.map((columna) => [columna.id, columna]));
  if (!config) return catalogo.filter((columna) => !columna.oculta);

  const conocidas = new Set([...config.columnas, ...(config.ocultas ?? [])]);
  const visibles = config.columnas.filter((id) => porId.has(id));
  const nuevas = new Set(
    catalogo
      .filter((columna) => !conocidas.has(columna.id) && !columna.oculta)
      .map((columna) => columna.id)
  );

  return insertarNuevos(visibles, catalogo.map((columna) => columna.id), nuevas)
    .map((id) => porId.get(id))
    .filter((columna): columna is C => columna !== undefined);
};

/**
 * Configuración de tabla que resulta de dejar `visibles` (en ese orden): el
 * resto del catálogo pasa a ocultas. Conserva la ordenación guardada.
 */
export const configTablaDesdeVisibles = (
  catalogo: ColumnaCatalogo[],
  visibles: string[],
  anterior?: ConfigTabla
): ConfigTabla => {
  const ids = new Set(catalogo.map((columna) => columna.id));
  const columnas = visibles.filter((id) => ids.has(id));
  const elegidas = new Set(columnas);
  return {
    columnas,
    ocultas: catalogo.map((columna) => columna.id).filter((id) => !elegidas.has(id)),
    ...(anterior?.orden ? { orden: anterior.orden } : {}),
  };
};

/**
 * Acciones de un grupo ordenadas por la prioridad guardada. Las que no tienen
 * id no se pueden personalizar y conservan su sitio relativo; las nuevas van
 * detrás de la que les precede en el código.
 */
export const aplicarAcciones = <A extends AccionCatalogo>(
  acciones: A[],
  prioridad?: string[]
): A[] => {
  if (!prioridad?.length) return acciones;

  const claves = acciones.map((accion, i) => accion.id ?? `#${i}`);
  const porClave = new Map(claves.map((clave, i) => [clave, acciones[i]]));
  const colocadas = prioridad.filter((id) => porClave.has(id));
  const nuevas = new Set(claves.filter((clave) => !colocadas.includes(clave)));

  return insertarNuevos(colocadas, claves, nuevas)
    .map((clave) => porClave.get(clave))
    .filter((accion): accion is A => accion !== undefined);
};

/** Huecos de la tarjeta sin los ids que ya no existen en el catálogo. */
export const aplicarTarjeta = (
  catalogo: ColumnaCatalogo[],
  config?: ConfigTarjeta
): ConfigTarjeta | undefined => {
  if (!config) return undefined;
  const ids = new Set(catalogo.map((columna) => columna.id));
  const valido = (id?: string) => (id && ids.has(id) ? id : undefined);
  return {
    titulo: valido(config.titulo),
    subtitulo: valido(config.subtitulo),
    etiqueta: valido(config.etiqueta),
    campos: config.campos.filter((id) => ids.has(id)),
  };
};

/** Ordenación por defecto guardada, o la que da el código. */
export const ordenPorDefecto = (
  config: ConfigVista | undefined,
  porCodigo?: [string, SentidoOrden]
): [string, SentidoOrden] | undefined => config?.tabla?.orden ?? porCodigo;

/** Modo guardado si la pantalla lo admite; si no, el que da el código. */
export const modoDeVista = (
  config: ConfigVista | undefined,
  disponibles: ModoVista[],
  porCodigo?: ModoVista
): ModoVista | undefined =>
  config?.modo && disponibles.includes(config.modo) ? config.modo : porCodigo;

/** `ids` con `id` movido a la posición que ocupa `destino`. */
export const moverColumna = (ids: string[], id: string, destino: string): string[] => {
  if (id === destino || !ids.includes(id) || !ids.includes(destino)) return ids;
  const sin = ids.filter((otro) => otro !== id);
  const indice = ids.indexOf(destino);
  return [...sin.slice(0, indice), id, ...sin.slice(indice)];
};

/** `ids` con `id` una posición antes (-1) o después (+1). */
export const desplazarColumna = (ids: string[], id: string, paso: -1 | 1): string[] => {
  const indice = ids.indexOf(id);
  const destino = ids[indice + paso];
  return indice < 0 || destino === undefined ? ids : moverColumna(ids, id, destino);
};

/** Quita `id` de las visibles; la última visible no se puede ocultar. */
export const ocultarColumna = (ids: string[], id: string): string[] =>
  ids.length <= 1 ? ids : ids.filter((otro) => otro !== id);

/** Las ordenaciones son iguales (campo y sentido). */
export const mismoOrden = (a?: string[], b?: string[]): boolean =>
  !!a && !!b && a[0] === b[0] && (a[1] ?? "ASC") === (b[1] ?? "ASC");
