import { QBoton, QDate, QInput } from "@olula/componentes/index.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { metaNuevaLicenciaFarma, nuevaLicenciaFarmaVacia } from "../dominio.ts";
import { getLicenciaFarma, postLicenciaFarma } from "../infraestructura.ts";

export const AltaLicenciaFarma = ({
  emitir = async () => {},
}: {
  emitir?: ProcesarEvento;
}) => {
  const nueva = useModelo(metaNuevaLicenciaFarma, nuevaLicenciaFarmaVacia);
  const { intentar } = useContext(ContextoError);

  const guardar = async () => {
    const id = await intentar(() => postLicenciaFarma(nueva.modelo));
    nueva.init(nuevaLicenciaFarmaVacia);
    const licenciaCreada = await getLicenciaFarma(id);
    emitir("LICENCIA_FARMA_CREADA", licenciaCreada);
  };

  return (
    <>
      <h2>Nueva Licencia Farma</h2>
      <quimera-formulario>
        <QInput label="Tipo de licencia" {...nueva.uiProps("tipoLicencia")} />
        <QDate
          label="Fecha de caducidad"
          {...nueva.uiProps("fechaCaducidad")}
        />
        <QInput label="ID Trato" {...nueva.uiProps("tratoId")} />
        <QInput label="ID Cliente" {...nueva.uiProps("clienteId")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={nueva.valido === false}>
          Guardar
        </QBoton>
        <QBoton
          tipo="reset"
          variante="texto"
          onClick={() => emitir("ALTA_CANCELADA")}
        >
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
