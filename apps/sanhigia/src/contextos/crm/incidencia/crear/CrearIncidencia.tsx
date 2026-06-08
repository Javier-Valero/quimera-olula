import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useContext } from "react";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./dominio.ts";

/**
 * Modal para crear nueva incidencia
 * Llama a la API directamente en la vista
 */
export const CrearIncidencia = ({
  publicar,
  onCancelar,
  activo,
}: {
  publicar: EmitirEvento;
  onCancelar: () => void;
  activo: boolean;
}) => {
  const form = useModelo(metaNuevaIncidencia, nuevaIncidenciaVacia());
  const { intentar } = useContext(ContextoError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.valido) {
      return;
    }

    // Llamar API directamente en la vista
    const id = await intentar(() => postIncidencia(form.modelo));

    if (id) {
      const incidenciaCreada = await intentar(() => getIncidencia(id));
      publicar("incidencia_creada", incidenciaCreada);
      form.init(nuevaIncidenciaVacia());
      onCancelar();
    }
  };

  if (!activo) return null;

  const { uiProps } = form;

  return (
    <div className="CrearIncidencia modal">
      <h2>Crear Nueva Incidencia</h2>

      <quimera-formulario>
        <QInput label="Cliente *" {...uiProps("nombreCliente")} />

        <QInput label="Descripción *" {...uiProps("descripcion")} />

        <QInput label="Fecha *" {...uiProps("fecha")} />

        <QSelect
          label="Prioridad *"
          {...uiProps("prioridad")}
          opciones={[
            { valor: "Baja", descripcion: "Baja" },
            { valor: "Media", descripcion: "Media" },
            { valor: "Alta", descripcion: "Alta" },
          ]}
        />

        <QSelect
          label="Estado *"
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

        <QInput label="Cliente ID" {...uiProps("clienteId")} />
      </quimera-formulario>

      <div className="botones">
        <QBoton onClick={handleSubmit} deshabilitado={!form.valido}>
          Crear
        </QBoton>
        <QBoton onClick={onCancelar}>Cancelar</QBoton>
      </div>
    </div>
  );
};
