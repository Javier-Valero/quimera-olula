import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { DetalleIncidencia } from "../detalle/DetalleIncidencia.tsx";
import { Incidencia } from "../diseño.ts";
import { metaTablaIncidencia } from "./diseño.ts";
import "./MaestroConDetalleIncidencia.css";
import { getMaquina } from "./maquina.ts";

/**
 * Componente principal: listado (maestro) + detalle de incidencias.
 *
 * Patrones aplicados:
 *   - useLayout        → alterna entre vista TARJETA y TABLA
 *   - useUrlParams     → escribe activo y criteria en la URL al cambiar
 *   - getUrlParams     → lee el estado inicial desde la URL (deep link)
 *   - listaActivaEntidadesInicial → inicializa con ID y criteria de la URL
 *   - Listado          → gestiona criteria internamente; emite onCriteriaChanged y onSiguientePagina
 *   - MaestroDetalle   → recibe layout para adaptar la disposición en móvil
 */
export const MaestroConDetalleIncidencia = () => {
  // Criteria base de incidencias (orden por defecto, etc.)
  const criteriaBase = useMemo(() => criteriaDefecto, []);

  // Alterna entre vista TARJETA y TABLA; en móvil siempre usa TARJETA
  const { layout, cambiarLayout } = useLayout("TARJETA");

  // Lee el activo y criteria iniciales desde la URL
  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    incidencias: listaActivaEntidadesInicial<Incidencia>(id, criteriaInicial),
  });

  // Escribe activo y criteria en la URL al cambiar
  useUrlParams(ctx.incidencias.activo, ctx.incidencias.criteria);

  // Carga inicial
  useEffect(() => {
    emitir("recarga_de_incidencias_solicitada", ctx.incidencias.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Incidencia">
      <MaestroDetalle<Incidencia>
        Maestro={
          <>
            <h2>Incidencias</h2>
            <div className="maestro-botones">
              <QBoton
                texto={
                  layout === "TARJETA" ? "Cambiar a TABLA" : "Cambiar a TARJETA"
                }
                onClick={cambiarLayout}
              />
            </div>
            <Listado<Incidencia>
              metaTabla={metaTablaIncidencia}
              criteria={ctx.incidencias.criteria}
              modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
              tarjeta={TarjetaIncidencia}
              entidades={ctx.incidencias.lista}
              totalEntidades={ctx.incidencias.total}
              seleccionada={ctx.incidencias.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_incidencia_solicitado")}>
                    Nueva Incidencia
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("incidencia_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleIncidencia id={ctx.incidencias.activo} publicar={emitir} />
        }
        layout={layout}
        seleccionada={ctx.incidencias.activo}
        modoDisposicion="maestro-50"
      />
    </div>
  );
};

/**
 * Componente tarjeta para la vista de lista en modo tarjetas.
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaIncidencia = (incidencia: Incidencia) => {
  return (
    <div className="tarjeta-incidencia" key={incidencia.id}>
      <div className="tarjeta-incidencia-fecha">
        {new Date(incidencia.fecha).toLocaleDateString()}
      </div>
      <div className="tarjeta-incidencia-descripcion">
        {incidencia.descripcion}
      </div>
      <div className="tarjeta-incidencia-cliente">
        {incidencia.nombreCliente}
      </div>
      <div className={`tarjeta-incidencia-estado estado-${incidencia.estado}`}>
        {incidencia.estado}
      </div>
    </div>
  );
};
