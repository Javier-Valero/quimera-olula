import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useContext } from "react";
import { deleteIncidencia } from "../infraestructura.ts";

interface BorrarIncidenciaProps {
  incidenciaId: string;
  incidenciaDescripcion: string;
  publicar?: ProcesarEvento;
  onCancelar?: () => void;
}

export const BorrarIncidencia = ({
  incidenciaId,
  incidenciaDescripcion,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarIncidenciaProps) => {
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    await intentar(() => deleteIncidencia(incidenciaId));
    publicar("borrado_de_incidencia_listo", { incidenciaId });
    onCancelar();
  };

  return (
    <QModalConfirmacion
      nombre="borrarIncidencia"
      abierto={true}
      titulo="Confirmar borrar"
      mensaje={`¿Está seguro de que desea borrar la incidencia "${incidenciaDescripcion}"?`}
      onCerrar={onCancelar}
      onAceptar={borrar}
    />
  );
};
