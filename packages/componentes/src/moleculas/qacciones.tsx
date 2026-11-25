import { useState } from "react";
import { iconoAccionBoton } from "../atomos/icono_accion.ts";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { AccionesPersonalizables } from "../vistas/AccionesPersonalizables.tsx";
import { Accion, AccionDefinida, accionPrincipal } from "./acciones.ts";
import "./qacciones.css";

export type { Accion, AccionDefinida };

export const QuimeraAcciones = ({
  acciones,
  vertical,
  pantalla,
  grupo,
}: {
  acciones: (Accion | false)[];
  vertical?: boolean;
  /** Con `pantalla` y `grupo`, el usuario elige qué acciones (con `id`) salen
   *  como botón; el resto va al desplegable, y lo que no cabe también. */
  pantalla?: string;
  grupo?: string;
}) => {
  const [activo, setActivo] = useState(false);

  const handleAccionesClick = () => {
    setActivo((prev) => !prev);
  };

  const renderItemAccion = (accion: Accion) => {
    if (typeof accion === "object" && accion.icono && !accion.texto) {
      return (
        <span key={accion.icono} onClick={accion.onClick}>
          <QIcono nombre={accion.icono} tamaño="sm" />
        </span>
      );
    } else if (accion && typeof accion === "object") {
      // Borrar/Eliminar: secundaria y en rojo (no el naranja de aviso); el
      // rojo relleno queda para el botón que confirma en el modal.
      const destructiva =
        !!accion.advertencia &&
        !!accion.texto &&
        iconoAccionBoton(accion.texto) === "eliminar";
      return (
        <QBoton
          key={accion.texto || accion.icono}
          onClick={accion.onClick}
          deshabilitado={accion.deshabilitado}
          advertencia={accion.advertencia && !destructiva}
          destructivo={destructiva}
          variante={
            destructiva ? "borde" : accion.deshabilitado ? accion.variante : "solido"
          }
        >
          {accion.texto}
        </QBoton>
      );
    } else {
      return null;
    }
  };

  const renderItemsAcciones = (
    acciones: (Accion | false)[],
    inline = false
  ) => {
    return (
      <div className={inline ? "acciones acciones-inline" : "acciones"}>
        {acciones.map((accion: Accion) => renderItemAccion(accion))}
      </div>
    );
  };

  const renderAcciones = (accionesGenerales: AccionDefinida[]) => {
    const principal = accionPrincipal(accionesGenerales);
    const resto = accionesGenerales.filter((accion) => accion !== principal);

    return (
      <div className="actions">
        <div className="header">
          {principal && renderItemAccion(principal)}
          {resto.length > 0 && (
            <QBoton
              key="acciones"
              onClick={handleAccionesClick}
              variante="borde"
              props={{
                "aria-label": "Más acciones",
                "aria-expanded": activo,
                title: "Más acciones",
              }}
            >
              <QIcono nombre="mas_opciones" tamaño="sm" />
            </QBoton>
          )}
        </div>
        {activo && resto.length > 0 && renderItemsAcciones(resto)}
      </div>
    );
  };

  const render = () => {
    const accionesGenerales = acciones.filter(
      (accion): accion is AccionDefinida => Boolean(accion)
    );

    return (
      <quimera-acciones
        className={`${vertical === true ? "vertical" : ""} ${activo ? "abierto" : ""}`.trim()}
      >
        {/* Con una sola acción no hay nada que desplegar: se muestra el botón
            directamente, también en modo vertical, y el usuario se ahorra el
            clic en "Acciones". El recuento va sobre la lista ya filtrada
            porque los consumidores pasan entradas condicionales
            (`condicion && {...}`) que pueden colapsar a una sola. */}
        {accionesGenerales.length === 1 &&
          renderItemAccion(accionesGenerales[0])}
        {accionesGenerales.length > 1 &&
          vertical === true &&
          renderAcciones(accionesGenerales)}
        {accionesGenerales.length > 1 &&
          vertical !== true &&
          renderItemsAcciones(accionesGenerales, true)}
      </quimera-acciones>
    );
  };

  if (pantalla && grupo) {
    return (
      <AccionesPersonalizables
        acciones={acciones.filter((accion): accion is AccionDefinida => Boolean(accion))}
        pantalla={pantalla}
        grupo={grupo}
        vertical={vertical === true}
      />
    );
  }

  return render();
};
