import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import "./ListaArticulos.css";

export type ArticuloElegido = {
    codigo: string;
    descripcion: string;
};

type ListaArticulosProps = {
    label: string;
    nombre: string;
    articulos: ArticuloElegido[];
    onChange: (articulos: ArticuloElegido[]) => void;
    // Búsqueda propia (p. ej. solo productos con afinidad); por defecto, el catálogo de artículos.
    buscar?: (texto: string) => Promise<ArticuloElegido[]>;
};

const buscarArticulos = async (texto: string): Promise<ArticuloElegido[]> =>
    (await buscarProductos("articulo", texto)).map((p) => ({ codigo: p.codigo, descripcion: p.descripcion }));

export const ListaArticulos = ({ label, nombre, articulos, onChange, buscar = buscarArticulos }: ListaArticulosProps) => (
    <>
        <QAutocompletar
            label={label}
            nombre={nombre}
            opcional
            valor=""
            obtenerOpciones={async (texto) =>
                (await buscar(texto))
                    .filter((p) => !articulos.some((a) => a.codigo === p.codigo))
                    .map((p) => ({ valor: p.codigo, descripcion: p.descripcion, descripcionOpcion: `${p.codigo} · ${p.descripcion}` }))
            }
            // El autocompletar puede avisar dos veces de la misma elección (al elegir y al salir del campo).
            onChange={(opcion) =>
                opcion &&
                !articulos.some((a) => a.codigo === opcion.valor) &&
                onChange([...articulos, { codigo: opcion.valor, descripcion: opcion.descripcion }])
            }
        />
        {articulos.length > 0 && (
            <ul className="ListaArticulos">
                {articulos.map((articulo) => (
                    <li key={articulo.codigo}>
                        <QEtiqueta variante="neutro">
                            {articulo.descripcion}
                            <button
                                type="button"
                                aria-label={`Quitar ${articulo.descripcion}`}
                                onClick={() => onChange(articulos.filter((a) => a.codigo !== articulo.codigo))}
                            >
                                ×
                            </button>
                        </QEtiqueta>
                    </li>
                ))}
            </ul>
        )}
    </>
);
