import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Link } from "react-router";
import { textoEstadoTrato } from "../../clientes/dominio.ts";
import { OrigenTrato } from "../../tratos/diseño.ts";
import { rutasSmartsales } from "../rutas.ts";
import "./TarjetaTrato.css";

export type TratoTarjeta = {
    id: string;
    titulo: string;
    estado: string;
    valor: number;
    fecha: string | null;
    cliente?: string | null;
    contacto?: string | null;
    origen?: OrigenTrato;
};

type TarjetaTratoProps = {
    trato: TratoTarjeta;
    // En listas que solo tienen tratos abiertos (Hoy) la etiqueta "Abierto" sobra.
    conEstado?: boolean;
};

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const textoOrigen: Record<Exclude<OrigenTrato, null>, string> = {
    mkt: "mkt",
    farma: "farma",
    campaña: "campaña",
};

const varianteEstado = (estado: string) => (estado === "Ganado" ? "exito" : estado === "Perdido" ? "error" : "advertencia");

const fechaCorta = (iso: string | null) =>
    iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "";

// Tarjeta de trato común a Hoy, Tratos y las fichas de cliente y contacto: título (con su origen si viene
// de marketing, farma o una campaña), cliente y contacto, valor, estado y fecha. Al pulsarla se abre el trato.
export const TarjetaTrato = ({ trato, conEstado = true }: TarjetaTratoProps) => {
    const interlocutores = [trato.cliente, trato.contacto].filter(Boolean).join(" · ");
    return (
        <Link to={rutasSmartsales.trato(trato.id)} className={`TarjetaTrato ${trato.estado === "-" ? "abierto" : ""}`}>
            <span className="datos">
                <span className="titulo">
                    <strong>{trato.titulo}</strong>
                    {trato.origen && <QEtiqueta variante="neutro">{textoOrigen[trato.origen]}</QEtiqueta>}
                </span>
                {interlocutores && <span className="secundario">{interlocutores}</span>}
            </span>
            <span className="lado">
                <strong className="valor">{euros.format(trato.valor)}</strong>
                {conEstado && <QEtiqueta variante={varianteEstado(trato.estado)}>{textoEstadoTrato(trato.estado)}</QEtiqueta>}
                {trato.fecha && <span className="secundario">{fechaCorta(trato.fecha)}</span>}
            </span>
        </Link>
    );
};
