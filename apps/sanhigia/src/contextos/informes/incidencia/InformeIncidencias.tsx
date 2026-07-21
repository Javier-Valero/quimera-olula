import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDateInterval } from "@olula/componentes/atomos/qdateinterval.tsx";
import { QFechaHora } from "@olula/componentes/atomos/qfechahora.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { extensionDesdeTipoMime, rangoFechaHoraDesdeAtajo } from "./dominio.ts";
import "./InformeIncidencias.css";
import { getInformeIncidencias } from "./infraestructura.ts";

export const InformeIncidencias = () => {
  const { intentar } = useContext(ContextoError);
  const [agenteId, setAgenteId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarPeriodo = useCallback((atajo: string) => {
    const rango = rangoFechaHoraDesdeAtajo(atajo);
    if (!rango) {
      setPeriodo("");
      return;
    }

    setPeriodo(atajo);
    setFechaDesde(rango.fechaDesde);
    setFechaHasta(rango.fechaHasta);
  }, []);

  const cambiarFechaDesde = useCallback((v: string) => {
    setFechaDesde(v);
    setPeriodo("");
  }, []);

  const cambiarFechaHasta = useCallback((v: string) => {
    setFechaHasta(v);
    setPeriodo("");
  }, []);

  const lanzar = useCallback(async () => {
    if (cargando) return;

    setCargando(true);
    try {
      const blob = await intentar(() =>
        getInformeIncidencias({ agenteId, fechaDesde, fechaHasta })
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe_incidencias.${extensionDesdeTipoMime(blob.type)}`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setCargando(false);
    }
  }, [agenteId, fechaDesde, fechaHasta, cargando, intentar]);

  return (
    <div className="InformeIncidencias" style={{ margin: "20px" }}>
      <h2>Informe de incidencias</h2>

      <quimera-formulario>
        <Agente
          valor={agenteId}
          onChange={(opcion) => setAgenteId(opcion?.valor ?? "")}
          label="Agente asociado"
          deshabilitado={cargando}
        />
        <QDateInterval
          label="Periodo"
          nombre="periodo"
          valor={periodo}
          onChange={(v) => cambiarPeriodo(v)}
          deshabilitado={cargando}
        />
        <QFechaHora
          label="Fecha desde"
          nombre="fecha_desde"
          valor={fechaDesde}
          onChange={(v) => cambiarFechaDesde(v)}
          opcional={true}
          deshabilitado={cargando}
        />
        <QFechaHora
          label="Fecha hasta"
          nombre="fecha_hasta"
          valor={fechaHasta}
          onChange={(v) => cambiarFechaHasta(v)}
          opcional={true}
          deshabilitado={cargando}
        />
      </quimera-formulario>

      <div
        className="botones maestro-botones"
        aria-live="polite"
        aria-atomic="true"
      >
        <QBoton
          onClick={lanzar}
          deshabilitado={cargando}
          props={{ disabled: cargando, "aria-busy": cargando }}
        >
          {cargando ? "Generando..." : "Lanzar"}
        </QBoton>
      </div>
    </div>
  );
};
