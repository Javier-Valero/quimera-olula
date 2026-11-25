import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { SelectorAgente } from "../../comun/componentes/SelectorAgente.tsx";
import { TarjetaTrato } from "../../comun/componentes/TarjetaTrato.tsx";
import { EstadoTratoFiltro, FiltrosTratos, TotalesTratos, TratoLista } from "../diseño.ts";
import { getPaginaTratos, getTotalesTratos } from "../infraestructura.ts";
import { totalSegunEstado } from "../dominio.ts";
import { CargarPagina, useListaPaginada } from "../../comun/useListaPaginada.ts";
import "./Tratos.css";

type Pestaña = "mios" | "todos";

const ESPERA_FILTROS = 400;
const POR_PAGINA = 50;

const filtrosIniciales: Omit<FiltrosTratos, "agente"> = {
    estado: "abiertos",
    titulo: "",
    contacto: "",
    codCliente: "",
    cifNif: "",
    desde: "",
    hasta: "",
};

export const Tratos = () => {
    const { intentar } = useContext(ContextoError);
    const { usuario, agenteSeguido, puedeVerOtros, cargando } = useAgenteSeguido();
    const [pestaña, setPestaña] = useState<Pestaña>("mios");
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [verFiltros, setVerFiltros] = useState(false);
    const [totales, setTotales] = useState<TotalesTratos | null>(null);
    // Filtros ya aplicados: se fijan tras ESPERA_FILTROS para no consultar en cada tecla.
    const [consulta, setConsulta] = useState<FiltrosTratos | null>(null);

    const cambiar = (cambios: Partial<typeof filtros>) => setFiltros((actual) => ({ ...actual, ...cambios }));
    const tipoTratoFarma = usuario?.tipoTratoFarma ?? null;

    useEffect(() => {
        if (cargando) return;
        const completos: FiltrosTratos = { ...filtros, agente: pestaña === "mios" ? agenteSeguido : null };
        const temporizador = setTimeout(() => {
            setConsulta(completos);
            const cargar = async () => setTotales(await intentar(() => getTotalesTratos(completos)));
            cargar().catch(() => undefined);
        }, ESPERA_FILTROS);
        return () => clearTimeout(temporizador);
    }, [intentar, cargando, pestaña, agenteSeguido, filtros]);

    const cargarPagina = useCallback<CargarPagina<TratoLista>>(
        (siguiente) => getPaginaTratos(consulta!, tipoTratoFarma, POR_PAGINA, siguiente),
        [consulta, tipoTratoFarma]
    );
    const { elementos: tratos, hayMas, cargando: cargandoMas, cargarMas } = useListaPaginada(consulta ? cargarPagina : null);

    const contador = (estado: EstadoTratoFiltro, texto: string, valor: number | undefined) => (
        <button type="button" aria-pressed={filtros.estado === estado} onClick={() => cambiar({ estado })}>
            {texto} ({valor ?? "…"})
        </button>
    );

    return (
        <LayoutSmartsales>
            <div className="Tratos">
                <header>
                    <h1>Tratos</h1>
                    <QBoton enlace={rutasSmartsales.nuevoTrato} tamaño="pequeño">
                        + Nuevo trato
                    </QBoton>
                </header>

                {puedeVerOtros && (
                    <div className="pestañas" role="tablist">
                        {(["mios", "todos"] as Pestaña[]).map((valor) => (
                            <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                                {valor === "mios" ? "Mis tratos" : "Todos"}
                            </button>
                        ))}
                    </div>
                )}

                {pestaña === "mios" && <SelectorAgente />}

                <div className="contadores">
                    {contador("abiertos", "Abiertos", totales?.abiertos)}
                    {contador("ganados", "Ganados", totales?.ganados)}
                    {contador("perdidos", "Perdidos", totales?.perdidos)}
                    <button type="button" aria-pressed={filtros.estado === "todos"} onClick={() => cambiar({ estado: "todos" })}>
                        Todos
                    </button>
                </div>

                <QBoton variante="texto" tamaño="pequeño" onClick={() => setVerFiltros(!verFiltros)}>
                    {verFiltros ? "Ocultar filtros" : "Filtros"}
                </QBoton>
                {verFiltros && (
                    <div className="filtros">
                        <QInput label="Título" nombre="f_titulo" valor={filtros.titulo} onChange={(titulo) => cambiar({ titulo })} />
                        <QInput label="Contacto" nombre="f_contacto" valor={filtros.contacto} onChange={(contacto) => cambiar({ contacto })} />
                        <QInput label="Código de cliente" nombre="f_cliente" valor={filtros.codCliente} onChange={(codCliente) => cambiar({ codCliente })} />
                        <QInput label="CIF/NIF" nombre="f_cifnif" valor={filtros.cifNif} onChange={(cifNif) => cambiar({ cifNif })} />
                        <QInput label="Desde" nombre="f_desde" tipo="fecha" valor={filtros.desde} onChange={(desde) => cambiar({ desde })} />
                        <QInput label="Hasta" nombre="f_hasta" tipo="fecha" valor={filtros.hasta} onChange={(hasta) => cambiar({ hasta })} />
                    </div>
                )}

                {tratos.length === 0 && <p className="vacio">No hay tratos con estos filtros</p>}
                {tratos.length > 0 && totales && (
                    <p className="secundario">
                        Mostrando {tratos.length} de {totalSegunEstado(totales, filtros.estado)}
                    </p>
                )}
                {tratos.length > 0 && (
                    <ul className="tarjeta lista">
                        {tratos.map((trato) => (
                            <li key={trato.id}>
                                <TarjetaTrato trato={trato} conAgente={pestaña === "todos"} />
                            </li>
                        ))}
                    </ul>
                )}
                {hayMas && (
                    <QBoton variante="borde" ancho deshabilitado={cargandoMas} onClick={() => cargarMas().catch(() => undefined)}>
                        {cargandoMas ? "Cargando…" : "Cargar más"}
                    </QBoton>
                )}
            </div>
        </LayoutSmartsales>
    );
};
