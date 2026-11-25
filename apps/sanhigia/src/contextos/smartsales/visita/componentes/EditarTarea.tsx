import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { NotaDictada } from "../../comun/componentes/NotaDictada.tsx";
import { SelectorProducto } from "../../comun/componentes/SelectorProducto.tsx";
import { SelectorTipoTarea } from "../../comun/componentes/SelectorTipoTarea.tsx";
import { Motivo } from "../../nueva_tarea/diseño.ts";
import { opcionesMotivoTarea } from "../../nueva_tarea/dominio.ts";
import { getMotivos, getProducto } from "../../nueva_tarea/infraestructura.ts";
import { FormularioEdicionTarea, TareaVisita } from "../diseño.ts";
import { edicionParaAPI, erroresEdicion, formularioEdicion, MAX_NOTA } from "../dominio.ts";
import { guardarEdicionTarea } from "../infraestructura.ts";

type EditarTareaProps = {
    tarea: TareaVisita;
    onCancelar: () => void;
    onGuardada: () => void;
};

// Edición de una tarea pendiente: título, tipo, fecha y hora, motivo, producto y nota.
export const EditarTarea = ({ tarea, onCancelar, onGuardada }: EditarTareaProps) => {
    const { intentar } = useContext(ContextoError);
    const [formulario, setFormulario] = useState<FormularioEdicionTarea | null>(null);
    const [motivos, setMotivos] = useState<Motivo[]>([]);
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            const [nuevosMotivos, producto] = await intentar(() =>
                Promise.all([getMotivos(), tarea.producto ? getProducto(tarea.producto.tipo, tarea.producto.codigo) : null])
            );
            setMotivos(nuevosMotivos);
            setFormulario(formularioEdicion(tarea, producto));
        };
        cargar().catch(() => undefined);
    }, [intentar, tarea]);

    if (!formulario) return <p className="vacio">Cargando…</p>;

    const cambiar = (cambios: Partial<FormularioEdicionTarea>) => setFormulario({ ...formulario, ...cambios });

    // Un motivo desactivado después de crear la tarea sigue apareciendo, con su nombre, para no perderlo al guardar.
    const opcionesMotivo = opcionesMotivoTarea(motivos, formulario.idMotivo);

    const guardar = async () => {
        const encontrados = erroresEdicion(formulario);
        setErrores(encontrados);
        if (encontrados.length > 0) return;
        setGuardando(true);
        try {
            await intentar(() => guardarEdicionTarea(tarea.id, edicionParaAPI(formulario)));
            onGuardada();
        } catch {
            setGuardando(false);
        }
    };

    return (
        <section className="tarjeta formulario">
            <QCargando visible={guardando} mensaje="Guardando…" />
            <QInput label="Título" nombre="titulo" valor={formulario.titulo} onChange={(titulo) => cambiar({ titulo })} />
            <SelectorTipoTarea valor={formulario.tipo} onChange={(tipo) => cambiar({ tipo })} />
            <div className="fila">
                <QInput label="Fecha" nombre="fecha" tipo="fecha" valor={formulario.fecha} onChange={(fecha) => cambiar({ fecha })} />
                <QInput label="Hora" nombre="hora" tipo="hora" valor={formulario.hora} onChange={(hora) => cambiar({ hora })} />
            </div>
            <QSelect
                label="Motivo"
                nombre="motivo"
                valor={formulario.idMotivo ?? ""}
                opcional
                opciones={opcionesMotivo}
                onChange={(opcion) => cambiar({ idMotivo: opcion?.valor || null })}
            />
            <SelectorProducto producto={formulario.producto} onChange={(producto) => cambiar({ producto })} />
            <NotaDictada label="Notas" valor={formulario.nota} maximo={MAX_NOTA} onChange={(nota) => cambiar({ nota })} />

            {errores.length > 0 && (
                <ul className="errores">
                    {errores.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            )}

            <div className="acciones">
                <QBoton variante="borde" ancho onClick={onCancelar}>
                    Cancelar
                </QBoton>
                <QBoton ancho deshabilitado={guardando} onClick={() => guardar()}>
                    Guardar cambios
                </QBoton>
            </div>
        </section>
    );
};
