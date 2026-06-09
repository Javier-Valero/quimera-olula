import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Incidencia } from "../diseño.ts";
import "./TabGeneral.css";

interface TabGeneralProps {
  form: HookModelo<Incidencia>;
  incidencia: Incidencia;
}

export const TabGeneral = ({ form }: TabGeneralProps) => {
  const { uiProps } = form;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QDate label="Fecha" {...uiProps("fecha")} />
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <QTextArea label="Descripción Larga" {...uiProps("descripcionLarga")} />
        <QInput label="Cliente" {...uiProps("nombreCliente")} />
        <QSelect
          label="Prioridad"
          {...uiProps("prioridad")}
          opciones={[
            { valor: "Baja", descripcion: "Baja" },
            { valor: "Media", descripcion: "Media" },
            { valor: "Alta", descripcion: "Alta" },
          ]}
        />
        <QSelect
          label="Estado"
          {...uiProps("estado")}
          opciones={[
            { valor: "Nueva", descripcion: "Nueva" },
            { valor: "Pendiente", descripcion: "Pendiente" },
            { valor: "Pendiente de datos", descripcion: "Pendiente de datos" },
            { valor: "Asignada", descripcion: "Asignada" },
            { valor: "Rechazada", descripcion: "Rechazada" },
            { valor: "Cerrada", descripcion: "Cerrada" },
          ]}
        />
        <QSelect
          label="Tipo"
          {...uiProps("tipoIncidencia")}
          opciones={[
            { valor: "Proveedor", descripcion: "Producto" },
            { valor: "Transportista", descripcion: "Transporte" },
          ]}
        />

        <QInput label="Resolución" {...uiProps("resolucion")} />
      </quimera-formulario>
    </div>
  );
};
