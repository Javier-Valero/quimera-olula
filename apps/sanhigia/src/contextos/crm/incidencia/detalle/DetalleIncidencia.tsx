import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { BorrarIncidencia } from "../borrar/BorrarIncidencia.tsx";
import { Incidencia } from "../diseño.ts";
import "./DetalleIncidencia.css";
import { incidenciaVacia, metaIncidencia } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";

export const DetalleIncidencia = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const incidenciaId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      incidencia: incidenciaVacia(),
      incidenciaInicial: incidenciaVacia(),
    },
    publicar
  );

  const incidencia = useModelo(metaIncidencia, ctx.incidencia);

  useEffect(() => {
    emitir("incidencia_id_cambiado", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  const { estado } = ctx;
  const { modificado, valido } = incidencia;

  const titulo = (inc: Incidencia) => inc.descripcion as string;

  const handleGuardar = useCallback(() => {
    emitir("edicion_de_incidencia_lista", incidencia.modelo);
  }, [emitir, incidencia]);

  const handleCancelar = useCallback(() => {
    emitir("edicion_de_incidencia_cancelada");
  }, [emitir]);

  if (!ctx.incidencia.id) return;

  return (
    <div className="DetalleIncidencia">
      <Detalle
        id={ctx.incidencia.id}
        obtenerTitulo={titulo}
        setEntidad={() => {}}
        entidad={ctx.incidencia}
        cerrarDetalle={() => emitir("incidencia_deseleccionada", null)}
      >
        {!!ctx.incidencia.id && (
          <div className="DetalleIncidencia-contenido">
            <div className="maestro-botones">
              <QuimeraAcciones
                acciones={[
                  {
                    icono: "eliminar",
                    texto: "Borrar",
                    onClick: () => emitir("borrado_solicitado"),
                    advertencia: true,
                  },
                ]}
                vertical
              />
            </div>
            <Tabs
              children={[
                <Tab
                  key="tab-1"
                  label="General"
                  children={
                    <TabGeneral form={incidencia} incidencia={ctx.incidencia} />
                  }
                />,
              ]}
            />
            {modificado && (
              <div className="maestro-botones">
                <QBoton onClick={handleGuardar} deshabilitado={!valido}>
                  Guardar
                </QBoton>
                <QBoton
                  tipo="reset"
                  variante="texto"
                  onClick={handleCancelar}
                  deshabilitado={!modificado}
                >
                  Cancelar
                </QBoton>
              </div>
            )}

            {estado === "BORRANDO_INCIDENCIA" && (
              <BorrarIncidencia
                incidenciaId={ctx.incidencia.id}
                incidenciaDescripcion={ctx.incidencia.descripcion as string}
                publicar={emitir}
                onCancelar={() => emitir("borrado_cancelado")}
              />
            )}
          </div>
        )}
      </Detalle>
    </div>
  );
};
