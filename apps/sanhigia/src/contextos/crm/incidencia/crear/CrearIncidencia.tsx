import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { FacturaCliente } from "#/ventas/comun/componentes/facturaCliente.tsx";
// import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal, QSelect, QTextArea } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./crear.ts";

export const CrearIncidencia = ({ publicar }: { publicar: EmitirEvento }) => {
  const { intentar } = useContext(ContextoError);

  const [creando, setCreando] = useState(false);
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaIncidencia,
    nuevaIncidenciaVacia
  );

  const crear = useCallback(async () => {
    setCreando(true);
    const id = await intentar(() => postIncidencia(modelo));
    const incidencia = await intentar(() => getIncidencia(id));
    publicar("incidencia_creada", incidencia);
  }, [modelo, publicar, intentar]);

  const cancelar = useCallback(() => {
    if (!creando) publicar("creacion_incidencia_cancelada");
  }, [creando, publicar]);

  const handleClienteChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        modelo.clienteId = opcion.valor;
        modelo.nombreCliente = opcion.descripcion;
      }
    },
    [modelo]
  );

  const handleFacturaChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        modelo.facturaId = opcion.valor;
      }
    },
    [modelo]
  );

  const handleArticuloChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        modelo.articuloId = opcion.valor;
      }
    },
    [modelo]
  );

  // console.log("mimensaje_modelo.clienteId", modelo.clienteId);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Nueva Incidencia"
      onCerrar={cancelar}
    >
      <div className="CrearIncidencia">
        <quimera-formulario>
          <QInput label="Descripción" {...uiProps("descripcion")} />
          {/* <QInput label="Nombre Cliente" {...uiProps("nombreCliente")} /> */}
          <Cliente
            valor={modelo.clienteId}
            descripcion={modelo.nombreCliente}
            onChange={handleClienteChange}
          />
          <FacturaCliente
            clienteId={modelo.clienteId}
            valor={modelo.facturaId || ""}
            onChange={handleFacturaChange}
          />
          <Articulo
            valor={modelo.articuloId || ""}
            onChange={handleArticuloChange}
          />

          <QSelect
            label="Tipo"
            {...uiProps("tipoIncidencia")}
            opciones={[
              { valor: "Proveedor", descripcion: "Producto" },
              { valor: "Transportista", descripcion: "Transporte" },
            ]}
          />
          <QTextArea
            label="Observaciones"
            rows={5}
            {...uiProps("observaciones")}
          />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Guardar
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
