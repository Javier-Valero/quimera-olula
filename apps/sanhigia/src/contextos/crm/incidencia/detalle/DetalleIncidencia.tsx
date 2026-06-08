import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarIncidencia } from "../borrar/BorrarIncidencia.tsx";
import { Incidencia } from "../diseño.ts";
import "./DetalleIncidencia.css";
import {
  guardarIncidencia,
  incidenciaVacia,
  metaIncidencia,
} from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { TabInformacion } from "./TabInformacion.tsx";

/**
 * Componente detalle.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la entidad cuando cambia el ID.
 *
 * Patrón auto-guardado:
 *   useModelo(meta, entidad, onGuardado) → el tercer argumento es un callback
 *   que se invoca cuando el modelo tiene cambios válidos y el usuario deja de editar.
 *   Llama a la API y emite el evento de resultado a la máquina.
 *
 * Patrón modales condicionales:
 *   Los modales se renderizan condicionalmente según ctx.estado.
 *   No existe estado EDITANDO separado; el formulario siempre está activo
 *   y se deshabilita si metaIncidencia.editable devuelve false.
 */
export const DetalleIncidencia = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      incidencia: incidenciaVacia(),
    },
    publicar
  );

  // Auto-guardado: se llama cuando el modelo cambia y es válido
  const autoGuardar = useCallback(
    async (incidencia: Incidencia) => {
      await guardarIncidencia(ctx, incidencia);
      await emitir("incidencia_guardada");
    },
    [ctx, emitir]
  );

  const modelo = useModelo(metaIncidencia, ctx.incidencia, autoGuardar);

  // Recargar cuando el ID cambia (o se deselecciona con undefined)
  useEffect(() => {
    emitir("incidencia_id_cambiado", id, true);
  }, [id, emitir]);

  if (!ctx.incidencia.id) return null;

  const titulo = (i: Incidencia) =>
    `${i.descripcion} - ${i.nombreCliente}` as string;

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.incidencia}
      cerrarDetalle={() => emitir("incidencia_deseleccionada", null, true)}
    >
      <div className="DetalleIncidencia">
        <div className="maestro-botones">
          <QBoton onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-general"
              label="General"
              children={<TabGeneral form={modelo} />}
            />,
            <Tab
              key="tab-info"
              label="Información"
              children={<TabInformacion incidencia={ctx.incidencia} />}
            />,
          ]}
        />
      </div>

      {/* Modales condicionales: se activan según el estado de la máquina */}
      {ctx.estado === "BORRANDO" && (
        <BorrarIncidencia
          incidenciaId={ctx.incidencia.id}
          incidenciaDescripcion={ctx.incidencia.descripcion}
          publicar={emitir}
          onCancelar={() => emitir("borrado_cancelado")}
        />
      )}
    </Detalle>
  );
};
