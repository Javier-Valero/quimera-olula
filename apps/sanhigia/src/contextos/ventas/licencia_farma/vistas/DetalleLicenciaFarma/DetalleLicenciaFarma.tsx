import {
  Detalle,
  QBoton,
  QDate,
  QInput,
  QModalConfirmacion,
} from "@olula/componentes/index.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useState } from "react";
import { useParams } from "react-router";
import { LicenciaFarma } from "../../diseño.ts";
import { licenciaFarmaVacia, metaLicenciaFarma } from "../../dominio.ts";
import {
  deleteLicenciaFarma,
  getLicenciaFarma,
  patchLicenciaFarma,
} from "../../infraestructura.ts";

export const DetalleLicenciaFarma = ({
  licenciaInicial = null,
  emitir = async () => {},
}: {
  licenciaInicial?: LicenciaFarma | null;
  emitir?: ProcesarEvento;
}) => {
  const params = useParams();
  const licenciaId = licenciaInicial?.id ?? params.id;
  const titulo = (licencia: Entidad) => licencia.id as string;
  const { intentar } = useContext(ContextoError);

  const licencia = useModelo(metaLicenciaFarma, licenciaFarmaVacia);
  const { modelo, init, modificado, valido } = licencia;
  const [estado, setEstado] = useState<"confirmarBorrado" | "edicion">(
    "edicion"
  );

  const onGuardarClicked = async () => {
    await intentar(() => patchLicenciaFarma(modelo.id, modelo));
    const guardada = await getLicenciaFarma(modelo.id);
    init(guardada);
    emitir("LICENCIA_FARMA_CAMBIADA", guardada);
  };

  const onBorrarConfirmado = async () => {
    await intentar(() => deleteLicenciaFarma(modelo.id));
    emitir("LICENCIA_FARMA_BORRADA", modelo);
    setEstado("edicion");
  };

  return (
    <Detalle
      id={licenciaId}
      obtenerTitulo={titulo}
      setEntidad={(o) => init(o)}
      entidad={modelo}
      cargar={getLicenciaFarma}
      cerrarDetalle={() => emitir("CANCELAR_SELECCION")}
    >
      {!!licenciaId && (
        <div>
          <div className="maestro-botones">
            <QBoton onClick={() => setEstado("confirmarBorrado")}>
              Borrar
            </QBoton>
          </div>
          <quimera-formulario>
            <QInput
              label="Tipo de licencia"
              {...licencia.uiProps("tipoLicencia")}
            />
            <QDate
              label="Fecha de caducidad"
              {...licencia.uiProps("fechaCaducidad")}
            />
            <QDate
              label="Fecha de inicio"
              {...licencia.uiProps("fechaInicio")}
            />
            <QDate label="Fecha de fin" {...licencia.uiProps("fechaFin")} />
            <QDate
              label="Revisión de datos"
              {...licencia.uiProps("fechaRevisionDatos")}
            />
            <QDate
              label="Recepción de acuerdos"
              {...licencia.uiProps("fechaRecepcionAcuerdos")}
            />
            <QDate
              label="Envío de documentación"
              {...licencia.uiProps("fechaEnvioDocumentacion")}
            />
            <QInput label="Estado" {...licencia.uiProps("estado")} />
            <QInput label="Cliente" {...licencia.uiProps("nombreCliente")} />
            <QInput label="ID Cliente" {...licencia.uiProps("clienteId")} />
            <QInput label="ID Trato" {...licencia.uiProps("tratoId")} />
            <QInput label="ID Agente" {...licencia.uiProps("agenteId")} />
          </quimera-formulario>
        </div>
      )}
      {modificado && (
        <div className="maestro-botones">
          <QBoton onClick={onGuardarClicked} deshabilitado={!valido}>
            Guardar
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => init()}
            deshabilitado={!modificado}
          >
            Cancelar
          </QBoton>
        </div>
      )}
      <QModalConfirmacion
        nombre="borrarLicenciaFarma"
        abierto={estado === "confirmarBorrado"}
        titulo="Confirmar borrar"
        mensaje="¿Está seguro de que desea borrar esta licencia?"
        onCerrar={() => setEstado("edicion")}
        onAceptar={onBorrarConfirmado}
      />
    </Detalle>
  );
};
