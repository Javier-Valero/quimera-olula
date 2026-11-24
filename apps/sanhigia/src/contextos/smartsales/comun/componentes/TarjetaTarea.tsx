import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { Link } from "react-router";
import { EstadoTarea, Tarea, TipoTarea } from "../diseño.ts";
import { estadoTarea, textoTipoTarea } from "../dominio.ts";
import { rutasSmartsales } from "../rutas.ts";
import "./TarjetaTarea.css";

type TarjetaTareaProps = {
    tarea: Tarea;
    ahora?: Date;
    conFecha?: boolean;
    // Distancia en línea recta del comercial al cliente (km), si se conoce.
    distanciaKm?: number | null;
};

const textoEstado: Record<EstadoTarea, string> = {
    completada: "Completada",
    en_curso: "En curso",
    atrasada: "Atrasada",
};

const varianteEstado = {
    completada: "exito",
    en_curso: "advertencia",
    atrasada: "error",
} as const satisfies Record<EstadoTarea, string>;

const iconoTipo: Record<TipoTarea, string> = {
    Cita: "calendario_evento",
    Llamada: "telefono",
    Email: "correo",
    Whatsapp: "whatsapp",
};

const diaMes = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

export const TarjetaTarea = ({ tarea, ahora, conFecha = false, distanciaKm = null }: TarjetaTareaProps) => {
    const estado = estadoTarea(tarea, ahora);
    const interlocutores = [tarea.nombreCliente, tarea.nombreContacto].filter(Boolean).join(" · ");

    return (
        <Link to={rutasSmartsales.tarea(tarea.id)} className={`TarjetaTarea ${estado ?? ""}`}>
            <time className="hora">
                {conFecha && <span className="fecha">{diaMes(tarea.fecha)}</span>}
                {tarea.hora?.slice(0, 5) ?? (conFecha ? null : "—")}
            </time>
            <span className="icono">
                <QIcono nombre={iconoTipo[tarea.tipo]} />
            </span>
            <div className="contenido">
                <strong className="interlocutores">{interlocutores || tarea.titulo}</strong>
                {interlocutores && <span className="titulo">{tarea.titulo}</span>}
                {distanciaKm !== null && <span className="distancia">a {distanciaKm.toFixed(1)} km</span>}
            </div>
            <div className="etiquetas">
                <QEtiqueta variante="neutro" className={`tipo-${tarea.tipo.toLowerCase()}`}>
                    {textoTipoTarea[tarea.tipo]}
                </QEtiqueta>
                {estado && (
                    <QEtiqueta variante={varianteEstado[estado]}>{textoEstado[estado]}</QEtiqueta>
                )}
            </div>
        </Link>
    );
};
