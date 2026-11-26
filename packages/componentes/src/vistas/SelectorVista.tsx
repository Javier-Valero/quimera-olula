import { useCallback, useRef, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import { VistaGuardada } from "./diseño.ts";
import { MenuFlotante, OpcionMenu } from "./MenuFlotante.tsx";
import "./SelectorVista.css";

const ORIGEN: Record<VistaGuardada["origen"], string | null> = {
  usuario: null,
  grupo: "de tu grupo",
  empresa: "de la empresa",
};

const nombreDe = (vista: VistaGuardada) => vista.nombre ?? vista.vista;

/**
 * Selector de vista del listado: la vista por defecto y las vistas con nombre
 * (filtro, columnas, orden y modo guardados), propias, del grupo o de la
 * empresa. Permite guardar la actual como vista nueva, guardar en la activa el
 * filtro de ahora y borrar las propias.
 */
export const SelectorVista = ({
  vistas,
  activa,
  puedeGuardar,
  filtroCambiado,
  onElegir,
  onGuardarComo,
  onGuardarFiltro,
  onBorrar,
}: {
  vistas: VistaGuardada[];
  /** Id de la vista activa ('' = por defecto). */
  activa: string;
  /** Se pueden crear y cambiar vistas propias (servidor disponible y sin bloqueo). */
  puedeGuardar: boolean;
  /** El filtro del listado no es el que guarda la vista activa. */
  filtroCambiado: boolean;
  onElegir: (vista: string) => void;
  onGuardarComo: (nombre: string) => void;
  onGuardarFiltro: () => void;
  onBorrar: (vista: string) => void;
}) => {
  const boton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<"menu" | "nueva" | null>(null);
  const [nombre, setNombre] = useState("");
  const cerrar = useCallback(() => setPanel(null), []);

  const actual = vistas.find((v) => v.vista === activa);
  const propia = actual?.origen === "usuario";
  const titulo = actual ? nombreDe(actual) : "Vista por defecto";

  const guardarComo = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    onGuardarComo(limpio);
    setNombre("");
    cerrar();
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="selector-vista"
        data-activa={activa !== "" || undefined}
        aria-haspopup="menu"
        aria-expanded={panel !== null}
        onClick={() => setPanel(panel ? null : "menu")}
      >
        <QIcono nombre="vista" tamaño="sm" />
        <span className="selector-vista-nombre">{titulo}</span>
        <QIcono nombre="abajo" tamaño="xs" />
      </button>

      {panel === "menu" && boton.current && (
        <MenuFlotante ancla={boton.current} onCerrar={cerrar} etiqueta="Vistas">
          <OpcionMenu
            icono={activa === "" ? <QIcono nombre="check" tamaño="sm" /> : <span className="selector-vista-hueco" />}
            onClick={() => {
              cerrar();
              onElegir("");
            }}
          >
            Vista por defecto
          </OpcionMenu>
          {vistas.map((vista) => (
            <OpcionMenu
              key={vista.vista}
              icono={
                vista.vista === activa ? (
                  <QIcono nombre="check" tamaño="sm" />
                ) : (
                  <span className="selector-vista-hueco" />
                )
              }
              onClick={() => {
                cerrar();
                onElegir(vista.vista);
              }}
            >
              {nombreDe(vista)}
              {ORIGEN[vista.origen] && (
                <small className="selector-vista-origen"> · {ORIGEN[vista.origen]}</small>
              )}
            </OpcionMenu>
          ))}
          {puedeGuardar && (
            <>
              <hr className="menu-flotante-separador" />
              <OpcionMenu
                icono={<QIcono nombre="guardar" tamaño="sm" />}
                onClick={() => setPanel("nueva")}
              >
                Guardar como vista nueva…
              </OpcionMenu>
              {propia && (
                <OpcionMenu
                  icono={<QIcono nombre="filtro" tamaño="sm" />}
                  deshabilitado={!filtroCambiado}
                  onClick={() => {
                    cerrar();
                    onGuardarFiltro();
                  }}
                >
                  Guardar el filtro actual en «{titulo}»
                </OpcionMenu>
              )}
              {propia && (
                <OpcionMenu
                  icono={<QIcono nombre="eliminar" tamaño="sm" />}
                  destructiva
                  onClick={() => {
                    cerrar();
                    onBorrar(activa);
                  }}
                >
                  Borrar la vista «{titulo}»
                </OpcionMenu>
              )}
            </>
          )}
        </MenuFlotante>
      )}

      {panel === "nueva" && boton.current && (
        <MenuFlotante ancla={boton.current} onCerrar={cerrar} etiqueta="Guardar como vista nueva" rol="dialog">
          <form
            className="selector-vista-nueva"
            onSubmit={(e) => {
              e.preventDefault();
              guardarComo();
            }}
          >
            <label>
              <span>Nombre de la vista</span>
              <input
                value={nombre}
                maxLength={60}
                placeholder="Mis pendientes"
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>
            <p className="selector-vista-ayuda">
              Guarda el filtro, las columnas, el orden y el modo de ahora.
            </p>
            <div className="selector-vista-botones">
              <button type="button" onClick={cerrar}>
                Cancelar
              </button>
              <button type="submit" disabled={!nombre.trim()}>
                Guardar
              </button>
            </div>
          </form>
        </MenuFlotante>
      )}
    </>
  );
};
