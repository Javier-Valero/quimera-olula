import {
  CarpetaContenido,
  CarpetasAPI,
  SubCarpeta,
} from "@olula/lib/api/carpetas.ts";
import { useState } from "react";
import "./ArbolCarpetas.css";

export interface ArbolCarpetasProps {
  carpetaActual: CarpetaContenido | null;
  onSeleccionar: (carpeta: CarpetaContenido) => void | Promise<void>;
  onCrearCarpeta?: (nombre: string, padre_id?: string) => void;
  onEliminarCarpeta?: (carpeta_id: string) => void;
}

export const ArbolCarpetas = ({
  carpetaActual,
  onSeleccionar,
  onCrearCarpeta,
  onEliminarCarpeta,
}: ArbolCarpetasProps) => {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [mostrarCrearEn, setMostrarCrearEn] = useState<string | null>(null);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");

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

  const renderSubcarpeta = (subcarpeta: SubCarpeta, nivel: number = 0) => {
    const estaExpandida = expandidas.has(subcarpeta.id);
    const tieneSubs = subcarpeta.cantidad_subcarpetas > 0;

    return (
      <div key={`item-${subcarpeta.id}`} className="ArbolCarpetas__item">
        <div
          className="ArbolCarpetas__linea"
          style={{ paddingLeft: `${nivel * 20}px` }}
        >
          {tieneSubs ? (
            <button
              className={`ArbolCarpetas__expandir ${
                estaExpandida ? "ArbolCarpetas__expandir--expandido" : ""
              }`}
              onClick={() => toggleExpandir(subcarpeta.id)}
            >
              {estaExpandida ? "▼" : "▶"}
            </button>
          ) : (
            <span className="ArbolCarpetas__sin-expandir">·</span>
          )}

          <button
            className="ArbolCarpetas__carpeta"
            onClick={async () => {
              // Obtener detalles completos de la carpeta y llamar al handler
              try {
                const carpetaCompleta = await CarpetasAPI.obtener(
                  subcarpeta.id
                );
                await onSeleccionar(carpetaCompleta);
              } catch (error) {
                console.error("Error navegando a carpeta:", error);
              }
            }}
          >
            📁 {subcarpeta.nombre}
            {subcarpeta.cantidad_documentos > 0 && (
              <span className="ArbolCarpetas__contador">
                ({subcarpeta.cantidad_documentos})
              </span>
            )}
          </button>

          <div className="ArbolCarpetas__acciones">
            <button
              className="ArbolCarpetas__accion"
              onClick={() => setMostrarCrearEn(subcarpeta.id)}
              title="Crear subcarpeta"
            >
              ✚
            </button>
            {onEliminarCarpeta && (
              <button
                className="ArbolCarpetas__accion ArbolCarpetas__accion--eliminar"
                onClick={() => onEliminarCarpeta(subcarpeta.id)}
                title="Eliminar"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {estaExpandida && tieneSubs && (
          <div className="ArbolCarpetas__subcarpetas">
            {/* Aquí irían las subcarpetas cargadas recursivamente */}
            {/* Por ahora mostramos un placeholder */}
            <div className="ArbolCarpetas__placeholder">
              ({subcarpeta.cantidad_subcarpetas} subcarpetas)
            </div>
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
        {carpetaActual.subcarpetas.length === 0 ? (
          <p className="ArbolCarpetas__vacio">Sin subcarpetas</p>
        ) : (
          carpetaActual.subcarpetas.map((sub) => renderSubcarpeta(sub))
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
