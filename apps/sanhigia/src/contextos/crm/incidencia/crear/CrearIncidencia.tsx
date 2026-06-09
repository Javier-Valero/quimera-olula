import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/index.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./dominio.ts";

interface CrearIncidenciaProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}

export const CrearIncidencia = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: CrearIncidenciaProps) => {
  const nuevaIncidencia = useModelo(metaNuevaIncidencia, nuevaIncidenciaVacia);
  const { intentar } = useContext(ContextoError);

  const guardar = async () => {
    const id = await intentar(() => postIncidencia(nuevaIncidencia.modelo));
    nuevaIncidencia.init(nuevaIncidenciaVacia);
    const incidenciaCreada = await getIncidencia(id);
    publicar("incidencia_creada", incidenciaCreada);
    onCancelar();
  };

  if (!activo) return null;

  return (
    <QModal
      abierto={activo}
      nombre="crear_incidencia"
      titulo="Nueva Incidencia"
      onCerrar={onCancelar}
    >
      <div className="CrearIncidencia">
        <quimera-formulario>
          <QInput
            label="Descripción"
            autoSeleccion={true}
            {...nuevaIncidencia.uiProps("descripcion")}
          />
          <QInput
            label="ID Cliente"
            {...nuevaIncidencia.uiProps("clienteId")}
          />
          <QSelect
            label="Tipo"
            {...nuevaIncidencia.uiProps("tipoIncidencia")}
            opciones={[
              { valor: "Proveedor", descripcion: "Producto" },
              { valor: "Transportista", descripcion: "Transporte" },
            ]}
          />
          <QTextArea
            label="Descripción Larga"
            {...nuevaIncidencia.uiProps("descripcionLarga")}
          />
        </quimera-formulario>
        <div className="crear-incidencia-botones">
          <QBoton onClick={guardar} deshabilitado={!nuevaIncidencia.valido}>
            Crear
          </QBoton>
          <QBoton tipo="reset" variante="texto" onClick={onCancelar}>
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
