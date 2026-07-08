import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { useContext, useEffect } from "react";
import { postDocumento } from "../../../../infraestructura.ts";
import { Documento } from "../diseño.ts";
import { ArchivosSeleccionados } from "./ArchivosSeleccionados";
import { ArrastraSuelta } from "./ArrastraSuelta.tsx";
import { TabDocumentosLista } from "./TabDocumentosLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabDocumentos = ({ incidenciaId }: { incidenciaId: string }) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista" as const,
    documentos: [] as Documento[],
    cargando: false,
    incidenciaId,
    archivosSeleccionados: [],
  });
  const { intentar } = useContext(ContextoError);

  useEffect(() => {}, [ctx.estado, ctx.archivosSeleccionados]);

  useEffect(() => {
    if (incidenciaId) emitir("cargar_documentos", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  useEffect(() => {
    if (ctx.estado === "subiendo" && ctx.archivosSeleccionados.length > 0) {
      (async () => {
        try {
          await intentar(async () => {
            for (const file of ctx.archivosSeleccionados) {
              const formData = new FormData();
              formData.append("nombre", file.name);
              formData.append("tipo_documento", "Documento");
              formData.append("nombre_fichero", file.name);
              formData.append("fichero", file);
              formData.append("vinculo_tipo", "incidencia");
              formData.append("vinculo_id", ctx.incidenciaId);

              // Debug: log FormData entries
              console.log("FormData entries:", {
                nombre: file.name,
                tipo_documento: "incidencia",
                nombre_fichero: file.name,
                fichero: `File(${file.size} bytes)`,
                vinculo_tipo: "incidencia",
                vinculo_id: ctx.incidenciaId,
              });

              await postDocumento(formData);
            }
          });
          emitir("documentos_subidos");
        } catch {
          // El intentar context ya maneja el error
          emitir("subida_cancelada");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.estado, ctx.archivosSeleccionados]);

  return (
    <div className="TabDocumentos">
      {ctx.estado === "lista" && (
        <>
          <ArrastraSuelta emitir={emitir} />
          <TabDocumentosLista
            documentos={ctx.documentos}
            cargando={ctx.cargando}
          />
        </>
      )}
      {ctx.estado === "archivos-seleccionados" && (
        <ArchivosSeleccionados
          archivos={ctx.archivosSeleccionados}
          emitir={emitir}
        />
      )}
      {ctx.estado === "subiendo" && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Subiendo archivos...</p>
        </div>
      )}
    </div>
  );
};
