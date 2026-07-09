import { CarpetaContenido } from "@olula/lib/api/carpetas.ts";
import "./BreadcrumbCarpetas.css";

export interface BreadcrumbCarpetasProps {
  historialCarpetas: CarpetaContenido[];
  onNavegar: (carpeta: CarpetaContenido) => void;
  onIrARaiz: () => void;
}

export const BreadcrumbCarpetas = ({
  historialCarpetas,
  onNavegar,
  onIrARaiz,
}: BreadcrumbCarpetasProps) => {
  if (historialCarpetas.length === 0) {
    return null;
  }

  return (
    <nav className="BreadcrumbCarpetas">
      <button
        className="BreadcrumbCarpetas__home"
        onClick={onIrARaiz}
        title="Ir a raíz"
      >
        📁 Raíz
      </button>

      {historialCarpetas.slice(1).map((carpeta, _idx) => (
        <span key={`breadcrumb-${carpeta.id}`}>
          <span className="BreadcrumbCarpetas__separador">/</span>
          <button
            className="BreadcrumbCarpetas__item"
            onClick={() => onNavegar(carpeta)}
          >
            📁 {carpeta.nombre}
          </button>
        </span>
      ))}
    </nav>
  );
};
