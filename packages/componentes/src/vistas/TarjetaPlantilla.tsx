import { Entidad } from "@olula/lib/diseño.ts";
import { MetaColumna, MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { valorColumna } from "../moleculas/qtarjeta_metatabla.tsx";
import { ConfigTarjeta } from "./diseño.ts";
import "./TarjetaPlantilla.css";

/**
 * Tarjeta de un listado con la plantilla que eligió el usuario: título,
 * subtítulo, etiqueta (arriba a la derecha) y hasta tres campos, todos
 * columnas del catálogo de la tabla (también las ocultas).
 */
export const TarjetaPlantilla = <T extends Entidad>({
  entidad,
  metaTabla,
  plantilla,
}: {
  entidad: T;
  metaTabla: MetaTabla<T>;
  plantilla: ConfigTarjeta;
}) => {
  const cols = obtenerCols(metaTabla);
  const columna = (id?: string) => (id ? cols.find((c) => c.id === id) : undefined);
  const valor = (c: MetaColumna<T>) => valorColumna(entidad, c, "—");

  const titulo = columna(plantilla.titulo);
  const subtitulo = columna(plantilla.subtitulo);
  const etiqueta = columna(plantilla.etiqueta);
  const campos = plantilla.campos
    .map((id) => columna(id))
    .filter((c): c is MetaColumna<T> => c !== undefined);

  return (
    <article className="tarjeta-plantilla">
      {(titulo || subtitulo || etiqueta) && (
        <header className="tarjeta-plantilla-cabecera">
          <div className="tarjeta-plantilla-titulos">
            {titulo && <strong className="tarjeta-plantilla-titulo">{valor(titulo)}</strong>}
            {subtitulo && (
              <span className="tarjeta-plantilla-subtitulo">{valor(subtitulo)}</span>
            )}
          </div>
          {etiqueta && <div className="tarjeta-plantilla-etiqueta">{valor(etiqueta)}</div>}
        </header>
      )}
      {campos.length > 0 && (
        <dl className="tarjeta-plantilla-campos">
          {campos.map((c) => (
            <div key={c.id}>
              <dt>{c.cabecera}</dt>
              <dd>{valor(c)}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
};
