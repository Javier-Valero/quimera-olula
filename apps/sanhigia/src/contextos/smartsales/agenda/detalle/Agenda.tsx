import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { getSemanasDelMes } from "@olula/componentes/calendario/helpers.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Tarea } from "../../comun/diseño.ts";
import { fechaIso, tareaAtrasada } from "../../comun/dominio.ts";
import { distanciaKm, Posicion, posicionActual } from "../../comun/geolocalizacion.ts";
import { getCoordenadasClientes } from "../../comun/infraestructura.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { CargarPagina, useListaPaginada } from "../../comun/useListaPaginada.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { TarjetaTarea } from "../../comun/componentes/TarjetaTarea.tsx";
import { getPaginaTareasCompletadas, getTareasRango, LIMITE_RANGO } from "../../tareas/infraestructura.ts";
import { VistaAgenda } from "../diseño.ts";
import {
    agruparPorDia,
    bloquesProximas,
    desplazar,
    diasDeLaSemana,
    rangoProximas,
    rangoVista,
    textoFecha,
    tituloVista,
} from "../dominio.ts";
import "./Agenda.css";

const pestañas: [VistaAgenda, string][] = [
    ["dia", "Día"],
    ["semana", "Semana"],
    ["mes", "Mes"],
];

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

const POR_PAGINA_HISTORIAL = 30;

type Distancia = (tarea: Tarea) => number | null;

type ListaPorDiaProps = {
    tareas: Tarea[];
    vacio: string;
    distancia: Distancia;
    // Para el historial: los días y las tareas de cada día, de la más reciente a la más antigua.
    deMasReciente?: boolean;
};

const ListaPorDia = ({ tareas, vacio, distancia, deMasReciente = false }: ListaPorDiaProps) => {
    if (tareas.length === 0) return <p className="vacio">{vacio}</p>;
    const grupos = agruparPorDia(tareas);
    const ordenados = deMasReciente ? grupos.reverse().map(([fecha, delDia]): [string, Tarea[]] => [fecha, [...delDia].reverse()]) : grupos;
    return (
        <>
            {ordenados.map(([fecha, delDia]) => (
                <section key={fecha} className="dia">
                    <h3>{textoFecha(fecha)}</h3>
                    {delDia.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} distanciaKm={distancia(tarea)} />
                    ))}
                </section>
            ))}
        </>
    );
};

const diaCorto = new Intl.DateTimeFormat("es-ES", { weekday: "short" });

const TiraSemana = ({ referencia, onElegirDia }: { referencia: Date; onElegirDia: (dia: Date) => void }) => {
    const hoy = fechaIso(new Date());
    const elegido = fechaIso(referencia);
    return (
        <div className="tira-semana">
            {diasDeLaSemana(referencia).map((dia) => {
                const iso = fechaIso(dia);
                return (
                    <button
                        key={iso}
                        type="button"
                        aria-pressed={iso === elegido}
                        className={iso === hoy ? "hoy" : undefined}
                        onClick={() => onElegirDia(dia)}
                    >
                        <span className="nombre">{diaCorto.format(dia)}</span>
                        <span className="numero">{dia.getDate()}</span>
                    </button>
                );
            })}
        </div>
    );
};

const RejillaMes = ({
    referencia,
    tareas,
    onElegirDia,
}: {
    referencia: Date;
    tareas: Tarea[];
    onElegirDia: (dia: Date) => void;
}) => {
    const hoy = fechaIso(new Date());
    return (
        <div className="rejilla-mes">
            {DIAS_SEMANA.map((dia) => (
                <span key={dia} className="cabecera">
                    {dia}
                </span>
            ))}
            {getSemanasDelMes(referencia, "lunes")
                .flat()
                .map((dia) => {
                    const iso = fechaIso(dia);
                    const delDia = tareas.filter((t) => t.fecha === iso);
                    const fueraDeMes = dia.getMonth() !== referencia.getMonth();
                    const conAtrasadas = delDia.some((t) => tareaAtrasada(t));
                    return (
                        <button
                            key={iso}
                            type="button"
                            className={["dia", fueraDeMes && "fuera", iso === hoy && "hoy"].filter(Boolean).join(" ")}
                            onClick={() => onElegirDia(dia)}
                        >
                            <span>{dia.getDate()}</span>
                            {delDia.length > 0 && (
                                <span className={conAtrasadas ? "contador atrasadas" : "contador"}>{delDia.length}</span>
                            )}
                        </button>
                    );
                })}
        </div>
    );
};

