import { useCallback, useContext, useEffect, useState } from "react";
import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { QModal } from "../../../../../../componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "../../../../../../componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "../../../../../comun/contexto.ts";
import { useLista } from "../../../../../comun/useLista.ts";
import { Maquina, useMaquina } from "../../../../../comun/useMaquina.ts";
import { HookModelo } from "../../../../../comun/useModelo.ts";
import {
  LineaPresupuesto as Linea,
  LineaPresupuesto,
  NuevaLinea,
  Presupuesto,
} from "../../../diseño.ts";
import {
  deleteLinea,
  getLineas,
  patchCantidadLinea,
  patchLinea,
  postLinea,
} from "../../../infraestructura.ts";
import { AltaLinea } from "./AltaLinea.tsx";
import { EdicionLinea } from "./EdicionLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

type Estado = "lista" | "alta" | "edicion" | "confirmarBorrado";
export const Lineas = ({
  onCabeceraModificada,
  presupuesto,
}: {
  onCabeceraModificada: () => void;
  presupuesto: HookModelo<Presupuesto>;
}) => {
  const [estado, setEstado] = useState<Estado>("lista");
  const lineas = useLista<Linea>([]);
  const presupuestoId = presupuesto?.modelo?.id;
  const { intentar } = useContext(ContextoError);

  const { setLista } = lineas;

  const refrescarLineas = async (idLinea?: string) => {
    const nuevasLineas = await getLineas(presupuestoId);
    lineas.refrescar(nuevasLineas, idLinea);
    onCabeceraModificada();
  };

  const cargar = useCallback(async () => {
    const nuevasLineas = await getLineas(presupuestoId);
    setLista(nuevasLineas);
  }, [presupuestoId, setLista]);

  useEffect(() => {
    if (presupuestoId) cargar();
  }, [presupuestoId, cargar]);

  const onBorrarConfirmado = async () => {
    if (!lineas.seleccionada) return;
    const lineaId = lineas.seleccionada.id;
    if (!lineaId) return;
    await intentar(() => deleteLinea(presupuestoId, lineaId));
    await refrescarLineas();
    setEstado("lista");
  };

  const maquina: Maquina<Estado> = {
    alta: {
      ALTA_LISTA: async (payload: unknown) => {
        const idLinea = await intentar(() =>
          postLinea(presupuestoId, payload as NuevaLinea)
        );
        await refrescarLineas(idLinea);
        return "lista" as Estado;
      },
    },
    edicion: {
      EDICION_LISTA: async (payload: unknown) => {
        const linea = payload as LineaPresupuesto;
        await intentar(() => patchLinea(presupuestoId, linea));
        await refrescarLineas();
        return "lista" as Estado;
      },
      EDICION_CANCELADA: "lista",
    },
    lista: {
      ALTA_SOLICITADA: "alta",
      EDICION_SOLICITADA: "edicion",
      LINEA_SELECCIONADA: (payload: unknown) => {
        const linea = payload as Linea;
        lineas.seleccionar(linea);
      },
      CAMBIO_CANTIDAD_SOLICITADO: async (payload: unknown) => {
        const { linea, cantidad } = payload as {
          linea: LineaPresupuesto;
          cantidad: number;
        };
        await intentar(() =>
          patchCantidadLinea(presupuestoId, linea, cantidad)
        );
        await refrescarLineas();
      },
      BORRADO_SOLICITADO: () => "confirmarBorrado",
    },
    confirmarBorrado: {
      BORRADO_CONFIRMADO: async () => {
        await intentar(() => onBorrarConfirmado());
        return "lista" as Estado;
      },
      BORRADO_CANCELADO: "lista",
    },
  };
  const emitir = useMaquina(maquina, estado, setEstado);

  return (
    <>
      {presupuesto.editable && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => emitir("ALTA_SOLICITADA")}>Nueva</QBoton>
          <QBoton
            onClick={() => lineas.seleccionada && emitir("EDICION_SOLICITADA")}
            deshabilitado={!lineas.seleccionada}
          >
            Editar
          </QBoton>
          <QBoton
            deshabilitado={!lineas.seleccionada}
            onClick={() => lineas.seleccionada && emitir("BORRADO_SOLICITADO")}
          >
            Borrar
          </QBoton>
        </div>
      )}
      <LineasLista
        lineas={lineas.lista}
        seleccionada={lineas.seleccionada ? lineas.seleccionada.id : undefined}
        emitir={emitir}
      />
      {lineas.seleccionada && (
        <QModal
          nombre="modal"
          abierto={estado === "edicion"}
          onCerrar={() => emitir("EDICION_CANCELADA")}
        >
          <EdicionLinea emitir={emitir} lineaInicial={lineas.seleccionada} />
        </QModal>
      )}
      <QModal
        nombre="modal"
        abierto={estado === "alta"}
        onCerrar={() => setEstado("lista")}
      >
        <AltaLinea emitir={emitir} />
      </QModal>
      <QModalConfirmacion
        nombre="confirmarBorrarLinea"
        abierto={estado === "confirmarBorrado"}
        titulo="Confirmar borrado"
        mensaje="¿Está seguro de que desea borrar esta línea?"
        onCerrar={() => emitir("BORRADO_CANCELADO")}
        onAceptar={() => emitir("BORRADO_CONFIRMADO")}
      />
    </>
  );
};
