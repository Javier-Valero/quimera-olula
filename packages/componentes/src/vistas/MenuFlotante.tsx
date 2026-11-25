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

  const focoDentro = useRef(false);

  useLayoutEffect(() => {
    const rect = ancla.getBoundingClientRect();
    const margen = 8;
    const ancho = panel.current?.offsetWidth ?? 0;
    const alto = panel.current?.offsetHeight ?? 0;
    // Si no cabe debajo pero sí encima, se abre hacia arriba.
    const top =
      rect.bottom + 4 + alto > window.innerHeight && rect.top - 4 - alto > 0
        ? rect.top - 4 - alto
        : rect.bottom + 4;
    // Sin salirse horizontalmente de la ventana.
    const maxLado = Math.max(margen, window.innerWidth - ancho - margen);
    setPosicion(
      alineacion === "derecha"
        ? {
            top,
            right: Math.min(Math.max(window.innerWidth - rect.right, margen), maxLado),
          }
        : { top, left: Math.min(Math.max(rect.left, margen), maxLado) }
    );
  }, [ancla, alineacion]);

  useEffect(() => {
    // El foco entra en el panel para poder usarlo con teclado.
    panel.current
      ?.querySelector<HTMLElement>(
        "button:not([disabled]), input:not([disabled])"
      )
      ?.focus();
  }, [posicion]);

  // Al cerrarse (elegir opción, Escape...) el foco vuelve al botón que lo abrió,
  // salvo que el usuario haya pulsado fuera.
  useEffect(
    () => () => {
      if (focoDentro.current) ancla.focus();
    },
    [ancla]
  );

  const alTeclearPanel = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (rol !== "menu") return;
    const opciones = Array.from(
      panel.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])'
      ) ?? []
    );
    if (!opciones.length) return;
    const actual = opciones.indexOf(document.activeElement as HTMLElement);
    const destino =
      e.key === "ArrowDown"
        ? (actual + 1) % opciones.length
        : e.key === "ArrowUp"
          ? (actual - 1 + opciones.length) % opciones.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? opciones.length - 1
              : -1;
    if (destino < 0) return;
    e.preventDefault();
    opciones[destino].focus();
  };

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
      onKeyDown={alTeclearPanel}
      onFocus={() => (focoDentro.current = true)}
      onBlur={(e) => {
        if (!panel.current?.contains(e.relatedTarget as Node | null))
          focoDentro.current = false;
      }}
      // El portal propaga eventos de React al th (ordenaría/arrastraría la columna).
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
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
  destructiva,
}: {
  icono?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  deshabilitado?: boolean;
  /** Borrar y similares: en rojo. */
  destructiva?: boolean;
}) => (
  <button
    type="button"
    role="menuitem"
    className="menu-flotante-opcion"
    data-destructiva={destructiva || undefined}
    onClick={onClick}
    disabled={deshabilitado}
  >
    {icono}
    <span>{children}</span>
  </button>
);
