import { QGestorDocumentos, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";

/**
 * Modal de alta de documentos dentro del árbol documental.
 *
 * Patrón:
 *   - El padre lo renderiza condicionalmente cuando estado === "anadiendo_documento".
 *   - Envuelve QGestorDocumentos y emite:
 *       "documento_anadido"           en cada subida completada (recarga el árbol sin cerrar el modal,
 *                                     para permitir subir varios documentos en la misma sesión)
 *       "adicion_documento_cancelada" al cerrar el modal
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 */
export interface AnadirDocumentoProps {
    vinculoTipo: string;
    vinculoId: string;
    publicar: EmitirEvento;
}

export const AnadirDocumento = ({ vinculoTipo, vinculoId, publicar }: AnadirDocumentoProps) => {
    const handleDocumentoSubido = useCallback(() => {
        publicar("documento_anadido");
    }, [publicar]);

    const cancelar = useCallback(() => publicar("adicion_documento_cancelada"), [publicar]);

    return (
        <QModal abierto={true} nombre="mostrar" titulo="Añadir documento" onCerrar={cancelar}>
            <QGestorDocumentos
                vinculo_tipo={vinculoTipo}
                vinculo_id={vinculoId}
                tipo_documento="Documento"
                onDocumentoSubido={handleDocumentoSubido}
            />
        </QModal>
    );
};
