import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { CampoFecha } from "#/produccion/comun/componentes/CampoFecha.tsx";
import { BorrarSimple } from "#/produccion/comun/maestro_simple/BorrarSimple.tsx";
import { getMaquinaDetalleSimple } from "#/produccion/comun/maestro_simple/maquina_detalle.ts";
import { pestanasTrazabilidad } from "#/produccion/trazabilidad/componentes/pestanas.tsx";
import { urlTrazabilidadLote } from "#/produccion/trazabilidad/componentes/urls.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin, puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Lote, ProduccionLote } from "../diseño.ts";
import {
    cambiosLote,
    conAlmacenYFechaDisponible,
    etiquetaEstadoLote,
    fechaDdMmAaaa,
    formatearCantidad,
    loteVacio,
    mensajeRevisados,
    metaLote,
    nombreEtiquetaLote,
    textoArticulo,
    tituloLote,
} from "../dominio.ts";
import { ImprimirEtiquetasLote } from "../etiqueta/ImprimirEtiquetasLote.tsx";
import { deleteLote, getEtiquetaLote, getLote, patchLote, revisarLote } from "../infraestructura.ts";
import "../maestro/MaestroLote.css";

const getMaquina = getMaquinaDetalleSimple(getLote, loteVacio);
const contextoInicial = { estado: "INICIAL" as const, entidad: loteVacio() };

const DatosProduccion = ({ p }: { p: ProduccionLote }) => (
    <>
        <h4 className="subtitulo-lote">Producción</h4>
        <div className="estado-lote">
            <span className="etiqueta-campo">Estado</span>
            <EtiquetaEstado {...etiquetaEstadoLote(p.estado)} />
        </div>
        <QInput label="Orden de producción" nombre="ordenId" valor={p.ordenId} soloLectura enlace="/produccion/ordenes?id={id}" />
        <QInput label="Fecha de fabricación" nombre="fechaFabricacion" valor={fechaDdMmAaaa(p.fechaFabricacion)} soloLectura />
        <QInput label="Cliente" nombre="cliente" valor={p.cliente && p.clienteId ? `${p.clienteId} - ${p.cliente}` : p.clienteId} soloLectura />
        <QInput label="Cantidad programada" nombre="cantidadProgramada" valor={formatearCantidad(p.cantidadProgramada)} soloLectura />
        <QInput label="Cantidad del lote" nombre="cantidadLote" valor={formatearCantidad(p.cantidadLote)} soloLectura />
        <QInput label="Total recibido" nombre="cantidadTotal" valor={formatearCantidad(p.cantidadTotal)} soloLectura />
        <QInput label="Usada" nombre="cantidadUsada" valor={formatearCantidad(p.cantidadUsada)} soloLectura />
        <QInput label="Reservada" nombre="cantidadReservada" valor={formatearCantidad(p.cantidadReservada)} soloLectura />
        <QInput label="Por recibir" nombre="cantidadPorRecibir" valor={formatearCantidad(p.cantidadPorRecibir)} soloLectura />
        <QInput label="Disponible" nombre="cantidadDisponible" valor={formatearCantidad(p.cantidadDisponible)} soloLectura />
    </>
);

/**
 * Ficha del lote: artículo, caducidad y lo que tiene en almacén; con el plugin `produccion`, su
 * ficha de producción y (con `produccion.trazabilidad`) sus movimientos y su trazabilidad hacia
 * atrás y hacia delante. «Revisar lote» recalcula sus cantidades.
 *
 * Se editan (autoguardado) la caducidad y, en lascunas, el almacén y la fecha disponible; el
 * código y el artículo no. «Borrar» solo funciona si el lote no tiene movimientos de stock.
 */
