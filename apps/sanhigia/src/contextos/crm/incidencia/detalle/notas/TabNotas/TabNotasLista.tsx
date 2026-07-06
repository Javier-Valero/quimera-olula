import { Nota } from "../diseño.ts";
import "./TabNotasLista.css";

export const TabNotasLista = ({
  notas,
  cargando,
}: {
  incidenciaId: string;
  notas: Nota[];
  cargando: boolean;
}) => {
  if (cargando) {
    return <div className="TabNotasLista">Cargando notas...</div>;
  }

  if (notas.length === 0) {
    return <div className="TabNotasLista">No hay notas</div>;
  }

  return (
    <div className="TabNotasLista">
      {notas.map((nota) => (
        <div key={nota.id} className="NotaItem">
          <div className="NotaTexto">{nota.texto}</div>
          <div className="NotaFooter">
            <span className="NotaAgente">{nota.agenteId}</span>
            <span className="NotaFecha">
              {new Date(nota.fecha).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
