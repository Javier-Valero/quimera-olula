import { QIcono } from "../atomos/qicono.tsx";
import { AccionDefinida } from "../moleculas/acciones.ts";
import { desplazarColumna } from "./dominio.ts";
import { MenuFlotante } from "./MenuFlotante.tsx";
import "./SelectorColumnas.css";

/**
 * Qué acciones salen como botón y en qué orden. Solo se pueden elegir las que
 * tienen id; el resto va siempre al desplegable.
 */
export const PersonalizarAcciones = ({
  ancla,
  acciones,
  destacadas,
  personalizada,
  onCambiar,
  onRestaurar,
  onCerrar,
}: {
  ancla: HTMLElement;
  acciones: AccionDefinida[];
  /** Ids que salen ahora como botón, en su orden. */
  destacadas: string[];
  /** El usuario ya eligió (se puede restaurar). */
  personalizada: boolean;
  onCambiar: (destacadas: string[]) => void;
  onRestaurar: () => void;
  onCerrar: () => void;
}) => {
  const conId = acciones.filter(
    (accion): accion is AccionDefinida & { id: string } => !!accion.id
  );
  const porId = new Map(conId.map((accion) => [accion.id, accion]));
  const ordenadas = [
    ...destacadas.flatMap((id) => porId.get(id) ?? []),
    ...conId.filter((accion) => !destacadas.includes(accion.id)),
  ];

  return (
    <MenuFlotante
      ancla={ancla}
      onCerrar={onCerrar}
      alineacion="derecha"
      etiqueta="Botones destacados"
      rol="dialog"
    >
      <div className="selector-columnas">
        <p className="selector-columnas-ayuda">
          Las acciones marcadas salen como botón, en este orden. El resto, en «Más
          acciones».
        </p>
        <ul>
          {ordenadas.map(({ id, texto }) => {
            const destacada = destacadas.includes(id);
            const posicion = destacadas.indexOf(id);
            return (
              <li key={id} data-visible={destacada}>
                <label>
                  <input
                    type="checkbox"
                    checked={destacada}
                    onChange={() =>
                      onCambiar(
                        destacada
                          ? destacadas.filter((otro) => otro !== id)
                          : [...destacadas, id]
                      )
                    }
                  />
                  <span>{texto}</span>
                </label>
                {destacada && (
                  <span className="selector-columnas-mover">
                    <button
                      type="button"
                      aria-label={`Subir ${texto}`}
                      disabled={posicion === 0}
                      onClick={() => onCambiar(desplazarColumna(destacadas, id, -1))}
                    >
                      <QIcono nombre="arriba" tamaño="xs" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar ${texto}`}
                      disabled={posicion === destacadas.length - 1}
                      onClick={() => onCambiar(desplazarColumna(destacadas, id, 1))}
                    >
                      <QIcono nombre="abajo" tamaño="xs" />
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="selector-columnas-pie">
          <button
            type="button"
            disabled={!personalizada}
            onClick={() => {
              onRestaurar();
              onCerrar();
            }}
          >
            Restaurar botones por defecto
          </button>
        </div>
      </div>
    </MenuFlotante>
  );
};
