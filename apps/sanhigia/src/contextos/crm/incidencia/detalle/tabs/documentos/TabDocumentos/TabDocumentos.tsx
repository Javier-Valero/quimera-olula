import { GestorDocumental } from "@olula/componentes/index.js";
import { useCallback, useState } from "react";

export const TabDocumentos = ({ incidenciaId }: { incidenciaId: string }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleError = useCallback((error: Error) => {
    console.error("Error en documentos:", error);
  }, []);

  const handleDocumentoSubido = useCallback(() => {
    // Incrementar para forzar que ListaDocumentos recargue
    setRefreshCounter((prev) => prev + 1);
  }, []);

  return (
    <div className="TabDocumentos">
      {/* <GestorDocumentos
        vinculo_tipo="incidencia"
        vinculo_id={incidenciaId}
        tipo_documento="Documento"
        onDocumentoSubido={handleDocumentoSubido}
        onError={handleError}
      />
      <ListaDocumentos
        vinculo_tipo="incidencia"
        vinculo_id={incidenciaId}
        refreshCounter={refreshCounter}
        onError={handleError}
      /> */}
      <GestorDocumental
        contenedor_id={incidenciaId}
        contenedor_tipo="incidencia"
      />
    </div>
  );
};