export const DetalleLote = ({ id, publicar = async () => {} }: { id?: string; publicar?: EmitirEvento }) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);
    const lote: Lote = ctx.entidad;
    const { intentar } = useContext(ContextoError);

    const conAlmacen = conAlmacenYFechaDisponible();
    const editable = puede("almacen.lote.cambiar");
    const meta = useMemo(() => metaLote(conAlmacen, editable), [conAlmacen, editable]);

    const autoGuardar = useCallback(
        async (editado: Lote) => {
            const cambios = cambiosLote(lote, editado, conAlmacen);
            if (Object.keys(cambios).length === 0) return;
            await intentar(() => patchLote(lote.id, cambios));
            await emitir("entidad_guardada");
        },
        [lote, conAlmacen, intentar, emitir]
    );

    const { uiProps } = useModelo(meta, lote, autoGuardar);
    const [revisando, setRevisando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [etiquetas, setEtiquetas] = useState(false);
    const navegar = useNavigate();

    useEffect(() => {
        setMensaje("");
        setEtiquetas(false);
        emitir("id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const revisar = useCallback(async () => {
        setRevisando(true);
        setMensaje("");
        try {
            setMensaje(mensajeRevisados(await intentar(() => revisarLote(lote.id))));
            // Vuelve a leer el lote y actualiza su fila en el listado.
            await emitir("entidad_guardada");
        } catch {
            // `intentar` ya muestra el error.
        } finally {
            setRevisando(false);
        }
    }, [emitir, intentar, lote.id]);

    if (!lote.id) return null;

    const p = lote.produccion;
    const conTrazabilidad = plugin("produccion") === "activo" && puede("produccion.trazabilidad");
    // Otro lote del árbol se abre en la pantalla de trazabilidad (pide la misma regla).
    const abrirLote = (otro: string) => navegar(urlTrazabilidadLote(otro));

    return (
        <Detalle
            id={id}
            obtenerTitulo={tituloLote}
            obtenerEstado={(l: Lote) => (l.produccion ? <EtiquetaEstado {...etiquetaEstadoLote(l.produccion.estado)} /> : null)}
            setEntidad={() => {}}
            entidad={lote}
            cerrarDetalle={() => emitir("entidad_deseleccionada", null, true)}
        >
            <div className="DetalleLote">
                <div className="fila-acciones-lote">
                    {mensaje && <span className="nota-lote" role="status">{mensaje}</span>}
                    <QBoton variante="borde" onClick={() => setEtiquetas(true)}>Imprimir etiquetas</QBoton>
                    {puede("almacen.lote.revisar") && (
                        <QBoton deshabilitado={revisando} onClick={revisar}>
                            {revisando ? "Revisando..." : "Revisar lote"}
                        </QBoton>
                    )}
                    {puede("almacen.lote.borrar") && (
                        <QBoton variante="borde" onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                    )}
                </div>
                <Tabs key={lote.id}>
                    {[
                        <Tab key="tab-datos-lote" label="Datos">
                            <quimera-formulario>
                                <QInput label="Código" nombre="id" valor={lote.id} soloLectura />
                                <CampoFecha label="Caducidad" {...uiProps("caducidad")} soloLectura={!editable} />
                                <QInput label="Artículo" nombre="articulo" valor={textoArticulo(lote)} soloLectura />
                                <QInput label="Referencia" nombre="sku" valor={lote.sku} soloLectura enlace={PLANTILLA_FICHA.articulo} />
                                <QInput label="En almacén" nombre="enAlmacen" valor={formatearCantidad(lote.enAlmacen)} soloLectura />
                                {conAlmacen && <Almacen {...uiProps("almacenId")} />}
                                {conAlmacen && (
                                    <CampoFecha label="Fecha disponible" {...uiProps("fechaDisponible")} soloLectura={!editable} />
                                )}
                                {p && <DatosProduccion p={p} />}
                            </quimera-formulario>
                        </Tab>,
                        ...(conTrazabilidad ? pestanasTrazabilidad(lote.id, { abrirLote }) : []),
                    ]}
                </Tabs>
            </div>
            {etiquetas && (
                <ImprimirEtiquetasLote
                    titulo={`Imprimir etiquetas del lote ${lote.id}`}
                    ayudaCantidad={p
                        ? "Vacía: lo fabricado o, si aún no hay nada, la cantidad del lote."
                        : "Vacía: lo que hay en almacén."}
                    nombreFichero={nombreEtiquetaLote(lote.id)}
                    cargar={(opciones) => getEtiquetaLote(lote.id, opciones)}
                    cerrar={() => setEtiquetas(false)}
                />
            )}
            {ctx.estado === "BORRANDO" && (
                <BorrarSimple
                    publicar={emitir}
                    titulo="Borrar lote"
                    mensaje={`¿Está seguro de que desea borrar el lote ${lote.id}? Solo se puede si no tiene movimientos de stock.`}
                    borrar={() => deleteLote(lote.id)}
                />
            )}
        </Detalle>
    );
};
