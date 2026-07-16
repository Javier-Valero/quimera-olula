import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { Tarea } from "../diseño.ts";
import { TabTareasLista } from "./TabTareasLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabTareas = ({ incidenciaId }: { incidenciaId: string }) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista" as const,
    tareas: [] as Tarea[],
    cargando: true,
    incidenciaId,
  });

  useEffect(() => {
    if (incidenciaId) emitir("cargar_tareas", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  return (
    <div className="TabTareas">
      <TabTareasLista
        tareas={ctx.tareas}
        cargando={ctx.cargando}
      />
    </div>
  );
};
