import { useCallback, useContext, useEffect, useState } from "react";
import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { QTabla } from "../../../../../../componentes/atomos/qtabla.tsx";
import { QModal } from "../../../../../../componentes/moleculas/qmodal.tsx";
import { ContextoError } from "../../../../../comun/contexto.ts";
import { EmitirEvento } from "../../../../../comun/diseño.ts";
import { useLista } from "../../../../../comun/useLista.ts";
import { Maquina, useMaquina } from "../../../../../comun/useMaquina.ts";
import { HookModelo } from "../../../../../comun/useModelo.ts";
import { Cliente, CuentaBanco } from "../../../diseño.ts";
import {
  deleteCuentaBanco,
  desmarcarCuentaDomiciliacion,
  domiciliarCuenta,
  getCuentasBanco,
} from "../../../infraestructura.ts";
import { AltaCuentaBanco } from "./AltaCuentaBanco.tsx";
import { EdicionCuentaBanco } from "./EdicionCuentaBanco.tsx";

const metaTablaCuentasBanco = [
  { id: "descripcion", cabecera: "Descripcion" },
  { id: "iban", cabecera: "IBAN" },
  { id: "bic", cabecera: "BIC" },
];

type Estado = "lista" | "alta" | "edicion";

interface TabCuentasBancoProps {
  cliente: HookModelo<Cliente>;
  emitirCliente: EmitirEvento;
  recargarCliente: () => void;
}

export const TabCuentasBanco = ({
  cliente,
  recargarCliente,
}: TabCuentasBancoProps) => {
  const { modelo } = cliente;
  const cuentas = useLista<CuentaBanco>([]);
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<Estado>("lista");
  const { intentar } = useContext(ContextoError);

  const setListaCuentas = cuentas.setLista;

  const cargarCuentas = useCallback(async () => {
    setCargando(true);
    const nuevasCuentas = await getCuentasBanco(modelo.id);
    setListaCuentas(nuevasCuentas);
    setCargando(false);
  }, [modelo.id, setListaCuentas]);

  useEffect(() => {
    if (modelo.id) cargarCuentas();
  }, [modelo.id, cargarCuentas]);

  const maquina: Maquina<Estado> = {
    lista: {
      ALTA_SOLICITADA: "alta",
      EDICION_SOLICITADA: "edicion",
      CUENTA_SELECCIONADA: (payload: unknown) => {
        const cuenta = payload as CuentaBanco;
        cuentas.seleccionar(cuenta);
      },
      BORRADO_SOLICITADO: async () => {
        if (!cuentas.seleccionada) return;
        const idCuenta = cuentas.seleccionada?.id;
        if (!idCuenta) return;
        await intentar(() => deleteCuentaBanco(modelo.id, idCuenta));
        cuentas.eliminar(cuentas.seleccionada);
      },
      DOMICILIAR_SOLICITADO: async () => {
        if (!cuentas.seleccionada) return;
        const idCuenta = cuentas.seleccionada?.id;
        if (!idCuenta) return;
        await intentar(() => domiciliarCuenta(modelo.id, idCuenta));
        recargarCliente();
      },
      DESMARCAR_DOMICILIACION: async () => {
        await intentar(() => desmarcarCuentaDomiciliacion(modelo.id));
        recargarCliente();
      },
    },
    alta: {
      CUENTA_CREADA: async (payload: unknown) => {
        const nuevaCuenta = payload as CuentaBanco;
        cuentas.añadir(nuevaCuenta);
        return "lista" as Estado;
      },
      ALTA_CANCELADA: "lista",
    },
    edicion: {
      CUENTA_ACTUALIZADA: async (payload: unknown) => {
        const cuentaActualizada = payload as CuentaBanco;
        cuentas.modificar(cuentaActualizada);
        return "lista" as Estado;
      },
      EDICION_CANCELADA: "lista",
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  return (
    <div className="CuentasBanco">
      <div className="detalle-cliente-tab-contenido">
        <div className="CuentaBancoDomiciliacion maestro-botones">
          <span>Domiciliar: {modelo.descripcion_cuenta}</span>
          <QBoton onClick={() => emitir("DESMARCAR_DOMICILIACION")}>
            Desmarcar
          </QBoton>
        </div>
      </div>
      <div className="CuentasBanco">
        <div className="CuentasBancoAcciones">
          <div className="CuentasBancoBotonesIzquierda maestro-botones">
            <QBoton onClick={() => emitir("ALTA_SOLICITADA")}>Nueva</QBoton>
            <QBoton
              onClick={() =>
                cuentas.seleccionada && emitir("EDICION_SOLICITADA")
              }
              deshabilitado={!cuentas.seleccionada}
            >
              Editar
            </QBoton>
            <QBoton
              onClick={() => emitir("BORRADO_SOLICITADO")}
              deshabilitado={!cuentas.seleccionada}
            >
              Borrar
            </QBoton>
          </div>
          <div className="CuentasBancoBotonDerecha maestro-botones">
            <QBoton
              onClick={() => emitir("DOMICILIAR_SOLICITADO")}
              deshabilitado={!cuentas.seleccionada}
            >
              Cuenta de domiciliación
            </QBoton>
          </div>
        </div>
        <QTabla
          metaTabla={metaTablaCuentasBanco}
          datos={cuentas.lista}
          cargando={cargando}
          seleccionadaId={cuentas.seleccionada?.id}
          onSeleccion={(cuenta) => emitir("CUENTA_SELECCIONADA", cuenta)}
          orden={["id", "ASC"]}
          onOrdenar={() => null}
        />
      </div>

      <QModal
        nombre="altaCuentaBanco"
        abierto={estado === "alta"}
        onCerrar={() => emitir("ALTA_CANCELADA")}
      >
        <AltaCuentaBanco clienteId={modelo.id} emitir={emitir} />
      </QModal>

      <QModal
        nombre="edicionCuentaBanco"
        abierto={estado === "edicion"}
        onCerrar={() => emitir("EDICION_CANCELADA")}
      >
        {cuentas.seleccionada && (
          <EdicionCuentaBanco
            clienteId={modelo.id}
            cuenta={cuentas.seleccionada}
            emitir={emitir}
          />
        )}
      </QModal>
    </div>
  );
};
