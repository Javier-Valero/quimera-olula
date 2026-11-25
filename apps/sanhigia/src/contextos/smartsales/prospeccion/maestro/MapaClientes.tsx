import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QMapa } from "@olula/componentes/mapa/qmapa.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { distanciaKm, Posicion, posicionActual } from "../../comun/geolocalizacion.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { getResumenCliente } from "../../clientes/infraestructura.ts";
import { Sugerencia } from "../../nueva_tarea/diseño.ts";
import { buscarClientes, getSugerencias } from "../../nueva_tarea/infraestructura.ts";
import { ClienteMapa, FiltrosProspeccion, OrdenClientes } from "../diseño.ts";
import {
    capitalPorNombre,
    clienteMapaDesdeResumen,
    detallePopup,
    filtrosAUrl,
    filtrosDesdeUrl,
    filtrosIniciales,
    ordenarClientes,
    textoDistancia,
} from "../dominio.ts";
import { buscarClientesMapa, leerUltimaCapital } from "../infraestructura.ts";
import "./Prospeccion.css";

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fecha = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES") : "—");

const textoVentas = (cliente: ClienteMapa) =>
    cliente.ventas12Meses ? `${euros.format(cliente.ventas12Meses)} en 12 meses` : `Última compra ${fecha(cliente.ultimaCompra)}`;

