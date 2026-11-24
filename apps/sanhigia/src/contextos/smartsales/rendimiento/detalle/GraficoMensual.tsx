import { useState } from "react";
import { MesHistorico } from "../diseño.ts";
import { maximoHistorico, mesesConObjetivoPendiente, mesInicial, resumenMes } from "../dominio.ts";

const NOMBRES_MES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const altura = (valor: number, maximo: number) => `${maximo > 0 ? (valor * 100) / maximo : 0}%`;

// Al pulsar una columna (ratón, dedo o teclado) se muestran sus importes debajo del gráfico.
export const GraficoMensual = ({ meses: historico }: { meses: MesHistorico[] }) => {
    const meses = mesesConObjetivoPendiente(historico);
    const maximo = maximoHistorico(meses);
    const [elegido, setElegido] = useState<string | null>(() => mesInicial(meses));
    const mesElegido = meses.find((m) => m.mes === elegido) ?? null;

    return (
        <figure className="GraficoMensual">
            <div className="columnas">
                {meses.map((mes, i) => (
                    <button
                        key={mes.mes}
                        type="button"
                        className="columna"
                        aria-pressed={mes.mes === elegido}
                        aria-label={resumenMes(mes)}
                        onClick={() => setElegido(mes.mes)}
                    >
                        <div className="zona">
                            {mes.ventas !== null && <div className="barra ventas" style={{ height: altura(mes.ventas, maximo) }} />}
                            {mes.ventas === null && mes.prevision !== null && (
                                <div className="barra prevision" style={{ height: altura(mes.prevision, maximo) }} />
                            )}
                            {mes.necesario > 0 && <div className="objetivo" style={{ bottom: altura(mes.necesario, maximo) }} />}
                        </div>
                        <span className="mes">{NOMBRES_MES[i]}</span>
                    </button>
                ))}
            </div>
            <p className="detalle-mes" aria-live="polite">
                {mesElegido ? resumenMes(mesElegido) : "Pulsa un mes para ver sus importes"}
            </p>
            <figcaption className="leyenda">
                <span className="clave ventas">Ventas</span>
                <span className="clave prevision">Previsión</span>
                <span className="clave objetivo">Necesario para el objetivo del trimestre</span>
            </figcaption>
        </figure>
    );
};
