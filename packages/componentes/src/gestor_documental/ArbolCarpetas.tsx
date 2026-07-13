import { CarpetaEnArbol, DocumentoEnArbol } from "@olula/lib/api/carpetas.ts";
import { useState } from "react";
import "./ArbolCarpetas.css";

export interface ArbolCarpetasProps {
  carpetaActual: CarpetaEnArbol | null;
  documentosSinCarpeta: DocumentoEnArbol[];
  onSeleccionar: (carpeta: CarpetaEnArbol) => void | Promise<void>;
  onCrearCarpeta?: (nombre: string, padre_id?: string) => void;
  onRenombrarCarpeta?: (carpeta_id: string, nuevoNombre: string) => void;
  onEliminarCarpeta?: (carpeta_id: string) => void;
}

export const ArbolCarpetas = ({
  carpetaActual,
  documentosSinCarpeta,
  onSeleccionar,
  onCrearCarpeta,
  onRenombrarCarpeta,
  onEliminarCarpeta,
}: ArbolCarpetasProps) => {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [mostrarCrearEn, setMostrarCrearEn] = useState<string | null>(null);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");
  const [editandoCarpetaId, setEditandoCarpetaId] = useState<string | null>(
    null
  );
  const [nombreEditado, setNombreEditado] = useState("");
  const [carpetaAEliminar, setCarpetaAEliminar] = useState<string | null>(null);

  if (!carpetaActual) {
    return (
      <div className="ArbolCarpetas ArbolCarpetas--vacio">Cargando...</div>
    );
  }

  const toggleExpandir = (carpeta_id: string) => {
    const nuevas = new Set(expandidas);
    if (nuevas.has(carpeta_id)) {
      nuevas.delete(carpeta_id);
    } else {
      nuevas.add(carpeta_id);
    }
    setExpandidas(nuevas);
  };

  const handleCrearCarpeta = () => {
    if (nombreNuevaCarpeta.trim() && onCrearCarpeta) {
      onCrearCarpeta(nombreNuevaCarpeta, mostrarCrearEn || undefined);
      setNombreNuevaCarpeta("");
      setMostrarCrearEn(null);
    }
  };

  const renderCarpeta = (carpeta: CarpetaEnArbol, nivel: number = 0) => {
    const estaExpandida = expandidas.has(carpeta.id);
    const tieneSubs = carpeta.subcarpetas.length > 0;
    const estaEditando = editandoCarpetaId === carpeta.id;
    const marcadaParaEliminar = carpetaAEliminar === carpeta.id;

    return (
      <div key={`item-${carpeta.id}`} className="ArbolCarpetas__item">
        <div
          className="ArbolCarpetas__linea"
          style={{ paddingLeft: `${nivel * 20}px` }}
        >
          {tieneSubs ? (
            <button
              className={`ArbolCarpetas__expandir ${
                estaExpandida ? "ArbolCarpetas__expandir--expandido" : ""
              }`}
              onClick={() => toggleExpandir(carpeta.id)}
            >
              {estaExpandida ? "▼" : "▶"}
            </button>
          ) : (
            <span className="ArbolCarpetas__sin-expandir">·</span>
          )}

          {estaEditando ? (
            <div className="ArbolCarpetas__editar-nombre">
              <input
                type="text"
                className="ArbolCarpetas__input-nombre"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && nombreEditado.trim()) {
                    onRenombrarCarpeta?.(carpeta.id, nombreEditado);
                    setEditandoCarpetaId(null);
                  }
                  if (e.key === "Escape") {
                    setEditandoCarpetaId(null);
                  }
                }}
                onBlur={() => setEditandoCarpetaId(null)}
                autoFocus
              />
            </div>
          ) : (
            <button
              className="ArbolCarpetas__carpeta"
              onClick={async () => {
                await onSeleccionar(carpeta);
              }}
            >
              📁 {carpeta.nombre}
              {carpeta.documentos.length > 0 && (
                <span className="ArbolCarpetas__contador">
                  ({carpeta.documentos.length})
                </span>
              )}
            </button>
          )}

          {!estaEditando && (
            <div className="ArbolCarpetas__acciones">
              {onRenombrarCarpeta && (
                <button
                  className="ArbolCarpetas__accion"
                  onClick={() => {
                    setEditandoCarpetaId(carpeta.id);
                    setNombreEditado(carpeta.nombre);
                  }}
                  title="Editar nombre"
                >
                  ✏️
                </button>
              )}
              <button
                className="ArbolCarpetas__accion"
                onClick={() => setMostrarCrearEn(carpeta.id)}
                title="Crear subcarpeta"
              >
                ✚
              </button>
              {onEliminarCarpeta && (
                <button
                  className={`ArbolCarpetas__accion ArbolCarpetas__accion--eliminar ${
                    marcadaParaEliminar
                      ? "ArbolCarpetas__accion--confirmando"
                      : ""
                  }`}
                  onClick={() => {
                    if (marcadaParaEliminar) {
                      onEliminarCarpeta(carpeta.id);
                      setCarpetaAEliminar(null);
                    } else {
                      setCarpetaAEliminar(carpeta.id);
                    }
                  }}
                  title={
                    marcadaParaEliminar ? "Confirmar eliminación" : "Eliminar"
                  }
                >
                  {marcadaParaEliminar ? "✓" : "🗑️"}
                </button>
              )}
              {marcadaParaEliminar && (
                <button
                  className="ArbolCarpetas__accion ArbolCarpetas__accion--cancelar"
                  onClick={() => setCarpetaAEliminar(null)}
                  title="Cancelar"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Subcarpetas */}
        {estaExpandida && tieneSubs && (
          <div className="ArbolCarpetas__subcarpetas">
            {carpeta.subcarpetas.map((sub) => renderCarpeta(sub, nivel + 1))}
          </div>
        )}

        {/* Documentos en esta carpeta */}
        {estaExpandida && carpeta.documentos.length > 0 && (
          <div className="ArbolCarpetas__documentos">
            {carpeta.documentos.map((doc) => (
              <div
                key={`doc-${doc.id}`}
                className="ArbolCarpetas__documento"
                style={{ paddingLeft: `${(nivel + 1) * 20 + 20}px` }}
              >
                <span className="ArbolCarpetas__documento-icono">📄</span>
                <span className="ArbolCarpetas__documento-nombre">
                  {doc.nombre}.{doc.extension}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ArbolCarpetas">
      <div className="ArbolCarpetas__header">
        <h3>📁 {carpetaActual.nombre}</h3>
        {onCrearCarpeta && (
          <button
            className="ArbolCarpetas__crear"
            onClick={() => setMostrarCrearEn(carpetaActual.id)}
          >
            ✚ Nueva carpeta
          </button>
        )}
      </div>

      <div className="ArbolCarpetas__contenido">
        {/* Subcarpetas de la carpeta actual */}
        {carpetaActual.subcarpetas.length === 0 &&
        carpetaActual.documentos.length === 0 ? (
          <p className="ArbolCarpetas__vacio">Sin contenido</p>
        ) : (
          <>
            {/* Renderizar subcarpetas */}
            {carpetaActual.subcarpetas.map((sub) => renderCarpeta(sub, 0))}

            {/* Renderizar documentos directos en esta carpeta */}
            {carpetaActual.documentos.length > 0 && (
              <div className="ArbolCarpetas__documentos-directos">
                <div className="ArbolCarpetas__documentos-titulo">
                  Documentos
                </div>
                {carpetaActual.documentos.map((doc) => (
                  <div
                    key={`doc-${doc.id}`}
                    className="ArbolCarpetas__documento"
                    style={{ paddingLeft: "20px" }}
                  >
                    <span className="ArbolCarpetas__documento-icono">📄</span>
                    <span className="ArbolCarpetas__documento-nombre">
                      {doc.nombre}.{doc.extension}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Documentos sin carpeta */}
            {documentosSinCarpeta.length > 0 && (
              <div className="ArbolCarpetas__documentos-sin-carpeta">
                <div className="ArbolCarpetas__documentos-titulo">
                  📂 Sin carpeta
                </div>
                {documentosSinCarpeta.map((doc) => (
                  <div
                    key={`doc-sin-${doc.id}`}
                    className="ArbolCarpetas__documento"
                    style={{ paddingLeft: "20px" }}
                  >
                    <span className="ArbolCarpetas__documento-icono">📄</span>
                    <span className="ArbolCarpetas__documento-nombre">
                      {doc.nombre}.{doc.extension}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {mostrarCrearEn && (
        <div className="ArbolCarpetas__crear-carpeta">
          <input
            type="text"
            placeholder="Nombre de la carpeta"
            value={nombreNuevaCarpeta}
            onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleCrearCarpeta();
              if (e.key === "Escape") {
                setMostrarCrearEn(null);
                setNombreNuevaCarpeta("");
              }
            }}
            autoFocus
          />
          <button
            className="ArbolCarpetas__crear-btn"
            onClick={handleCrearCarpeta}
          >
            ✅ Crear
          </button>
          <button
            className="ArbolCarpetas__cancelar-btn"
            onClick={() => {
              setMostrarCrearEn(null);
              setNombreNuevaCarpeta("");
            }}
          >
            ❌ Cancelar
          </button>
        </div>
      )}
    </div>
  );
};
