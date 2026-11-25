/** Modos de un listado (mismo vocabulario que `Listado`). */
export type ModoVista = "tabla" | "tarjetas" | "kanban";

export type SentidoOrden = "ASC" | "DESC";

export type ConfigTabla = {
  /** Columnas visibles, en el orden en que se ven. */
  columnas: string[];
  /** Columnas que el usuario ha ocultado. Una que no esté en ninguna de las
   *  dos listas es nueva y sale según su visibilidad por defecto. */
  ocultas?: string[];
  /** Ordenación por defecto (la del clic en la cabecera es temporal). */
  orden?: [string, SentidoOrden];
};

/** Huecos de la plantilla de tarjeta, rellenos con ids de columna. */
export type ConfigTarjeta = {
  titulo?: string;
  subtitulo?: string;
  etiqueta?: string;
  campos: string[];
};

/**
 * Lo que un usuario ve en una vista de una pantalla, tal como lo guarda el
 * servidor (`/comun/vista_usuario/<pantalla>`). Solo guarda ids y orden: qué
 * columnas y acciones existen lo declara el código (el catálogo).
 */
export type ConfigVista = {
  modo?: ModoVista;
  tabla?: ConfigTabla;
  tarjeta?: ConfigTarjeta;
  /** Grupo de acciones -> ids por prioridad. */
  acciones?: Record<string, string[]>;
};

/** De dónde sale la configuración que ve el usuario. */
export type OrigenVista = "usuario" | "empresa" | null;

/** Entrada del catálogo de columnas: lo mínimo que necesita la personalización. */
export type ColumnaCatalogo = {
  id: string;
  /** Oculta por defecto: no se ve hasta que el usuario la elige. */
  oculta?: boolean;
};

/** Entrada del catálogo de acciones: solo las que tienen id se pueden ordenar. */
export type AccionCatalogo = { id?: string };
