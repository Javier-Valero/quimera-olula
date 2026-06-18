import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Incidencia } from "../diseño.ts";
import { crearPresupuestoIncidencia } from "../infraestructura.ts";

export const CrearPresupuesto = ({
  publicar,
  incidencia,
}: {
  incidencia: Incidencia;
  publicar: EmitirEvento;
}) => {
  const crearPresupuesto_ = useCallback(async () => {
    await crearPresupuestoIncidencia(incidencia.id);
    publicar("presupuesto_creado", incidencia.id);
  }, [publicar, incidencia.id]);

  const cancelar_ = useCallback(
    () => publicar("creacion_presupuesto_cancelada"),
    [publicar]
  );

  const [crearPresupuesto, cancelar] = useForm(crearPresupuesto_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarCrearPresupuesto"
      abierto={true}
      titulo="Confirmar crear presupuesto"
      mensaje={`¿Está seguro de que desea crear un presupuesto para esta incidencia?`}
      onCerrar={cancelar}
      onAceptar={crearPresupuesto}
    />
  );
};
