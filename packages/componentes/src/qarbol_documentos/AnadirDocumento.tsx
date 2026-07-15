import { QGestorDocumentos, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";
import "./AnadirDocumento.css";

/**
 * Modal de alta de documentos dentro del árbol documental.
 *
 * Patrón:
 *   - El padre lo renderiza condicionalmente cuando estado === "anadiendo_documento".
 *   - Envuelve QGestorDocumentos y emite:
 *       "documento_anadido"           al terminar la subida (recarga el árbol y cierra el modal)
 *       "adicion_documento_cancelada" al cancelar la subida o cerrar el modal (sin recargar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 *   - `archivosIniciales`: cuando el padre ya tiene archivos elegidos por el selector nativo
 *     en móvil (ver useSeleccionArchivosMovil), se pasan aquí para que QGestorDocumentos
 *     arranque subiéndolos directamente, sin mostrar la zona de arrastrar y soltar.
 */
export interface AnadirDocumentoProps {
  vinculoTipo: string;
  vinculoId: string;
  archivosIniciales?: File[];
  publicar: EmitirEvento;
}

export const AnadirDocumento = ({
  vinculoTipo,
  vinculoId,
  archivosIniciales,
  publicar,
}: AnadirDocumentoProps) => {
  const handleDocumentoSubido = useCallback(() => {
    publicar("documento_anadido");
  }, [publicar]);

  const cancelar = useCallback(
    () => publicar("adicion_documento_cancelada"),
    [publicar]
  );

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Añadir documento"
      onCerrar={cancelar}
    >
      <div className={"AnadirDocumento"}>
        <QGestorDocumentos
          vinculo_tipo={vinculoTipo}
          vinculo_id={vinculoId}
          tipo_documento="Documento"
          archivosIniciales={archivosIniciales}
          onDocumentoSubido={handleDocumentoSubido}
          onCancelar={cancelar}
        />
      </div>
    </QModal>
  );
};
