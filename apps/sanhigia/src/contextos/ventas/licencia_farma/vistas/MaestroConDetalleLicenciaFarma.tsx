import { MetaTabla, QBoton, QModal } from "@olula/componentes/index.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useLista } from "@olula/lib/useLista.ts";
import { Maquina, useMaquina } from "@olula/lib/useMaquina.ts";
import { useCallback, useEffect, useState } from "react";
import { LicenciaFarma } from "../diseño.ts";
import { getLicenciasFarma } from "../infraestructura.ts";
import { AltaLicenciaFarma } from "./AltaLicenciaFarma.tsx";
import { DetalleLicenciaFarma } from "./DetalleLicenciaFarma/DetalleLicenciaFarma.tsx";

const metaTablaLicenciaFarma: MetaTabla<LicenciaFarma> = [
  { id: "nombreCliente", cabecera: "Cliente" },
  { id: "tipoLicencia", cabecera: "Tipo" },
  { id: "estado", cabecera: "Estado" },
  { id: "fechaInicio", cabecera: "Fecha inicio" },
  { id: "fechaCaducidad", cabecera: "Caducidad" },
];

type Estado = "lista" | "alta";

export const MaestroConDetalleLicenciaFarma = () => {
  const [estado, setEstado] = useState<Estado>("lista");
  const [criteria, setCriteria] = useState<Criteria>(criteriaDefecto);
  const [cargando, setCargando] = useState(false);
  const [total, setTotal] = useState(0);
  const licencias = useLista<LicenciaFarma>([]);

  const maquina: Maquina<Estado> = {
    alta: {
      LICENCIA_FARMA_CREADA: (payload: unknown) => {
        licencias.añadir(payload as LicenciaFarma);
        return "lista";
      },
      ALTA_CANCELADA: "lista",
    },
    lista: {
      ALTA_INICIADA: "alta",
      LICENCIA_FARMA_CAMBIADA: (payload: unknown) => {
        licencias.modificar(payload as LicenciaFarma);
      },
      LICENCIA_FARMA_BORRADA: (payload: unknown) => {
        licencias.eliminar(payload as LicenciaFarma);
        return "lista";
      },
      CANCELAR_SELECCION: () => {
        licencias.limpiarSeleccion();
      },
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  const recargar = useCallback(
    async (nuevaCriteria: Criteria) => {
      setCriteria(nuevaCriteria);
      setCargando(true);
      const { datos, total } = await getLicenciasFarma(
        nuevaCriteria.filtro,
        nuevaCriteria.orden,
        nuevaCriteria.paginacion
      );
      licencias.setLista(datos);
      setTotal(total);
      setCargando(false);
    },
    [licencias]
  );

  useEffect(() => {
    void recargar(criteriaDefecto);
  }, []);

  return (
    <div className="LicenciaFarma">
      <MaestroDetalle<LicenciaFarma>
        modoDisposicion="maestro-50"
        seleccionada={licencias.seleccionada?.id}
        Maestro={
          <>
            <h2>Licencias Farma</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("ALTA_INICIADA")}>Nueva</QBoton>
            </div>
            <Listado<LicenciaFarma>
              metaTabla={metaTablaLicenciaFarma}
              criteria={criteria}
              criteriaInicial={criteriaDefecto}
              cargando={cargando}
              entidades={licencias.lista}
              totalEntidades={total}
              seleccionada={licencias.seleccionada?.id}
              onSeleccion={(id) => {
                const item = licencias.lista.find((l) => l.id === id);
                if (item) licencias.seleccionar(item);
              }}
              onCriteriaChanged={(nuevaCriteria) =>
                void recargar(nuevaCriteria)
              }
            />
          </>
        }
        Detalle={
          <DetalleLicenciaFarma
            licenciaInicial={licencias.seleccionada}
            emitir={emitir}
          />
        }
      />
      <QModal
        nombre="modal"
        abierto={estado === "alta"}
        onCerrar={() => emitir("ALTA_CANCELADA")}
      >
        <AltaLicenciaFarma emitir={emitir} />
      </QModal>
    </div>
  );
};
