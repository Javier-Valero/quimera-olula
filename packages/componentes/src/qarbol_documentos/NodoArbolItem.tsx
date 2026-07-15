import { QBoton, QIcono } from "@olula/componentes/index.js";
import {
  DocumentoArbol,
  esCarpetaArbol,
  NodoArbol,
} from "@olula/lib/api/documentos.ts";
import "./NodoArbolItem.css";

export interface NodoArbolItemProps {
  nodo: NodoArbol;
  nivel: number;
  expandidos: Set<string>;
  onToggle: (id: string) => void;
  onDescargar: (documento: DocumentoArbol) => void;
  onCrearCarpeta: (carpetaPadreId: string) => void;
  onAnadirDocumento: (carpetaPadreId: string) => void;
}

export const NodoArbolItem = ({
  nodo,
  nivel,
  expandidos,
  onToggle,
  onDescargar,
  onCrearCarpeta,
  onAnadirDocumento,
}: NodoArbolItemProps) => {
  const sangria = { paddingLeft: `${nivel * 1.25}rem` };

  if (esCarpetaArbol(nodo)) {
    const abierta = expandidos.has(nodo.id);
    return (
      <div className="NodoArbolItem">
        <div
          className="NodoArbolItem-fila NodoArbolItem-carpeta"
          style={sangria}
          onClick={() => onToggle(nodo.id)}
        >
          <span className="NodoArbolItem-chevron">
            <QIcono nombre={abierta ? "abajo" : "derecha"} tamaño="md" />
          </span>
          <span className="NodoArbolItem-icono">
            <QIcono
              nombre={abierta ? "carpeta_abierta" : "carpeta"}
              tamaño="lg"
              relleno
            />
          </span>
          <span className="NodoArbolItem-nombre">{nodo.nombre}</span>
          <QBoton
            tamaño="pequeño"
            variante="borde"
            onClick={(e) => {
              e.stopPropagation();
              onAnadirDocumento(nodo.id);
            }}
          >
            Añadir
          </QBoton>
          <QBoton
            tamaño="pequeño"
            variante="borde"
            onClick={(e) => {
              e.stopPropagation();
              onCrearCarpeta(nodo.id);
            }}
          >
            Nueva carpeta
          </QBoton>
        </div>
        {abierta &&
          nodo.contenido.map((hijo) => (
            <NodoArbolItem
              key={hijo.id}
              nodo={hijo}
              nivel={nivel + 1}
              expandidos={expandidos}
              onToggle={onToggle}
              onDescargar={onDescargar}
              onCrearCarpeta={onCrearCarpeta}
              onAnadirDocumento={onAnadirDocumento}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="NodoArbolItem">
      <div
        className="NodoArbolItem-fila NodoArbolItem-documento"
        style={sangria}
      >
        <span className="NodoArbolItem-chevron" />
        <span className="NodoArbolItem-icono">
          <QIcono nombre="fichero" tamaño="lg" />
        </span>
        <span className="NodoArbolItem-nombre">{nodo.nombre}</span>
        <span className="NodoArbolItem-fecha">
          {nodo.fechaSubida} {nodo.horaSubida}
        </span>
        <QBoton
          tamaño="pequeño"
          variante="borde"
          onClick={() => onDescargar(nodo)}
        >
          Descargar
        </QBoton>
      </div>
    </div>
  );
};
