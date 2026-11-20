import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof QModal> & {
    procesando: boolean;
    mensaje?: string;
};

// QModal que, mientras se procesa, no se puede cerrar y muestra el indicador.
// El <dialog> nativo se pinta por encima de todo, así que el QCargando de la pantalla
// queda debajo: tiene que ir dentro del diálogo, donde además tapa sus botones.
export const ModalProcesando = ({ procesando, mensaje = "Procesando…", children, ...props }: Props) => (
    <QModal {...props} bloquearCierre={procesando} mostrarBotonCerrar={!procesando}>
        <QCargando visible={procesando} mensaje={mensaje} />
        {children}
    </QModal>
);
