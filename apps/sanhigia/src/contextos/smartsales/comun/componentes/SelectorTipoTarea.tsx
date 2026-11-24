import { useId } from "react";
import { TipoTarea } from "../diseño.ts";
import { textoTipoTarea } from "../dominio.ts";
import "./SelectorTipoTarea.css";

const TIPOS: TipoTarea[] = ["Cita", "Llamada", "Email", "Whatsapp"];

// Tipo de tarea en botones (Visita, Llamada, Email, Whatsapp). Lo usan Nueva tarea y la edición de una tarea.
export const SelectorTipoTarea = ({ valor, onChange }: { valor: TipoTarea; onChange: (tipo: TipoTarea) => void }) => {
    const id = useId();
    return (
        <div className="SelectorTipoTarea">
            <span className="titulo-campo" id={id}>
                Tipo de tarea
            </span>
            <div className="tipos" role="radiogroup" aria-labelledby={id}>
                {TIPOS.map((tipo) => (
                    <button key={tipo} type="button" role="radio" aria-checked={valor === tipo} onClick={() => onChange(tipo)}>
                        {textoTipoTarea[tipo]}
                    </button>
                ))}
            </div>
        </div>
    );
};
