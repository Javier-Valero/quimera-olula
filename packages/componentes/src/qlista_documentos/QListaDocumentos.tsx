import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { DocumentoGenerico, DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { Filtro } from "@olula/lib/diseño.ts";
import { useEffect, useMemo, useState } from "react";
import { descargarDocumento } from "../qgestor_documentos/dominio.ts";
import { QListaDocumentosProps } from "./diseño.ts";
import "./QListaDocumentos.css";

export const QListaDocumentos = ({
  vinculo_tipo,
  vinculo_id,
  paginacion = { limite: 50, pagina: 1 },
  refreshCounter,
  onError,
}: QListaDocumentosProps) => {
  const [documentos, setDocumentos] = useState<DocumentoGenerico[]>([]);
  const [cargando, setCargando] = useState(false);
  const [ordenActual, setOrdenActual] = useState<[string, "ASC" | "DESC"]>([
    "fechaSubida",
    "DESC",
  ]);

  // Memoizar paginación para evitar cambios innecesarios
  const paginacionMemoizada = useMemo(
    () => ({ ...paginacion }),
    [paginacion.limite, paginacion.pagina]
  );

  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        setCargando(true);
        // Agregar _id al vinculo_tipo para el filtro si no lo tiene
        const vinculo_tipo_filtro = vinculo_tipo.endsWith("_id")
          ? vinculo_tipo
          : `${vinculo_tipo}_id`;
        const filtro: Filtro = [[vinculo_tipo_filtro, vinculo_id]];
        const resultado = await DocumentosAPI.obtener(
          filtro,
          [],
          paginacionMemoizada
        );
        setDocumentos(resultado.datos);
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Error desconocido");
        onError?.(err);
        console.error("Error cargando documentos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDocumentos();
  }, [vinculo_id, paginacionMemoizada, vinculo_tipo, refreshCounter]);

  const handleOrdenar = (columna: string) => {
    if (ordenActual[0] === columna) {
      setOrdenActual([columna, ordenActual[1] === "ASC" ? "DESC" : "ASC"]);
    } else {
      setOrdenActual([columna, "ASC"]);
    }
  };

  const handleDescargar = async (doc: DocumentoGenerico) => {
    try {
      const blob = await DocumentosAPI.descargar(doc.id);
      await descargarDocumento(blob, doc.nombre);
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Error descargando documento");
      onError?.(err);
      console.error("Error descargando documento:", err);
    }
  };

  const documentosOrdenados = [...documentos].sort((a, b) => {
    const [columna, direccion] = ordenActual;
    const valorA = String(a[columna as keyof DocumentoGenerico] ?? "");
    const valorB = String(b[columna as keyof DocumentoGenerico] ?? "");

    if (valorA < valorB) return direccion === "ASC" ? -1 : 1;
    if (valorA > valorB) return direccion === "ASC" ? 1 : -1;
    return 0;
  });

  const metaTabla: MetaTabla<DocumentoGenerico> = [
    {
      id: "nombre",
      cabecera: "Nombre",
      prioridad: "alta",
      esTitulo: true,
      ancho: "40%",
    },
    {
      id: "fechaSubida",
      cabecera: "Fecha",
      tipo: "fecha",
      prioridad: "media",
      ancho: "15%",
    },
    {
      id: "horaSubida",
      cabecera: "Hora",
      tipo: "hora",
      prioridad: "media",
      ancho: "15%",
    },
    {
      id: "id",
      cabecera: "Acciones",
      prioridad: "alta",
      ancho: "15%",
      render: (doc) => (
        <button
          onClick={() => handleDescargar(doc)}
          className="QListaDocumentos-boton-descargar"
        >
          Descargar
        </button>
      ),
    },
  ];

  if (documentos.length === 0 && !cargando) {
    return (
      <div className="QListaDocumentos">
        <p className="QListaDocumentos-sin-datos">No hay documentos adjuntos</p>
      </div>
    );
  }

  console.log("mimensaje_documentos", documentos);

  return (
    <div className="QListaDocumentos">
      <QTabla
        metaTabla={metaTabla}
        datos={documentosOrdenados}
        cargando={cargando}
        orden={ordenActual}
        onOrdenar={handleOrdenar}
      />
    </div>
  );
};
