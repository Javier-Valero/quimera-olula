import {
  QDate,
  QInput,
  QSelect,
  QTextArea,
  Tab,
  Tabs,
} from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { Incidencia } from "../../diseño.ts";

export const TabGeneral = ({
  incidencia,
}: {
  incidencia: HookModelo<Incidencia>;
}) => {
  const { uiProps } = incidencia;

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <QInput label="Nombre Cliente" {...uiProps("nombreCliente")} />
        <QDate label="Fecha" {...uiProps("fecha")} />
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
        <div className="Tabs">
          <Tabs>
            <Tab label="Observaciones">
              <QTextArea label="" rows={5} {...uiProps("observaciones")} />
            </Tab>
            <Tab label="Resolución">
              <QTextArea label="" rows={5} {...uiProps("resolucion")} />
            </Tab>
          </Tabs>
        </div>
      </quimera-formulario>
    </div>
  );
};
