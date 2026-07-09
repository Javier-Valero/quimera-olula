import {
  QGestorDocumentos,
  QListaDocumentos,
} from "@olula/componentes/index.js";
import { useCallback, useState } from "react";

export const TabDocumentos = ({ incidenciaId }: { incidenciaId: string }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleError = useCallback((error: Error) => {
    console.error("Error en documentos:", error);
  }, []);

  const handleDocumentoSubido = useCallback(() => {
    // Incrementar para forzar que QListaDocumentos recargue
    setRefreshCounter((prev) => prev + 1);
  }, []);

  return (
    <div className="TabDocumentos">
      <QGestorDocumentos
        vinculo_tipo="incidencia"
        vinculo_id={incidenciaId}
        tipo_documento="Documento"
        onDocumentoSubido={handleDocumentoSubido}
        onError={handleError}
      />
      <QListaDocumentos
        vinculo_tipo="incidencia"
        vinculo_id={incidenciaId}
        refreshCounter={refreshCounter}
        onError={handleError}
      />
    </div>
  );
};
