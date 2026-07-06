import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { Nota } from "../diseño.ts";
import { CrearNota } from "./CrearNota.tsx";
import { TabNotasLista } from "./TabNotasLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabNotas = ({
  incidenciaId,
  agenteId,
}: {
  incidenciaId: string;
  agenteId: string;
}) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista" as const,
    notas: [] as Nota[],
    cargando: true,
    incidenciaId,
    agenteId,
  });

  useEffect(() => {
    if (incidenciaId) emitir("cargar_notas", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  const handleAgregar = (texto: string) => {
    emitir("crear_nota", { texto });
  };

  return (
    <div className="TabNotas">
      <CrearNota onAgregar={handleAgregar} cargando={false} />
      <TabNotasLista
        incidenciaId={incidenciaId}
        notas={ctx.notas}
        cargando={ctx.cargando}
      />
    </div>
  );
};
