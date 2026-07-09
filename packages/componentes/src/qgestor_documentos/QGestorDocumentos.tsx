import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect } from "react";
import { ArchivosSeleccionados } from "./ArchivosSeleccionados";
import { ArrastraSuelta } from "./ArrastraSuelta.tsx";
import { ConfiguracionGestorDocumentos } from "./diseño.ts";
import { getMaquinaGestorDocumentos } from "./maquina.ts";
import "./QGestorDocumentos.css";

export interface QGestorDocumentosProps {
  vinculo_tipo: string;
  vinculo_id: string;
  tipo_documento?: string;
  onDocumentoSubido?: () => void;
  onError?: (error: Error) => void;
}

export const QGestorDocumentos = ({
  vinculo_tipo,
  vinculo_id,
  tipo_documento = "Documento",
  onDocumentoSubido,
  onError,
}: QGestorDocumentosProps) => {
  // Memoizar callbacks para evitar cambios referenciales innecesarios
  const handleDocumentoSubido = useCallback(onDocumentoSubido || (() => {}), [
    onDocumentoSubido,
  ]);
  const handleError = useCallback(onError || (() => {}), [onError]);

  const configuracion: ConfiguracionGestorDocumentos = {
    vinculo_tipo,
    vinculo_id,
    tipo_documento,
  };

  const { ctx, emitir } = useMaquina(getMaquinaGestorDocumentos, {
    estado: "lista" as const,
    documentos: [],
    cargando: false,
    configuracion,
    archivosSeleccionados: [],
  });
  const { intentar } = useContext(ContextoError);

  useEffect(() => {
    emitir("cargar_documentos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vinculo_id]);

  useEffect(() => {
    if (ctx.estado === "subiendo" && ctx.archivosSeleccionados.length > 0) {
      (async () => {
        try {
          await intentar(async () => {
            // Normalizar vinculo_tipo para guardar sin sufijo _id
            const vinculo_tipo_normalizado = vinculo_tipo.endsWith("_id")
              ? vinculo_tipo.slice(0, -3)
              : vinculo_tipo;

            for (const file of ctx.archivosSeleccionados) {
              const formData = new FormData();
              formData.append("nombre", file.name);
              formData.append("tipo_documento", tipo_documento);
              formData.append("nombre_fichero", file.name);
              formData.append("fichero", file);
              formData.append("vinculo_tipo", vinculo_tipo_normalizado);
              formData.append("vinculo_id", vinculo_id);

              await DocumentosAPI.crear(formData);
            }
          });
          emitir("documentos_subidos");
          handleDocumentoSubido();
        } catch (error) {
          handleError(
            error instanceof Error ? error : new Error("Error desconocido")
          );
          emitir("subida_cancelada");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.estado, ctx.archivosSeleccionados]);

  return (
    <div className="QGestorDocumentos">
      {ctx.estado === "lista" && <ArrastraSuelta emitir={emitir} />}
      {ctx.estado === "archivos-seleccionados" && (
        <ArchivosSeleccionados
          archivos={ctx.archivosSeleccionados}
          emitir={emitir}
        />
      )}
      {ctx.estado === "subiendo" && (
        <div className="QGestorDocumentos-subiendo">
          <p>Subiendo archivos...</p>
        </div>
      )}
    </div>
  );
};
