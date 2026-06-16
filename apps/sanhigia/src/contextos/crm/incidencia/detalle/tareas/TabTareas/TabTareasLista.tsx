import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Tarea } from "../diseño.ts";

const metaTablaTareas = [
  {
    id: "titulo",
    cabecera: "Título",
    render: (tarea: Tarea) => tarea.titulo,
  },
  {
    id: "fecha",
    cabecera: "Fecha",
    render: (tarea: Tarea) => tarea.fecha,
  },
  {
    id: "hora",
    cabecera: "Hora",
    render: (tarea: Tarea) => tarea.hora,
  },
  {
    id: "tipo",
    cabecera: "Tipo",
    render: (tarea: Tarea) => tarea.tipo,
  },
  {
    id: "completada",
    cabecera: "Completada",
    render: (tarea: Tarea) => (tarea.completada ? "Sí" : "No"),
  },
];

export const TabTareasLista = ({
  tareas,
  cargando,
}: {
  incidenciaId: string;
  tareas: Tarea[];
  cargando: boolean;
}) => {
  return (
    <ListadoSemiControlado
      metaTabla={metaTablaTareas}
      entidades={tareas}
      totalEntidades={tareas.length}
      cargando={cargando}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      renderAcciones={() => null}
    />
  );
};
