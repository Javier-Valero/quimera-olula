import { Documento } from "../diseño.ts";
import "./TabDocumentosLista.css";

export const TabDocumentosLista = ({
  documentos,
  cargando,
}: {
  documentos: Documento[];
  cargando: boolean;
}) => {
  if (cargando) {
    return <div className="TabDocumentosLista">Cargando documentos...</div>;
  }

  if (documentos.length === 0) {
    return (
      <div className="TabDocumentosLista">
        <p className="sin-datos">No hay documentos adjuntos</p>
      </div>
    );
  }

  return (
    <div className="TabDocumentosLista">
      <table className="TabDocumentosLista-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Tamaño</th>
            <th>Fecha de subida</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.nombre}</td>
              <td>{doc.tipo}</td>
              <td>{formatearTamaño(doc.tamaño)}</td>
              <td>{new Date(doc.fechaSubida).toLocaleDateString("es-ES")}</td>
              <td>
                <a href={doc.urlDescarga} download>
                  Descargar
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatearTamaño = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const tamaños = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + tamaños[i];
};
