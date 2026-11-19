import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { DatosDocumento, Opcion, TipoDocumentoTrato } from "../diseño.ts";
import { EVENTO_VENTA_REGULAR, ORIGENES_MERCANCIA } from "../dominio.ts";
import { buscarEventos } from "../infraestructura.ts";
import "./DialogoDocumentoTrato.css";

type Props = {
    abierto: boolean;
    documento: TipoDocumentoTrato;
    conDireccion: boolean;
    direcciones: Opcion[];
    datos: DatosDocumento;
    dirCanarias: boolean;
    errores: string[];
    procesando: boolean;
    onCambiarDireccion: (codDireccion: string | null) => void;
    onCambiar: (cambios: Partial<DatosDocumento>) => void;
    onCancelar: () => void;
    onConfirmar: () => void;
};

// Datos para crear el presupuesto o el pedido de un trato: dirección de envío
// (si el cliente no tiene una automática), origen si es Canarias y evento.
export const DialogoDocumentoTrato = ({
    abierto,
    documento,
    conDireccion,
    direcciones,
    datos,
    dirCanarias,
    errores,
    procesando,
    onCambiarDireccion,
    onCambiar,
    onCancelar,
    onConfirmar,
}: Props) => (
    <QModal
        nombre="documento_trato"
        titulo={documento === "pedido" ? "Crear pedido" : "Crear presupuesto"}
        abierto={abierto}
        onCerrar={onCancelar}
    >
        {abierto && (
            <div className="DialogoDocumentoTrato">
                {conDireccion && (
                    <QSelect
                        label="Dirección de envío"
                        nombre="direccion"
                        valor={datos.codDireccion ?? ""}
                        opciones={direcciones}
                        onChange={(opcion) => onCambiarDireccion(opcion?.valor || null)}
                    />
                )}
                {dirCanarias && (
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
                    <QBoton variante="borde" onClick={onCancelar}>
                        Cancelar
                    </QBoton>
                    <QBoton deshabilitado={procesando} onClick={onConfirmar}>
                        Crear
                    </QBoton>
                </div>
            </div>
        )}
    </QModal>
);
