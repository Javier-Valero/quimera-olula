import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { useEsMovil } from "../maestro/useEsMovil.ts";
import {
  AccionDefinida,
  accionPrincipal,
  esDestructiva,
  iconoAccion,
} from "../moleculas/acciones.ts";
import { botonesQueCaben, desbordarAcciones, repartirAcciones } from "./dominio.ts";
import { MenuFlotante, OpcionMenu } from "./MenuFlotante.tsx";
import { PersonalizarAcciones } from "./PersonalizarAcciones.tsx";
import { usePreferenciasVista } from "./usePreferenciasVista.ts";
import "./AccionesPersonalizables.css";

const clave = (accion: AccionDefinida, i: number) => accion.id ?? `${accion.texto}-${i}`;

/** Botón de una acción destacada; en móvil, solo el icono (si lo tiene). */
const BotonAccion = ({ accion, soloIcono }: { accion: AccionDefinida; soloIcono: boolean }) => {
  const destructiva = esDestructiva(accion);
  const icono = iconoAccion(accion);
  const conIcono = soloIcono && icono;
  return (
    <QBoton
      onClick={accion.onClick}
      deshabilitado={accion.deshabilitado}
      advertencia={accion.advertencia && !destructiva}
      destructivo={destructiva}
      variante={destructiva ? "borde" : accion.deshabilitado ? accion.variante : "solido"}
      props={{
        ...(conIcono && { "aria-label": accion.texto, title: accion.texto }),
        ...(accion.deshabilitado && { "aria-disabled": true }),
      }}
    >
      {conIcono ? <QIcono nombre={icono} tamaño="sm" /> : accion.texto}
    </QBoton>
  );
};

/**
 * Grupo de acciones que el usuario personaliza: elige cuáles salen como botón
 * (y en qué orden); el resto va al desplegable. Si los botones no caben en el
 * ancho disponible, los últimos pasan al desplegable. En móvil, solo iconos.
 */
export const AccionesPersonalizables = ({
  acciones,
  pantalla,
  grupo,
}: {
  acciones: AccionDefinida[];
  pantalla: string;
  grupo: string;
}) => {
  const preferencias = usePreferenciasVista(pantalla);
  const { config, personalizable } = preferencias;
  const esMovil = useEsMovil();

  if (import.meta.env.DEV) {
    acciones
      .filter((accion) => accion.id && !iconoAccion(accion))
      .forEach((accion) =>
        console.warn(
          `Acción «${accion.id}» de ${pantalla}/${grupo} sin icono: en móvil saldrá con texto.`
        )
      );
  }

  const destacadas = config?.acciones?.[grupo];
  const reparto = repartirAcciones(acciones, destacadas, accionPrincipal);

  const contenedor = useRef<HTMLElement>(null);
  const medida = useRef<HTMLDivElement>(null);
  // QBoton no expone su botón: se toma del evento para anclar el menú.
  const botonMas = useRef<HTMLElement | null>(null);
  const [ancho, setAncho] = useState<number | null>(null);
  const [caben, setCaben] = useState(Number.POSITIVE_INFINITY);
  const [panel, setPanel] = useState<"menu" | "personalizar" | null>(null);
  const cerrar = useCallback(() => setPanel(null), []);

  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(([entrada]) =>
      setAncho(entrada.contentRect.width)
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  // Los anchos se miden en una copia invisible de los botones destacados.
  const firma = `${reparto.botones.map(clave).join("|")}:${esMovil}`;
  useLayoutEffect(() => {
    if (ancho === null || !medida.current || !contenedor.current) return;
    const hijos = Array.from(medida.current.children) as HTMLElement[];
    const anchoMas = hijos.pop()?.offsetWidth ?? 0;
    const hueco = parseFloat(getComputedStyle(contenedor.current).columnGap) || 0;
    setCaben(
      botonesQueCaben(
        hijos.map((hijo) => hijo.offsetWidth),
        ancho,
        hueco,
        anchoMas,
        reparto.menu.length > 0 || personalizable
      )
    );
  }, [ancho, firma, reparto.menu.length, personalizable]);

  const visible = desbordarAcciones(reparto, caben);
  const conMenu = visible.menu.length > 0 || personalizable;

  const guardarDestacadas = (ids: string[]) =>
    void preferencias.guardar({ ...config, acciones: { ...config?.acciones, [grupo]: ids } });

  const restaurar = () => {
    const resto = { ...config?.acciones };
    delete resto[grupo];
    void preferencias.guardar({ ...config, acciones: resto });
  };

  return (
    <quimera-acciones className="acciones-personalizables" ref={contenedor}>
      {visible.botones.map((accion, i) => (
        <BotonAccion key={clave(accion, i)} accion={accion} soloIcono={esMovil} />
      ))}
      {conMenu && (
        <QBoton
          variante="borde"
          onClick={(e) => {
            botonMas.current = e.currentTarget as HTMLElement;
            setPanel(panel ? null : "menu");
          }}
          props={{
            "aria-label": "Más acciones",
            "aria-haspopup": "menu",
            "aria-expanded": panel !== null,
            title: "Más acciones",
          }}
        >
          <QIcono nombre="mas_opciones" tamaño="sm" />
        </QBoton>
      )}

      <div className="acciones-medida" ref={medida} aria-hidden="true" inert>
        {reparto.botones.map((accion, i) => (
          <BotonAccion key={clave(accion, i)} accion={accion} soloIcono={esMovil} />
        ))}
        <QBoton variante="borde">
          <QIcono nombre="mas_opciones" tamaño="sm" />
        </QBoton>
      </div>

      {panel === "menu" && botonMas.current && (
        <MenuFlotante
          ancla={botonMas.current}
          onCerrar={cerrar}
          alineacion="derecha"
          etiqueta="Más acciones"
        >
          {visible.menu.map((accion, i) => {
            const icono = iconoAccion(accion);
            return (
              <OpcionMenu
                key={clave(accion, i)}
                icono={icono && <QIcono nombre={icono} tamaño="sm" />}
                deshabilitado={accion.deshabilitado}
                destructiva={esDestructiva(accion)}
                onClick={() => {
                  cerrar();
                  accion.onClick();
                }}
              >
                {accion.texto}
              </OpcionMenu>
            );
          })}
          {personalizable && (
            <>
              {visible.menu.length > 0 && <hr className="menu-flotante-separador" />}
              <OpcionMenu
                icono={<QIcono nombre="ajustes" tamaño="sm" />}
                onClick={() => setPanel("personalizar")}
              >
                Personalizar botones…
              </OpcionMenu>
            </>
          )}
        </MenuFlotante>
      )}

      {panel === "personalizar" && botonMas.current && (
        <PersonalizarAcciones
          ancla={botonMas.current}
          acciones={acciones}
          destacadas={reparto.botones.flatMap((accion) => (accion.id ? [accion.id] : []))}
          personalizada={destacadas !== undefined}
          onCambiar={guardarDestacadas}
          onRestaurar={restaurar}
          onCerrar={cerrar}
        />
      )}
    </quimera-acciones>
  );
};
