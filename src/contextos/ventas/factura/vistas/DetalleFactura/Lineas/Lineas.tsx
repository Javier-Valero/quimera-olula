import { useCallback, useContext, useEffect, useState } from "react";
import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { QModal } from "../../../../../../componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "../../../../../../componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "../../../../../comun/contexto.ts";
import { useLista } from "../../../../../comun/useLista.ts";
import { Maquina, useMaquina } from "../../../../../comun/useMaquina.ts";
import { HookModelo } from "../../../../../comun/useModelo.ts";
import {
  Factura,
  LineaFactura as Linea,
  LineaFactura,
  NuevaLineaFactura,
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
  factura,
}: {
  onCabeceraModificada: () => void;
  factura: HookModelo<Factura>;
}) => {
  const [estado, setEstado] = useState<Estado>("lista");
  const lineas = useLista<Linea>([]);
  const facturaId = factura?.modelo?.id;
  const { intentar } = useContext(ContextoError);

  const { setLista } = lineas;

  const refrescarLineas = async (idLinea?: string) => {
    const nuevasLineas = await getLineas(facturaId);
    lineas.refrescar(nuevasLineas, idLinea);
    onCabeceraModificada();
  };

  const cargar = useCallback(async () => {
    const nuevasLineas = await getLineas(facturaId);
    setLista(nuevasLineas);
  }, [facturaId, setLista]);

  useEffect(() => {
    if (facturaId) cargar();
  }, [facturaId, cargar]);

  const onBorrarConfirmado = async () => {
    if (!lineas.seleccionada) return;
    const lineaId = lineas.seleccionada.id;
    if (!lineaId) return;
    await intentar(() => deleteLinea(facturaId, lineaId));
    await refrescarLineas();
    setEstado("lista");
  };

  const maquina: Maquina<Estado> = {
    alta: {
      ALTA_LISTA: async (payload: unknown) => {
        const idLinea = await postLinea(
          facturaId,
          payload as NuevaLineaFactura
        );
        await refrescarLineas(idLinea);
        return "lista" as Estado;
      },
    },
    edicion: {
      EDICION_LISTA: async (payload: unknown) => {
        const linea = payload as LineaFactura;
        await patchLinea(facturaId, linea);
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
          linea: LineaFactura;
          cantidad: number;
        };
        await patchCantidadLinea(facturaId, linea, cantidad);
        await refrescarLineas();
      },
      BORRADO_SOLICITADO: () => "confirmarBorrado",
    },
    confirmarBorrado: {
      BORRADO_CONFIRMADO: async () => {
        await onBorrarConfirmado();
        return "lista" as Estado;
      },
      BORRADO_CANCELADO: "lista",
    },
  };
  const emitir = useMaquina(maquina, estado, setEstado);

  return (
    <>
      {factura.editable && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => emitir("ALTA_SOLICITADA")}>Nueva</QBoton>
          <QBoton
            deshabilitado={!lineas.seleccionada}
            onClick={() => emitir("EDICION_SOLICITADA")}
          >
            Editar
          </QBoton>
          <QBoton
            deshabilitado={!lineas.seleccionada}
            onClick={() => emitir("BORRADO_SOLICITADO")}
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
