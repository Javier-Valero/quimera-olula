import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { Nota } from "../diseño.ts";
import { TabNotasLista } from "./TabNotasLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabNotas = ({ incidenciaId }: { incidenciaId: string }) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista" as const,
    notas: [] as Nota[],
    cargando: true,
    incidenciaId,
  });

  useEffect(() => {
    if (incidenciaId) emitir("cargar_notas", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  return (
    <div className="TabNotas">
      <TabNotasLista
        incidenciaId={incidenciaId}
        notas={ctx.notas}
        cargando={ctx.cargando}
      />
    </div>
  );
};
