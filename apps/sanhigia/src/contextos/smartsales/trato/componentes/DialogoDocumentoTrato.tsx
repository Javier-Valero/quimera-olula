import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ModalProcesando } from "../../comun/componentes/ModalProcesando.tsx";
import { DatosDocumento, Opcion, TipoDocumentoTrato } from "../diseño.ts";
import { EVENTO_VENTA_REGULAR, ORIGENES_MERCANCIA } from "../dominio.ts";
import { buscarClientes } from "../../nueva_tarea/infraestructura.ts";
import { buscarEventos } from "../infraestructura.ts";
import "./DialogoDocumentoTrato.css";

type Props = {
    abierto: boolean;
    documento: TipoDocumentoTrato;
    pideCliente?: boolean;
    conDireccion: boolean;
    direcciones: Opcion[];
    datos: DatosDocumento;
    dirCanarias: boolean;
    errores: string[];
    procesando: boolean;
    onCambiarCliente?: (cliente: Opcion | null) => void;
    onCambiarDireccion: (codDireccion: string | null) => void;
    onCambiar: (cambios: Partial<DatosDocumento>) => void;
    onCancelar: () => void;
    onConfirmar: () => void;
};

// Datos para crear el presupuesto o el pedido de un trato, como legacy (EstadoTrato y, sin cliente,
// PedidosCliNuevo / PresupuestoCliNuevo): cliente si el trato no lo tiene (o, en presupuesto, uno no
// registrado), dirección de envío, origen si es Canarias y evento.
export const DialogoDocumentoTrato = ({
    abierto,
    documento,
    pideCliente = false,
    conDireccion,
    direcciones,
    datos,
    dirCanarias,
    errores,
    procesando,
    onCambiarCliente,
    onCambiarDireccion,
    onCambiar,
    onCancelar,
    onConfirmar,
}: Props) => {
    // Cliente no registrado: solo para presupuestos de tratos sin cliente, como legacy.
    const noRegistrado = pideCliente && documento === "presupuesto" ? datos.noRegistrado : null;
    return (
    <ModalProcesando
        nombre="documento_trato"
        titulo={documento === "pedido" ? "Crear pedido" : "Crear presupuesto"}
        abierto={abierto}
        onCerrar={onCancelar}
        procesando={procesando}
        mensaje={documento === "pedido" ? "Creando pedido…" : "Creando presupuesto…"}
    >
        {abierto && (
            <div className="DialogoDocumentoTrato">
                {pideCliente && <p className="aviso">El trato no tiene cliente: indica el del {documento}.</p>}
                {pideCliente && documento === "presupuesto" && (
                    <QBoton
                        variante="texto"
                        tamaño="pequeño"
                        onClick={() =>
                            onCambiar(
                                noRegistrado
                                    ? { noRegistrado: null }
                                    : { noRegistrado: { nombre: "", direccion: "" }, cliente: null, codDireccion: null, regimenIva: null }
                            )
                        }
                    >
                        {noRegistrado ? "Cliente no registrado (cambiar a registrado)" : "Cliente registrado (cambiar a no registrado)"}
                    </QBoton>
                )}
                {pideCliente && !noRegistrado && (
                    <QAutocompletar
                        label="Cliente"
                        nombre="cliente_documento"
                        valor={datos.cliente?.valor ?? ""}
                        descripcion={datos.cliente?.descripcion}
                        obtenerOpciones={async (texto) =>
                            (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))
                        }
                        onChange={(opcion) => onCambiarCliente?.(opcion ? { valor: opcion.valor, descripcion: opcion.descripcion } : null)}
                    />
                )}
                {noRegistrado && (
                    <>
                        <QInput
                            label="Nombre"
                            nombre="nombre_no_registrado"
                            valor={noRegistrado.nombre}
                            onChange={(nombre) => onCambiar({ noRegistrado: { ...noRegistrado, nombre } })}
                        />
                        <QInput
                            label="Dirección"
                            nombre="direccion_no_registrado"
                            opcional
                            valor={noRegistrado.direccion}
                            onChange={(direccion) => onCambiar({ noRegistrado: { ...noRegistrado, direccion } })}
                        />
                    </>
                )}
                {/* La key vuelve a montar el selector al cambiar de cliente, con sus direcciones. */}
                {conDireccion && !noRegistrado && (
                    <QSelect
                        key={datos.cliente?.valor ?? "cliente-del-trato"}
                        label="Dirección de envío"
                        nombre="direccion"
                        valor={datos.codDireccion ?? ""}
                        opciones={direcciones}
                        onChange={(opcion) => onCambiarDireccion(opcion?.valor || null)}
                    />
                )}
                {dirCanarias && !noRegistrado && (
                    <QSelect
                        label="Origen de salida"
                        nombre="regimen_iva"
                        valor={datos.regimenIva ?? ""}
                        opciones={ORIGENES_MERCANCIA}
                        onChange={(opcion) => onCambiar({ regimenIva: opcion?.valor || null })}
                    />
                )}
                <QAutocompletar
                    label="Evento"
                    nombre="evento"
                    valor={datos.codEvento ?? ""}
                    obtenerOpciones={async (texto) => [EVENTO_VENTA_REGULAR, ...(await buscarEventos(texto))]}
                    onChange={(opcion) => onCambiar({ codEvento: opcion?.valor ?? null })}
                />
                {errores.length > 0 && (
                    <ul className="errores">
                        {errores.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}
                <div className="acciones">
                    <QBoton variante="borde" deshabilitado={procesando} onClick={onCancelar}>
                        Cancelar
                    </QBoton>
                    <QBoton deshabilitado={procesando} onClick={onConfirmar}>
                        Crear
                    </QBoton>
                </div>
            </div>
        )}
    </ModalProcesando>
    );
};