export const Agenda = () => {
    const { intentar } = useContext(ContextoError);
    const { agenteSeguido, cargando } = useAgenteSeguido();
    const [vista, setVista] = useState<VistaAgenda>("dia");
    const [referencia, setReferencia] = useState(() => new Date());
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [proximas, setProximas] = useState<Tarea[]>([]);
    const [verHistorial, setVerHistorial] = useState(false);

    const { desde, hasta } = rangoVista(vista, referencia);

    useEffect(() => {
        if (cargando) return;
        const cargar = async () =>
            setTareas(await intentar(() => getTareasRango({ desde, hasta, agente: agenteSeguido })));
        cargar().catch(() => undefined);
    }, [intentar, cargando, agenteSeguido, desde, hasta]);

    useEffect(() => {
        if (cargando) return;
        const cargar = async () =>
            setProximas(await intentar(() => getTareasRango({ ...rangoProximas(new Date()), agente: agenteSeguido })));
        cargar().catch(() => undefined);
        setVerHistorial(false);
    }, [intentar, cargando, agenteSeguido]);

    // Distancia en línea recta desde la posición del comercial (PAN3-04). Sin permiso de ubicación no se muestra.
    const [posicion, setPosicion] = useState<Posicion | null>(null);
    const [sinUbicacion, setSinUbicacion] = useState(false);
    const [coordenadas, setCoordenadas] = useState<Record<string, Posicion>>({});
    const pedidas = useRef(new Set<string>());

    useEffect(() => {
        let activo = true;
        posicionActual()
            .then((actual) => {
                if (!activo) return;
                setPosicion(actual);
                setSinUbicacion(actual === null);
            })
            .catch(() => undefined);
        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        if (!posicion) return;
        const faltan = [...new Set([...tareas, ...proximas].map((t) => t.codCliente).filter((c): c is string => !!c))].filter(
            (codigo) => !pedidas.current.has(codigo)
        );
        if (faltan.length === 0) return;
        faltan.forEach((codigo) => pedidas.current.add(codigo));
        getCoordenadasClientes(faltan)
            .then((nuevas) => setCoordenadas((actuales) => ({ ...actuales, ...nuevas })))
            .catch(() => undefined);
    }, [posicion, tareas, proximas]);

    const distancia: Distancia = (tarea) => {
        const destino = tarea.codCliente ? coordenadas[tarea.codCliente] : undefined;
        return posicion && destino ? distanciaKm(posicion, destino.latitud, destino.longitud) : null;
    };

    // El historial se pide al pulsar "Ver historial" y se carga de 30 en 30.
    const cargarHistorial = useCallback<CargarPagina<Tarea>>(
        (siguiente) => getPaginaTareasCompletadas(agenteSeguido, POR_PAGINA_HISTORIAL, siguiente),
        [agenteSeguido]
    );
    const historial = useListaPaginada(verHistorial && !cargando ? cargarHistorial : null);

    const bloques = bloquesProximas(proximas, new Date());
    const viendoHoy = vista === "dia" && fechaIso(referencia) === fechaIso(new Date());

    return (
        <LayoutSmartsales>
            <div className="Agenda">
                <h1>Agenda</h1>

                <SelectorAgente />

                <div className="pestañas" role="tablist">
                    {pestañas.map(([valor, texto]) => (
                        <button
                            key={valor}
                            type="button"
                            role="tab"
                            aria-selected={vista === valor}
                            onClick={() => setVista(valor)}
                        >
                            {texto}
                        </button>
                    ))}
                </div>

                <div className="navegacion">
                    <button type="button" aria-label="Anterior" onClick={() => setReferencia(desplazar(vista, referencia, -1))}>
                        <QIcono nombre="izquierda" />
                    </button>
                    <span className="titulo">{tituloVista(vista, referencia)}</span>
                    <button type="button" aria-label="Siguiente" onClick={() => setReferencia(desplazar(vista, referencia, 1))}>
                        <QIcono nombre="derecha" />
                    </button>
                    <QBoton variante="texto" tamaño="pequeño" onClick={() => setReferencia(new Date())}>
                        Hoy
                    </QBoton>
                </div>

                {sinUbicacion && <p className="secundario">Activa la ubicación del navegador para ver la distancia a cada cliente.</p>}

                {tareas.length >= LIMITE_RANGO && (
                    <p className="aviso-limite">
                        Este periodo tiene más de {LIMITE_RANGO} tareas pendientes y solo se muestran las {LIMITE_RANGO} primeras. Elige una vista más corta.
                    </p>
                )}

                {vista !== "mes" && (
                    <TiraSemana
                        referencia={referencia}
                        onElegirDia={(dia) => {
                            setReferencia(dia);
                            setVista("dia");
                        }}
                    />
                )}

                {vista === "mes" ? (
                    <RejillaMes
                        referencia={referencia}
                        tareas={tareas}
                        onElegirDia={(dia) => {
                            setReferencia(dia);
                            setVista("dia");
                        }}
                    />
                ) : (
                    <div className="tarjeta tareas">
                        <ListaPorDia tareas={tareas} vacio="No hay tareas en este periodo" distancia={distancia} />
                    </div>
                )}

                <QBoton enlace={rutasSmartsales.nuevaTarea} ancho>
                    + Añadir a la agenda
                </QBoton>

                <section className="tarjeta tareas bloques">
                    {!viendoHoy && (
                        <>
                            <h2>Hoy</h2>
                            {bloques.hoy.length === 0 && <p className="vacio">Sin tareas</p>}
                            {bloques.hoy.map((tarea) => (
                                <TarjetaTarea key={tarea.id} tarea={tarea} distanciaKm={distancia(tarea)} />
                            ))}
                        </>
                    )}
                    <h2>Mañana</h2>
                    {bloques.mañana.length === 0 && <p className="vacio">Sin tareas</p>}
                    {bloques.mañana.map((tarea) => (
                        <TarjetaTarea key={tarea.id} tarea={tarea} distanciaKm={distancia(tarea)} />
                    ))}
                    <h2>Próximamente</h2>
                    <ListaPorDia tareas={bloques.proximamente} vacio="Sin tareas en los próximos 30 días" distancia={distancia} />
                </section>

                <section className="tarjeta tareas historial">
                    <h2>Historial de tareas completadas</h2>
                    {!verHistorial ? (
                        <QBoton variante="borde" tamaño="pequeño" onClick={() => setVerHistorial(true)}>
                            Ver historial
                        </QBoton>
                    ) : (
                        <>
                            {/* Mientras llega la primera página no se dice "No hay tareas completadas". */}
                            {historial.cargada ? (
                                <ListaPorDia
                                    tareas={historial.elementos}
                                    vacio="No hay tareas completadas"
                                    distancia={() => null}
                                    deMasReciente
                                />
                            ) : (
                                <p className="vacio">Cargando…</p>
                            )}
                            {historial.hayMas && (
                                <QBoton
                                    variante="borde"
                                    ancho
                                    deshabilitado={historial.cargando}
                                    onClick={() => historial.cargarMas().catch(() => undefined)}
                                >
                                    {historial.cargando ? "Cargando…" : "Cargar más"}
                                </QBoton>
                            )}
                        </>
                    )}
                </section>
            </div>
        </LayoutSmartsales>
    );
};
