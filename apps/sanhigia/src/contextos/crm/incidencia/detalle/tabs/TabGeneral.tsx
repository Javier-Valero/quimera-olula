import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import {
  QBoton,
  QCheckbox,
  QDate,
  QInput,
  QSelect,
  QTextArea,
  Tab,
  Tabs,
} from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Incidencia } from "../../diseño.ts";
import "./TabGeneral.css";

export const TabGeneral = ({
  incidencia,
}: {
  incidencia: HookModelo<Incidencia>;
}) => {
  const { uiProps, set, modelo } = incidencia;
  const navigate = useNavigate();

  const handleClienteChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({
          ...modelo,
          clienteId: opcion.valor,
          nombreCliente: opcion.descripcion,
        });
      } else {
        set({
          ...modelo,
          clienteId: "",
          nombreCliente: "",
        });
      }
    },
    [modelo, set]
  );

  const handleArticuloChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({ ...modelo, articuloId: opcion.valor });
      } else {
        set({ ...modelo, articuloId: "" });
      }
    },
    [modelo, set]
  );

  // Helper para convertir valores a boolean
  const toBool = (valor: boolean | string | undefined): boolean => {
    return valor === true || valor === "true";
  };

  // Helper para manejar onChange de checkboxes
  const handleCheckboxChange = (campo: keyof Incidencia) => (valor: string) => {
    uiProps(campo as string).onChange(valor === "true" ? "true" : "false");
  };

  // console.log("mimensaje_modelo.articuloId", modelo.articuloId);

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <Cliente
          valor={modelo.clienteId}
          descripcion={modelo.nombreCliente}
          onChange={handleClienteChange}
        />
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

        {modelo.tipoIncidencia === "Proveedor" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Articulo
                valor={modelo.articuloId || ""}
                onChange={handleArticuloChange}
                label="Artículo"
              />
            </div>
            <QCheckbox
              label="En garantía"
              nombre="enGarantia"
              valor={toBool(modelo.enGarantia)}
              onChange={handleCheckboxChange("enGarantia")}
              deshabilitado
            />
          </div>
        )}

        {modelo.presupuestoId && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <QInput
                label={`Presupuesto `}
                nombre="presupuesto"
                valor={modelo.codigoPresupuesto}
                deshabilitado
              />
            </div>
            <QBoton
              tamaño="pequeño"
              onClick={() =>
                navigate(`/ventas/presupuestos/${modelo.presupuestoId}`)
              }
            >
              Ir a presupuesto
            </QBoton>
          </div>
        )}
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
