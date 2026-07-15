import { QBoton, QIcono } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback } from "react";
import "./ArchivosSeleccionados.css";

export const ArchivosSeleccionados = ({
  archivos,
  emitir,
}: {
  archivos: File[];
  emitir: EmitirEvento;
}) => {
  const handleGuardar = useCallback(() => {
    emitir("subir_archivos_solicitado", archivos);
  }, [archivos, emitir]);

  const handleCancelar = useCallback(() => {
    emitir("subida_cancelada");
  }, [emitir]);

  const handleEliminar = useCallback(
    (index: number) => {
      emitir("archivo_eliminado", index);
    },
    [emitir]
  );

  const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const tamaños = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + tamaños[i];
  };

  return (
    <div className="ArchivosSeleccionados">
      <div className="ArchivosSeleccionados-titulo">
        <h3>Archivos seleccionados ({archivos.length})</h3>
      </div>

      <div className="ArchivosSeleccionados-lista">
        {archivos.map((archivo, index) => (
          <div key={index} className="ArchivosSeleccionados-item">
            <div className="ArchivosSeleccionados-info">
              <div className="ArchivosSeleccionados-icono">
                <QIcono nombre="fichero" tamaño="sm" />
              </div>
              <div className="ArchivosSeleccionados-detalles">
                <p className="ArchivosSeleccionados-nombre">{archivo.name}</p>
                <p className="ArchivosSeleccionados-tamaño">
                  {formatearTamaño(archivo.size)}
                </p>
              </div>
            </div>
            <QBoton
              tamaño="pequeño"
              variante="texto"
              destructivo
              onClick={() => handleEliminar(index)}
            >
              Quitar
            </QBoton>
          </div>
        ))}
      </div>

      <div className="ArchivosSeleccionados-botones">
        <QBoton onClick={handleCancelar}>Cancelar</QBoton>
        <QBoton onClick={handleGuardar} deshabilitado={archivos.length === 0}>
          Guardar
        </QBoton>
      </div>
    </div>
  );
};
