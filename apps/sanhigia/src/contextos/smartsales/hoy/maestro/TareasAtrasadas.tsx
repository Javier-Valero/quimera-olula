import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { Tarea } from "../../comun/diseño.ts";
import { fechaIso, tareaAtrasada } from "../../comun/dominio.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { CargarPagina, useListaPaginada } from "../../comun/useListaPaginada.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { contarTareasRango, getPaginaTareasRango, getTareasRango } from "../../tareas/infraestructura.ts";
import { DIAS_ATRASADAS, filtrosAtrasadas, separarTareasHoy } from "../dominio.ts";

const POR_PAGINA = 50;

const BotonCargarMas = ({ hayMas, cargando, onClick }: { hayMas: boolean; cargando: boolean; onClick: () => void }) =>
    hayMas ? (
        <QBoton variante="borde" ancho deshabilitado={cargando} onClick={onClick}>
            {cargando ? "Cargando…" : "Cargar más"}
        </QBoton>
    ) : null;

// Atrasadas de hoy y de los últimos 90 días, de la más reciente a la más antigua y por páginas.
// Las de hace más de 90 días solo se cuentan; se cargan si el comercial las pide.
export const TareasAtrasadas = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [deHoy, setDeHoy] = useState<Tarea[]>([]);
    const [totales, setTotales] = useState<{ recientes: number; antiguas: number } | null>(null);
    const [verAntiguas, setVerAntiguas] = useState(false);
    const hoy = fechaIso(new Date());

    useEffect(() => {
        if (cargando) return;
        const { recientes, antiguas } = filtrosAtrasadas(hoy, agenteSeguido);
        const cargar = async () => {
            const [tareasHoy, totalRecientes, totalAntiguas] = await intentar(() =>
                Promise.all([
                    getTareasRango({ desde: hoy, hasta: hoy, agente: agenteSeguido }),
                    contarTareasRango(recientes),
                    contarTareasRango(antiguas),
                ])
            );
            setDeHoy(separarTareasHoy(tareasHoy.filter((tarea) => tareaAtrasada(tarea)), hoy).deHoy);
            setTotales({ recientes: totalRecientes, antiguas: totalAntiguas });
        };
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, hoy]);

    const cargarRecientes = useCallback<CargarPagina<Tarea>>(
        (siguiente) => getPaginaTareasRango(filtrosAtrasadas(hoy, agenteSeguido).recientes, POR_PAGINA, siguiente),
        [hoy, agenteSeguido]
    );
    const cargarAntiguas = useCallback<CargarPagina<Tarea>>(
        (siguiente) => getPaginaTareasRango(filtrosAtrasadas(hoy, agenteSeguido).antiguas, POR_PAGINA, siguiente),
        [hoy, agenteSeguido]
    );
    const recientes = useListaPaginada(cargando ? null : cargarRecientes);
    const antiguas = useListaPaginada(cargando || !verAntiguas ? null : cargarAntiguas);

    const ninguna = totales !== null && deHoy.length === 0 && totales.recientes === 0;

    return (
        <LayoutSmartsales>
            <h1>Tareas atrasadas</h1>
            {/* Solo aparece a quien puede ver a otros agentes (supervisores). */}
            <SelectorAgente />
            {ninguna && <p>No tienes tareas atrasadas en los últimos {DIAS_ATRASADAS} días</p>}

            {deHoy.map((tarea) => (
                <TarjetaTarea key={tarea.id} tarea={tarea} conFecha />
            ))}

            {totales && totales.recientes > 0 && (
                <p className="secundario">
                    Últimos {DIAS_ATRASADAS} días: mostrando {recientes.elementos.length} de {totales.recientes}
                </p>
            )}
            {recientes.elementos.map((tarea) => (
                <TarjetaTarea key={tarea.id} tarea={tarea} conFecha />
            ))}
            <BotonCargarMas hayMas={recientes.hayMas} cargando={recientes.cargando} onClick={() => recientes.cargarMas().catch(() => undefined)} />

            {totales && totales.antiguas > 0 && !verAntiguas && (
                <QBoton variante="texto" onClick={() => setVerAntiguas(true)}>
                    Ver las {totales.antiguas} de hace más de {DIAS_ATRASADAS} días
                </QBoton>
            )}
            {verAntiguas && (
                <>
                    <h2>De hace más de {DIAS_ATRASADAS} días</h2>
                    {antiguas.elementos.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} conFecha />
                    ))}
                    <BotonCargarMas hayMas={antiguas.hayMas} cargando={antiguas.cargando} onClick={() => antiguas.cargarMas().catch(() => undefined)} />
                </>
            )}
        </LayoutSmartsales>
    );
};
