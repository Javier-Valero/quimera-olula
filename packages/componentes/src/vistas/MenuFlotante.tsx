import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./MenuFlotante.css";

type Posicion = { top: number; left?: number; right?: number };

/**
 * Panel flotante anclado a un elemento. Va en un portal con posición fija para
 * que no lo recorte el contenedor con scroll de la tabla. Se cierra con Escape,
 * al pulsar fuera o al hacer scroll/redimensionar.
 */
export const MenuFlotante = ({
  ancla,
  onCerrar,
  children,
  alineacion = "izquierda",
  etiqueta,
  rol = "menu",
}: {
  ancla: HTMLElement;
  onCerrar: () => void;
  children: ReactNode;
  alineacion?: "izquierda" | "derecha";
  etiqueta: string;
  rol?: "menu" | "dialog";
}) => {
  const panel = useRef<HTMLDivElement>(null);
  const [posicion, setPosicion] = useState<Posicion | null>(null);

  useLayoutEffect(() => {
    const rect = ancla.getBoundingClientRect();
    setPosicion(
      alineacion === "derecha"
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left }
    );
  }, [ancla, alineacion]);

  useEffect(() => {
    // El foco entra en el panel para poder usarlo con teclado.
    panel.current
      ?.querySelector<HTMLElement>("button:not([disabled]), input")
      ?.focus();
  }, [posicion]);

  useEffect(() => {
    const alPulsar = (e: MouseEvent) => {
      const objetivo = e.target as Node;
      if (panel.current?.contains(objetivo) || ancla.contains(objetivo)) return;
      onCerrar();
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onCerrar();
      ancla.focus();
    };
    const alMover = (e: Event) => {
      if (panel.current?.contains(e.target as Node)) return;
      onCerrar();
    };
    document.addEventListener("mousedown", alPulsar);
    document.addEventListener("keydown", alTeclear);
    window.addEventListener("scroll", alMover, true);
    window.addEventListener("resize", onCerrar);
    return () => {
      document.removeEventListener("mousedown", alPulsar);
      document.removeEventListener("keydown", alTeclear);
      window.removeEventListener("scroll", alMover, true);
      window.removeEventListener("resize", onCerrar);
    };
  }, [ancla, onCerrar]);

  return createPortal(
    <div
      ref={panel}
      className="menu-flotante"
      role={rol}
      aria-label={etiqueta}
      style={posicion ?? { visibility: "hidden" }}
    >
      {children}
    </div>,
    document.body
  );
};

/** Opción de un `MenuFlotante` con rol de menú. */
export const OpcionMenu = ({
  icono,
  children,
  onClick,
  deshabilitado,
}: {
  icono?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  deshabilitado?: boolean;
}) => (
  <button
    type="button"
    role="menuitem"
    className="menu-flotante-opcion"
    onClick={onClick}
    disabled={deshabilitado}
  >
    {icono}
    <span>{children}</span>
  </button>
);
