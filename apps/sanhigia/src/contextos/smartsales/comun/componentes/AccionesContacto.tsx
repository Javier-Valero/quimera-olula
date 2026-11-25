import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { Link } from "react-router";
import "./AccionesContacto.css";

// Una acción: enlace externo (tel:, mailto:, WhatsApp, mapa) con href, o pantalla de la app con ruta.
// Sin href ni ruta (p. ej. sin teléfono) se muestra atenuada.
export type AccionContacto = {
    icono: string;
    texto: string;
    href?: string | null;
    ruta?: string;
};

const Contenido = ({ icono, texto }: Pick<AccionContacto, "icono" | "texto">) => (
    <>
        <span className="icono">
            <QIcono nombre={icono} />
        </span>
        <span>{texto}</span>
    </>
);

// Fila de acciones con icono redondo (Llamar, Email, WhatsApp, Cómo llegar, + Tarea…) de las fichas de
// cliente y de contacto.
export const AccionesContacto = ({ acciones }: { acciones: AccionContacto[] }) => (
    <nav className="AccionesContacto" aria-label="Acciones" style={{ gridTemplateColumns: `repeat(${acciones.length}, 1fr)` }}>
        {acciones.map(({ icono, texto, href, ruta }) =>
            ruta ? (
                <Link key={texto} className="accion" to={ruta}>
                    <Contenido icono={icono} texto={texto} />
                </Link>
            ) : href ? (
                <a key={texto} className="accion" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    <Contenido icono={icono} texto={texto} />
                </a>
            ) : (
                <span key={texto} className="accion deshabilitada">
                    <Contenido icono={icono} texto={texto} />
                </span>
            )
        )}
    </nav>
);
