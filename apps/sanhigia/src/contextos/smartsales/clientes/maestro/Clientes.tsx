import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { CargarPagina, useListaPaginada } from "../../comun/useListaPaginada.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ClienteLista, ContactoLista, EstadoClienteFiltro } from "../diseño.ts";
import { getPaginaClientes, getPaginaContactos } from "../infraestructura.ts";
import "./Clientes.css";

type Pestaña = "clientes" | "contactos";

const ESPERA_BUSQUEDA = 300;
const POR_PAGINA = 50;

const BotonCargarMas = ({ hayMas, cargando, onClick }: { hayMas: boolean; cargando: boolean; onClick: () => void }) =>
    hayMas ? (
        <QBoton variante="borde" ancho deshabilitado={cargando} onClick={onClick}>
            {cargando ? "Cargando…" : "Cargar más"}
        </QBoton>
    ) : null;

export const Clientes = () => {
    const [pestaña, setPestaña] = useState<Pestaña>("clientes");
    const [texto, setTexto] = useState("");
    // Texto ya aplicado: se fija tras ESPERA_BUSQUEDA para no consultar en cada tecla.
    const [busqueda, setBusqueda] = useState("");
    const [estado, setEstado] = useState<EstadoClienteFiltro>("activos");

    useEffect(() => {
        const temporizador = setTimeout(() => setBusqueda(texto), ESPERA_BUSQUEDA);
        return () => clearTimeout(temporizador);
    }, [texto]);

    const cargarClientes = useCallback<CargarPagina<ClienteLista>>(
        (siguiente) => getPaginaClientes(busqueda, estado, POR_PAGINA, siguiente),
        [busqueda, estado]
    );
    const cargarContactos = useCallback<CargarPagina<ContactoLista>>(
        (siguiente) => getPaginaContactos(busqueda, POR_PAGINA, siguiente),
        [busqueda]
    );
    const clientes = useListaPaginada(pestaña === "clientes" ? cargarClientes : null);
    const contactos = useListaPaginada(pestaña === "contactos" ? cargarContactos : null);

    const filtroEstado = (valor: EstadoClienteFiltro, textoBoton: string) => (
        <button type="button" aria-pressed={estado === valor} onClick={() => setEstado(valor)}>
            {textoBoton}
        </button>
    );

    return (
        <LayoutSmartsales>
            <div className="Clientes">
                <header>
                    <h1>Clientes</h1>
                    {pestaña === "contactos" ? (
                        <QBoton enlace={rutasSmartsales.nuevoContacto} tamaño="pequeño">
                            + Nuevo contacto
                        </QBoton>
                    ) : (
                        <QBoton enlace={rutasSmartsales.mapa} variante="borde" tamaño="pequeño">
                            Mapa
                        </QBoton>
                    )}
                </header>

                <div className="pestañas" role="tablist">
                    {(["clientes", "contactos"] as Pestaña[]).map((valor) => (
                        <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                            {valor === "clientes" ? "Clientes" : "Contactos"}
                        </button>
                    ))}
                </div>

                {pestaña === "clientes" && (
                    <div className="contadores">
                        {filtroEstado("activos", "Activos")}
                        {filtroEstado("inactivos", "Inactivos")}
                        {filtroEstado("todos", "Todos")}
                    </div>
                )}

                <QInput label="Buscar" nombre="buscar" valor={texto} placeholder="Nombre" onChange={setTexto} />

                {pestaña === "clientes" && (
                    <>
                        {clientes.cargada && clientes.elementos.length === 0 && <p className="vacio">No hay clientes con estos filtros</p>}
                        <ul className="lista">
                            {clientes.elementos.map((cliente) => (
                                <li key={cliente.codigo}>
                                    <Link to={rutasSmartsales.fichaCliente(cliente.codigo)} className="cliente">
                                        <span className="datos">
                                            <strong>{cliente.nombre}</strong>
                                            <span className="secundario">{cliente.codigo}</span>
                                        </span>
                                        <QEtiqueta variante={cliente.activo ? "exito" : "gris"}>{cliente.activo ? "Activo" : "Inactivo"}</QEtiqueta>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <BotonCargarMas hayMas={clientes.hayMas} cargando={clientes.cargando} onClick={() => clientes.cargarMas().catch(() => undefined)} />
                    </>
                )}

                {pestaña === "contactos" && (
                    <>
                        {contactos.cargada && contactos.elementos.length === 0 && <p className="vacio">No hay contactos con este nombre</p>}
                        <ul className="lista">
                            {contactos.elementos.map((contacto) => (
                                <li key={contacto.codigo}>
                                    <Link to={rutasSmartsales.contacto(contacto.codigo)}>
                                        <strong>{contacto.nombre}</strong>
                                        <span className="secundario">{[contacto.email, contacto.telefono].filter(Boolean).join(" · ")}</span>
                                        {contacto.numTratos > 0 && <span className="secundario">{contacto.numTratos} tratos</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <BotonCargarMas
                            hayMas={contactos.hayMas}
                            cargando={contactos.cargando}
                            onClick={() => contactos.cargarMas().catch(() => undefined)}
                        />
                    </>
                )}
            </div>
        </LayoutSmartsales>
    );
};
