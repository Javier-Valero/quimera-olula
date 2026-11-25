import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { EtiquetaAfinidad } from "../../comun/componentes/EtiquetaAfinidad.tsx";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { NotaDictada } from "../../comun/componentes/NotaDictada.tsx";
import { SelectorProducto } from "../../comun/componentes/SelectorProducto.tsx";
import { SelectorTipoTarea } from "../../comun/componentes/SelectorTipoTarea.tsx";
import { FormularioTarea, Motivo, Sugerencia, TratoCliente } from "../diseño.ts";
import {
    erroresFormulario,
    formularioVacio,
    MAX_NOTA,
    opcionesMotivoTarea,
    sugerenciasVisibles,
    tareaParaAPI,
    tituloTarea,
} from "../dominio.ts";
import {
    buscarClientes,
    crearTarea,
    crearTareaUnica,
    getMotivos,
    getNombreCliente,
    getSugerencias,
    getTratosAbiertosCliente,
} from "../infraestructura.ts";
import { getTrato } from "../../trato/infraestructura.ts";
import "./NuevaTarea.css";

const SIN_TRATO = "sin_trato";

export const NuevaTarea = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const { agentePropio } = useAgenteSeguido();

    const [formulario, setFormulario] = useState<FormularioTarea>(() => formularioVacio());
    const [motivos, setMotivos] = useState<Motivo[]>([]);
    const [tratos, setTratos] = useState<TratoCliente[]>([]);
    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
    const [todasSugerencias, setTodasSugerencias] = useState(false);
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    const cambiar = (cambios: Partial<FormularioTarea>) => setFormulario((actual) => ({ ...actual, ...cambios }));
    const codCliente = formulario.cliente?.codigo ?? null;

    useEffect(() => {
        const cargar = async () => setMotivos(await intentar(getMotivos));
        cargar().catch(() => undefined);
    }, [intentar]);

    useEffect(() => {
        const cliente = parametros.get("cliente");
        if (!cliente) return;
        const cargar = async () => {
            const nombre = await intentar(() => getNombreCliente(cliente));
            setFormulario((actual) => ({ ...actual, cliente: { codigo: cliente, nombre } }));
        };
        cargar().catch(() => undefined);
    }, [intentar, parametros]);

    // Abierta desde un trato sin cliente (solo contacto): la tarea va a ese trato y no se pide cliente.
    useEffect(() => {
        const idTrato = parametros.get("trato");
        if (!idTrato || parametros.get("cliente")) return;
        const cargar = async () => {
            const trato = await intentar(() => getTrato(idTrato));
            if (trato.codCliente) {
                setFormulario((actual) => ({ ...actual, cliente: { codigo: trato.codCliente!, nombre: trato.nombreCliente ?? trato.codCliente! } }));
            } else {
                setFormulario((actual) => ({
                    ...actual,
                    tratoSinCliente: { id: trato.id, titulo: trato.titulo, contacto: trato.nombreContacto },
                }));
            }
        };
        cargar().catch(() => undefined);
    }, [intentar, parametros]);

    useEffect(() => {
        setTratos([]);
        setSugerencias([]);
        if (!codCliente) return;
        const cargar = async () => {
            const [nuevosTratos, nuevasSugerencias] = await intentar(() =>
                Promise.all([getTratosAbiertosCliente(codCliente), getSugerencias(codCliente)])
            );
            setTratos(nuevosTratos);
            setSugerencias(nuevasSugerencias);
            const tratoPedido = parametros.get("trato");
            // Por defecto "Sin trato" (tarea única); solo se preselecciona el trato desde el que se abre.
            const elegido = nuevosTratos.find((t) => t.id === tratoPedido);
            setFormulario((actual) => ({ ...actual, idTrato: elegido?.id ?? null }));
        };
        cargar().catch(() => undefined);
    }, [intentar, codCliente, parametros]);

    const guardar = async () => {
        const encontrados = erroresFormulario(formulario);
        setErrores(encontrados);
        if (encontrados.length > 0) return;

        const { tratoSinCliente, cliente } = formulario;
        setGuardando(true);
        try {
            const tarea = tareaParaAPI(formulario, motivos);
            // Con trato (también el de un contacto sin cliente) es el alta de tarea de legacy: ss_tareas con
            // idtrato y el agente del usuario. Sin trato, tarea única.
            const idTrato = tratoSinCliente?.id ?? formulario.idTrato;
            await intentar(() =>
                idTrato
                    ? crearTarea({ ...tarea, idtrato: Number(idTrato), codagente: agentePropio ?? "" })
                    : crearTareaUnica({ ...tarea, codcliente: cliente!.codigo })
            );
            if (tratoSinCliente) {
                // Como legacy: vuelve al trato desde el que se abrió.
                if (window.history.state?.idx > 0) navigate(-1);
                else navigate(rutasSmartsales.trato(tratoSinCliente.id));
            } else {
                navigate(rutasSmartsales.agenda);
            }
        } catch {
            setGuardando(false);
        }
    };

    const opcionesTrato = [
        { valor: SIN_TRATO, descripcion: "Sin trato: crear como tarea única" },
        ...tratos.map((trato) => ({ valor: trato.id, descripcion: trato.titulo })),
    ];

    return (
        <LayoutSmartsales>
            <div className="NuevaTarea">
                <QCargando visible={guardando} mensaje="Guardando…" />
                <h1>Nueva visita o tarea</h1>

                <section className="tarjeta formulario">
                    {formulario.tratoSinCliente ? (
                        <div className="trato-sin-cliente">
                            <span className="titulo-campo">Trato</span>
                            <strong>{formulario.tratoSinCliente.titulo}</strong>
                            {formulario.tratoSinCliente.contacto && (
                                <span className="secundario">Contacto: {formulario.tratoSinCliente.contacto}</span>
                            )}
                        </div>
                    ) : (
                        <QAutocompletar
                            label="Cliente"
                            nombre="cliente"
                            valor={formulario.cliente?.codigo ?? ""}
                            descripcion={formulario.cliente?.nombre}
                            obtenerOpciones={async (texto) =>
                                (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))
                            }
                            onChange={(opcion) =>
                                cambiar({ cliente: opcion ? { codigo: opcion.valor, nombre: opcion.descripcion } : null, idTrato: null })
                            }
                        />
                    )}

                    {formulario.cliente && (
                        <QSelect
                            label="Trato"
                            nombre="trato"
                            valor={formulario.idTrato ?? SIN_TRATO}
                            opciones={opcionesTrato}
                            onChange={(opcion) => cambiar({ idTrato: opcion && opcion.valor !== SIN_TRATO ? opcion.valor : null })}
                        />
                    )}

                    <SelectorTipoTarea valor={formulario.tipo} onChange={(tipo) => cambiar({ tipo })} />

                    <div className="campo-titulo">
                        <QInput
                            label="Título"
                            nombre="titulo"
                            valor={tituloTarea(formulario, motivos)}
                            onChange={(titulo) => cambiar({ titulo, tituloManual: true })}
                        />
                        {!formulario.tituloManual && (
                            <span className="secundario">Se rellena solo con el tipo, el cliente y el motivo. Puedes cambiarlo.</span>
                        )}
                    </div>

                    <div className="fila">
                        <QInput label="Fecha" nombre="fecha" tipo="fecha" valor={formulario.fecha} onChange={(fecha) => cambiar({ fecha })} />
                        <QInput label="Hora" nombre="hora" tipo="hora" valor={formulario.hora} onChange={(hora) => cambiar({ hora })} />
                    </div>

                    <QSelect
                        label="Motivo"
                        nombre="motivo"
                        valor={formulario.idMotivo ?? ""}
                        opcional
                        opciones={opcionesMotivoTarea(motivos)}
                        onChange={(opcion) => cambiar({ idMotivo: opcion?.valor || null })}
                    />

                    <SelectorProducto producto={formulario.producto} onChange={(producto) => cambiar({ producto })} />

                    {sugerencias.length > 0 && (
                        <section className="sugerencias">
                            <header>
                                <h2>Sugerencias para este cliente</h2>
                                {sugerenciasVisibles(sugerencias, true).length > sugerenciasVisibles(sugerencias, false).length && (
                                    <QBoton variante="texto" tamaño="pequeño" onClick={() => setTodasSugerencias(!todasSugerencias)}>
                                        {todasSugerencias ? "Ver menos" : "Ver más"}
                                    </QBoton>
                                )}
                            </header>
                            <ul>
                                {sugerenciasVisibles(sugerencias, todasSugerencias).map((s) => (
                                    <li key={s.codSubfamilia}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiar({ producto: { tipo: "subfamilia", codigo: s.codSubfamilia, descripcion: s.descripcion } })
                                            }
                                        >
                                            <span>{s.descripcion}</span>
                                            <EtiquetaAfinidad score={s.score} conPorcentaje />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <NotaDictada label="Notas" valor={formulario.nota} maximo={MAX_NOTA} onChange={(nota) => cambiar({ nota })} />
                </section>

                {errores.length > 0 && (
                    <ul className="errores">
                        {errores.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}

                <div className="acciones">
                    <QBoton variante="borde" ancho onClick={() => navigate(-1)}>
                        Cancelar
                    </QBoton>
                    <QBoton ancho deshabilitado={guardando} onClick={() => guardar()}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};