export const MapaClientes = () => {
    const { intentar } = useContext(ContextoError);
    const [parametros] = useSearchParams();
    const [filtros, setFiltros] = useState<FiltrosProspeccion>(() => filtrosDesdeUrl(parametros) ?? filtrosIniciales());
    const [centro, setCentro] = useState<Posicion | null>(null);
    const [posicion, setPosicion] = useState<Posicion | null>(null);
    const [resultado, setResultado] = useState<{ total: number; clientes: ClienteMapa[] } | null>(null);
    const [seleccionado, setSeleccionado] = useState<string | null>(null);
    // Cliente buscado, por si no aparece entre los resultados (filtros o límite de 100).
    const [buscado, setBuscado] = useState<ClienteMapa | null>(null);
    const [oportunidades, setOportunidades] = useState<Sugerencia[]>([]);

    useEffect(() => {
        let activo = true;
        posicionActual().then((actual) => {
            if (!activo) return;
            setPosicion(actual);
            const capital = capitalPorNombre(filtros.capital) ?? (actual ? null : capitalPorNombre(leerUltimaCapital() ?? "Madrid"));
            setCentro(capital ?? actual);
        });
        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!centro) return;
        setResultado(null);
        const cargar = async () => setResultado(await intentar(() => buscarClientesMapa(centro, filtros)));
        cargar().catch(() => undefined);
    }, [intentar, centro, filtros]);

    useEffect(() => {
        setOportunidades([]);
        if (!seleccionado) return;
        getSugerencias(seleccionado)
            .then(setOportunidades)
            .catch(() => undefined);
    }, [seleccionado]);

    const centrarEnCliente = async (codCliente: string) => {
        const cliente = clienteMapaDesdeResumen(await intentar(() => getResumenCliente(codCliente)));
        if (!cliente) return;
        setBuscado(cliente);
        setCentro({ latitud: cliente.latitud, longitud: cliente.longitud });
        setSeleccionado(codCliente);
    };

    const clientes = ordenarClientes(resultado?.clientes ?? [], filtros.orden);
    const buscadoFuera = buscado && !clientes.some((c) => c.codCliente === buscado.codCliente) ? buscado : null;
    const elegido = clientes.find((c) => c.codCliente === seleccionado) ?? (buscadoFuera?.codCliente === seleccionado ? buscadoFuera : null);
    // Distancia desde el comercial (PAN3-04). Sin su posición no se muestra: la del backend se mide desde
    // el centro de la búsqueda (capital o zona del mapa), no desde él, y daría cifras engañosas.
    const distancia = (cliente: ClienteMapa) => (posicion ? distanciaKm(posicion, cliente.latitud, cliente.longitud) : null) ?? Number.NaN;
    const enMapa = buscadoFuera ? [...clientes, buscadoFuera] : clientes;

    return (
        <LayoutSmartsales>
            <div className="Prospeccion">
                <header>
                    <h1>Mapa de clientes</h1>
                    <QBoton variante="borde" tamaño="pequeño" enlace={`${rutasSmartsales.prospeccion}?${filtrosAUrl(filtros)}`}>
                        Filtros
                    </QBoton>
                </header>

                <QAutocompletar
                    label="Buscar cliente"
                    nombre="buscar_cliente"
                    opcional
                    valor=""
                    obtenerOpciones={async (texto) => (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))}
                    onChange={(opcion) => opcion && centrarEnCliente(opcion.valor).catch(() => undefined)}
                />

                {!centro && <p className="vacio">Buscando tu ubicación…</p>}
                {centro && (
                    <QMapa
                        centro={centro}
                        radioKm={filtros.radio}
                        puntos={enMapa.map((c) => ({
                            id: c.codCliente,
                            latitud: c.latitud,
                            longitud: c.longitud,
                            titulo: c.nombre,
                            detalle: detallePopup(c, distancia(c)),
                        }))}
                        seleccionado={seleccionado}
                        posicion={posicion}
                        onSeleccionar={setSeleccionado}
                        onDeseleccionar={() => setSeleccionado(null)}
                        onMover={(nuevoCentro, radio) => {
                            setCentro(nuevoCentro);
                            setFiltros((actuales) => ({ ...actuales, radio }));
                        }}
                    />
                )}

                {elegido && (
                    <section className="tarjeta cliente-elegido">
                        <div className="fila">
                            <strong>{elegido.nombre}</strong>
                            {elegido.afinidad !== null && <EtiquetaAfinidad score={elegido.afinidad} conPorcentaje />}
                            <button type="button" className="cerrar" aria-label="Cerrar" title="Cerrar" onClick={() => setSeleccionado(null)}>
                                <QIcono nombre="cerrar" tamaño="sm" />
                            </button>
                        </div>
                        <span className="secundario direccion">
                            <QIcono nombre="casa" tamaño="sm" />
                            {[elegido.direccion, elegido.codPostal, elegido.ciudad].filter(Boolean).join(", ")}
                        </span>
                        <div className="casillas">
                            <div>
                                <span className="secundario">Ventas 12m</span>
                                <strong>{elegido.ventas12Meses ? euros.format(elegido.ventas12Meses) : "—"}</strong>
                            </div>
                            <div>
                                <span className="secundario">Última compra</span>
                                <strong>{fecha(elegido.ultimaCompra)}</strong>
                            </div>
                            <div>
                                <span className="secundario">Distancia</span>
                                <strong>{textoDistancia(distancia(elegido))}</strong>
                            </div>
                        </div>
                        {oportunidades.length > 0 && (
                            <>
                                <h3>Oportunidades</h3>
                                <ul className="oportunidades">
                                    {oportunidades.map((o) => (
                                        <li key={o.codSubfamilia}>
                                            <span className="icono">
                                                <QIcono nombre="paquete" tamaño="sm" />
                                            </span>
                                            <span>{o.descripcion}</span>
                                            <EtiquetaAfinidad score={o.score} conPorcentaje />
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        <div className="acciones-ancho">
                            <QBoton variante="borde" ancho enlace={rutasSmartsales.fichaCliente(elegido.codCliente)}>
                                Ver cliente
                            </QBoton>
                            <QBoton ancho enlace={rutasSmartsales.nuevaTareaPara(elegido.codCliente)}>
                                + Añadir visita
                            </QBoton>
                        </div>
                    </section>
                )}

                <section className="tarjeta">
                    <header>
                        <h2>{resultado ? `${resultado.total} clientes` : "Cargando…"}</h2>
                        <QSelect
                            label="Ordenar por"
                            nombre="orden"
                            valor={filtros.orden}
                            opciones={[
                                { valor: "distancia", descripcion: "Distancia" },
                                { valor: "afinidad", descripcion: "Afinidad" },
                            ]}
                            onChange={(opcion) => opcion && setFiltros((actuales) => ({ ...actuales, orden: opcion.valor as OrdenClientes }))}
                        />
                    </header>
                    {resultado && resultado.clientes.length < resultado.total && (
                        <p className="vacio">Se muestran los {resultado.clientes.length} primeros. Acerca el mapa o ajusta los filtros para ver el resto.</p>
                    )}
                    <ul className="lista-clientes">
                        {clientes.map((cliente) => (
                            <li key={cliente.codCliente} className={cliente.codCliente === seleccionado ? "seleccionado" : undefined}>
                                <button
                                    type="button"
                                    className="icono"
                                    aria-label={`Ver ${cliente.nombre} en el mapa`}
                                    onClick={() => setSeleccionado(cliente.codCliente)}
                                >
                                    <QIcono nombre="casa" tamaño="sm" />
                                </button>
                                <Link to={rutasSmartsales.fichaCliente(cliente.codCliente)} className="datos">
                                    <strong>{cliente.nombre}</strong>
                                    <span className="secundario">
                                        {[cliente.ciudad, textoDistancia(distancia(cliente))].filter(Boolean).join(" · ")}
                                    </span>
                                    <span className="secundario">{textoVentas(cliente)}</span>
                                </Link>
                                <div className="lado">
                                    {cliente.afinidad !== null && <EtiquetaAfinidad score={cliente.afinidad} conPorcentaje />}
                                    <QBoton tamaño="pequeño" enlace={rutasSmartsales.nuevaTareaPara(cliente.codCliente)}>
                                        + Visita
                                    </QBoton>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </LayoutSmartsales>
    );
};
