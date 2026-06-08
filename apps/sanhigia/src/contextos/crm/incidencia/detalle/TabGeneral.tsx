import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.js";
import { Incidencia } from "../diseño.ts";
import "./TabGeneral.css";

/**
 * Tab General: formulario de edición de incidencia.
 *
 * Layout: usa <quimera-formulario> (grid de 12 columnas).
 * El posicionado de cada campo se controla en TabGeneral.css
 * mediante selectores de atributo sobre el elemento renderizado:
 *
 *   quimera-input[nombre="descripcion"]   { grid-column: span 6; }
 *   quimera-select[nombre="estado"]       { grid-column: span 3; }
 *   quimera-select[nombre="prioridad"]    { grid-column: span 3; }
 *
 * El atributo `nombre` llega automáticamente al spread de uiProps("campo").
 */
export const TabGeneral = ({ form }: { form: HookModelo<Incidencia> }) => {
  const { uiProps } = form;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        {/*
         * Fila 1: Cliente (6 cols) + Fecha (6 cols)
         */}
        <QInput label="Cliente" {...uiProps("nombreCliente")} />
        <QInput label="Fecha" {...uiProps("fecha")} />

        {/*
         * Fila 2: Descripción (12 cols, ancho completo)
         */}
        <QInput label="Descripción" {...uiProps("descripcion")} />

        {/*
         * Fila 3: Estado (6 cols) + Prioridad (6 cols)
         */}
        <QSelect
          label="Estado"
          {...uiProps("estado")}
          opciones={[
            { valor: "Pendiente", descripcion: "Pendiente" },
            { valor: "Nueva", descripcion: "Nueva" },
            { valor: "Pendiente de datos", descripcion: "Pendiente de datos" },
            { valor: "Asignada", descripcion: "Asignada" },
            { valor: "Rechazada", descripcion: "Rechazada" },
            { valor: "Cerrada", descripcion: "Cerrada" },
          ]}
        />
        <QSelect
          label="Prioridad"
          {...uiProps("prioridad")}
          opciones={[
            { valor: "Baja", descripcion: "Baja" },
            { valor: "Media", descripcion: "Media" },
            { valor: "Alta", descripcion: "Alta" },
          ]}
        />

        {/*
         * Fila 4: Descripción larga (12 cols)
         */}
        <QTextArea label="Descripción larga" {...uiProps("descripcionLarga")} />

        {/*
         * Fila 5: En garantía + Resolución
         */}
        {/* <QCheckbox label="En garantía" {...uiProps("enGarantia")} /> */}
        <QTextArea label="Resolución" {...uiProps("resolucion")} />
      </quimera-formulario>
    </div>
  );
};
