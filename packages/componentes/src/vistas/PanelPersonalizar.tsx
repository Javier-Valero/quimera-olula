import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { QIcono } from "../atomos/qicono.tsx";
import {
  SeccionPersonalizable,
  activarPersonalizar,
  resaltarSeccion,
  useModoPersonalizar,
  useRefDestino,
} from "./modo_personalizar.ts";
import "./PanelPersonalizar.css";

const Seccion = ({ seccion }: { seccion: SeccionPersonalizable }) => {
  const destino = useRefDestino(seccion.id);
  return (
    <section
      className="panel-personalizar-seccion"
      aria-labelledby={`panel-personalizar-${seccion.id}`}
      onMouseEnter={() => resaltarSeccion(seccion.id)}
      onMouseLeave={() => resaltarSeccion(null)}
      onFocus={() => resaltarSeccion(seccion.id)}
    >
      <h3 id={`panel-personalizar-${seccion.id}`}>{seccion.titulo}</h3>
      <div ref={destino} />
    </section>
  );
};

/** Panel lateral del modo personalizar: una sección por componente de la pantalla. */
const PanelPersonalizar = ({
  secciones,
  onCerrar,
}: {
  secciones: SeccionPersonalizable[];
  onCerrar: () => void;
}) => {
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      // Un menú o diálogo abierto dentro del panel se cierra primero.
      if (e.key !== "Escape" || document.querySelector(".menu-flotante")) return;
      onCerrar();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return createPortal(
    <aside
      ref={panel}
      className="panel-personalizar"
      aria-label="Personalizar pantalla"
      tabIndex={-1}
    >
      <header className="panel-personalizar-cabecera">
        <h2>Personalizar pantalla</h2>
        <button
          type="button"
          className="panel-personalizar-cerrar"
          aria-label="Cerrar personalizar"
          onClick={onCerrar}
        >
          <QIcono nombre="cerrar" tamaño="sm" />
        </button>
      </header>
      <p className="panel-personalizar-ayuda">
        Los cambios se guardan al momento y solo los ves tú.
      </p>
      {secciones.map((seccion) => (
        <Seccion key={seccion.id} seccion={seccion} />
      ))}
    </aside>,
    document.body
  );
};

/**
 * Botón de la cabecera que activa el modo personalizar. Solo aparece si la
 * pantalla tiene algo personalizable.
 */
export const BotonPersonalizar = () => {
  const { activo, secciones } = useModoPersonalizar();
  const boton = useRef<HTMLButtonElement>(null);

  // Al cambiar de pantalla sin secciones, el modo se apaga solo.
  useEffect(() => {
    if (activo && secciones.length === 0) activarPersonalizar(false);
  }, [activo, secciones.length]);

  if (secciones.length === 0) return null;

  const cerrar = () => {
    activarPersonalizar(false);
    boton.current?.focus();
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        id="boton-personalizar"
        className={activo ? "activo" : ""}
        aria-pressed={activo}
        aria-label="Personalizar pantalla"
        title="Personalizar pantalla"
        onClick={() => (activo ? cerrar() : activarPersonalizar(true))}
      >
        <QIcono nombre="ajustes" tamaño="sm" />
      </button>
      {activo && <PanelPersonalizar secciones={secciones} onCerrar={cerrar} />}
    </>
  );
};
