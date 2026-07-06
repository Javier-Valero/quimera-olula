import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Nota } from "../diseño.ts";

const metaTablaNota: MetaTabla<Nota> = [
  {
    id: "fecha",
    cabecera: "Fecha",
    tipo: "fecha",
  },
  {
    id: "texto",
    cabecera: "Nota",
    render: (nota: Nota) => nota.texto,
  },
  {
    id: "agenteId",
    cabecera: "Agente",
    render: (nota: Nota) => nota.agenteId || "-",
  },
];

export const TabNotasLista = ({
  notas,
  cargando,
}: {
  incidenciaId: string;
  notas: Nota[];
  cargando: boolean;
}) => {
  return (
    <ListadoSemiControlado
      metaTabla={metaTablaNota}
      entidades={notas}
      totalEntidades={notas.length}
      cargando={cargando}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      renderAcciones={() => null}
    />
  );
};
