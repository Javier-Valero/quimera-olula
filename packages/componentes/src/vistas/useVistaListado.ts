import { Entidad, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useRef } from "react";
import {
  MetaColumna,
  MetaTabla,
  obtenerCols,
  PersonalizacionColumnas,
} from "../atomos/qtablacontrolada.tsx";
import { ConfigTarjeta, ConfigVista, ModoVista, SentidoOrden } from "./diseño.ts";
import {
  aplicarColumnas,
  aplicarTarjeta,
  configTablaDesdeVisibles,
  mismoOrden,
  moverColumna,
  ocultarColumna,
  sinListado,
  sinTarjeta,
} from "./dominio.ts";
import { usePreferenciasVista } from "./usePreferenciasVista.ts";

const conColumnas = <T extends Entidad>(
  metaTabla: MetaTabla<T>,
  cols: MetaColumna<T>[]
): MetaTabla<T> =>
  Array.isArray(metaTabla) ? cols : { cols, expansion: metaTabla.expansion };

const sentido = (valor: string | undefined): SentidoOrden =>
  valor === "DESC" ? "DESC" : "ASC";

/**
 * Lo que la personalización aporta a un `Listado` con `pantalla`: columnas
 * visibles y en orden, menú de columna, selector de columnas, ordenación y modo
 * por defecto. Sin `pantalla` todo queda como lo da el código.
 */
export const useVistaListado = <T extends Entidad>({
  pantalla,
  metaTabla,
  orden,
  ordenInicial,
  onOrdenChanged,
}: {
  pantalla?: string;
  metaTabla?: MetaTabla<T>;
  /** Ordenación actual del listado. */
  orden: Orden;
  /** La que trae la pantalla (o la URL): si no se ha cambiado, manda la guardada. */
  ordenInicial: Orden;
  onOrdenChanged: (orden: Orden) => void;
}) => {
  const preferencias = usePreferenciasVista(pantalla);
  const { config, cargada, personalizable } = preferencias;

  const catalogo = metaTabla ? obtenerCols(metaTabla) : [];
  const columnasVisibles = aplicarColumnas(catalogo, config?.tabla);
  const visibles = columnasVisibles.map((columna) => columna.id);
  const ordenGuardado = config?.tabla?.orden;

  const guardar = (cambios: Partial<ConfigVista>) =>
    void preferencias.guardar({ ...config, ...cambios });

  const guardarVisibles = (ids: string[]) =>
    guardar({ tabla: configTablaDesdeVisibles(catalogo, ids, config?.tabla) });

  // La ordenación guardada se aplica una vez al cargar, si el usuario no ha
  // llegado con otra (enlace, URL).
  const ordenAplicado = useRef(false);
  useEffect(() => {
    if (!cargada || ordenAplicado.current) return;
    ordenAplicado.current = true;
    if (ordenGuardado && mismoOrden(orden, ordenInicial) && !mismoOrden(orden, ordenGuardado)) {
      onOrdenChanged(ordenGuardado);
    }
  }, [cargada, ordenGuardado, orden, ordenInicial, onOrdenChanged]);

  const personalizacion: PersonalizacionColumnas | undefined =
    personalizable && metaTabla
      ? {
          onOcultar: (id) => guardarVisibles(ocultarColumna(visibles, id)),
          onMover: (id, destino) => guardarVisibles(moverColumna(visibles, id, destino)),
          puedeOcultar: visibles.length > 1,
        }
      : undefined;

  return {
    /** La metaTabla con las columnas que ve el usuario (la del código sin pantalla). */
    metaTabla: metaTabla && pantalla ? conColumnas(metaTabla, columnasVisibles) : metaTabla,
    personalizacion,
    /** Props del selector de columnas, o undefined si no se puede personalizar. */
    selector: personalizacion
      ? {
          catalogo: catalogo.map(({ id, cabecera }) => ({ id, cabecera })),
          visibles,
          // Solo lo del listado: los botones del detalle van en la misma fila.
          personalizada:
            preferencias.origen === "usuario" && !!(config?.tabla || config?.modo),
          puedeGuardarOrden: orden.length > 0 && !mismoOrden(orden, ordenGuardado),
          onCambiar: guardarVisibles,
          onGuardarOrden: () =>
            guardar({
              tabla: {
                ...(config?.tabla ?? configTablaDesdeVisibles(catalogo, visibles)),
                orden: [orden[0], sentido(orden[1])],
              },
            }),
          onRestaurar: () =>
            void preferencias.quitar(sinListado(config)).catch(() => undefined),
        }
      : undefined,
    /** Plantilla de tarjeta del usuario (ya filtrada por el catálogo), si la hay. */
    tarjeta: cargada ? aplicarTarjeta(catalogo, config?.tarjeta) : undefined,
    /** Guarda la plantilla de tarjeta; `undefined` vuelve a la del código. */
    guardarTarjeta: (tarjeta: ConfigTarjeta | undefined) =>
      personalizable &&
      void (tarjeta
        ? preferencias.guardar({ ...config, tarjeta })
        : preferencias.quitar(sinTarjeta(config))
      ).catch(() => undefined),
    /** Modo guardado, cuando ya se sabe. */
    modoGuardado: cargada ? config?.modo : undefined,
    guardarModo: (modo: ModoVista) => personalizable && guardar({ modo }),
  };
};
