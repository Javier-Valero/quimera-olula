import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
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

/**
 * Modal de confirmación para borrar una incidencia
 * Llama a la API directamente en la vista
 */
export const BorrarIncidencia = ({
  incidenciaId,
  incidenciaDescripcion,
  publicar = async () => {},
  onCancelar = () => {},
}: BorrarIncidenciaProps) => {
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    await intentar(() => deleteIncidencia(incidenciaId));
    publicar("incidencia_borrada", { incidenciaId });
    onCancelar();
  };

  return (
    <div className="BorrarIncidencia modal confirmacion">
      <div className="contenido">
        <h3>¿Estás seguro?</h3>
        <p>
          ¿Deseas borrar la incidencia{" "}
          <strong>"{incidenciaDescripcion}"</strong>?
        </p>
        <p className="aviso">Esta acción no se puede deshacer.</p>
        <div className="botones">
          <QBoton onClick={borrar} tipo="submit">
            Sí, borrar
          </QBoton>
          <QBoton onClick={onCancelar}>Cancelar</QBoton>
        </div>
      </div>
    </div>
  );
};
