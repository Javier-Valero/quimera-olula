import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useState } from "react";
import { Producto, TipoProducto } from "../../nueva_tarea/diseño.ts";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import "./SelectorProducto.css";

const niveles: { valor: TipoProducto; descripcion: string }[] = [
    { valor: "articulo", descripcion: "Artículo" },
    { valor: "familia", descripcion: "Familia" },
    { valor: "subfamilia", descripcion: "Subfamilia" },
];

// Producto de una tarea en dos pasos: nivel (artículo, familia o subfamilia) y el elemento de ese nivel.
// Si el producto elegido cambia desde fuera (p. ej. una sugerencia), el nivel lo sigue.
export const SelectorProducto = ({ producto, onChange }: { producto: Producto | null; onChange: (producto: Producto | null) => void }) => {
    const [nivelElegido, setNivelElegido] = useState<TipoProducto>(producto?.tipo ?? "subfamilia");
    const nivel = producto?.tipo ?? nivelElegido;

    return (
        <div className="SelectorProducto">
            <QSelect
                label="Producto"
                nombre="nivel_producto"
                valor={nivel}
                opciones={niveles}
                onChange={(opcion) => {
                    if (!opcion || opcion.valor === nivel) return;
                    setNivelElegido(opcion.valor as TipoProducto);
                    onChange(null);
                }}
            />
            <QAutocompletar
                key={nivel}
                label={niveles.find((n) => n.valor === nivel)?.descripcion ?? ""}
                nombre="producto"
                opcional
                valor={producto?.codigo ?? ""}
                descripcion={producto?.descripcion}
                obtenerOpciones={async (texto) => (await buscarProductos(nivel, texto)).map((p) => ({ valor: p.codigo, descripcion: p.descripcion }))}
                onChange={(opcion) => {
                    if ((opcion?.valor ?? null) === (producto?.codigo ?? null)) return;
                    onChange(opcion ? { tipo: nivel, codigo: opcion.valor, descripcion: opcion.descripcion } : null);
                }}
            />
        </div>
    );
};
