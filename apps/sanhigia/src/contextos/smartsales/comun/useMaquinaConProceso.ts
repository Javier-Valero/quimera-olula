import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Contexto, EmitirEvento, Maquina } from "@olula/lib/diseño.ts";
import { useCallback, useRef, useState } from "react";

// useMaquina que indica qué evento está en curso (para mostrar QCargando y bloquear los botones)
// y descarta los eventos que lleguen mientras tanto, para evitar dobles pulsaciones.
// Los eventos de eventosSinBloqueo (editar un campo, la carga inicial) ni marcan ni se bloquean:
// si no, al escribir parpadearía el indicador y se podrían perder pulsaciones.
const SOLO_CAMBIAR = ["cambiar"];

export const useMaquinaConProceso = <Estado extends string, C extends Contexto<Estado>>(
    getMaquina: () => Maquina<Estado, C>,
    contextoInicial: C,
    eventosSinBloqueo: string[] = SOLO_CAMBIAR
) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);
    const [eventoEnCurso, setEventoEnCurso] = useState<string | null>(null);
    const enCurso = useRef(false);

    const emitirConProceso: EmitirEvento = useCallback(
        async (evento: string, payload?: unknown, init?: boolean) => {
            if (eventosSinBloqueo.includes(evento)) return emitir(evento, payload, init);
            if (enCurso.current) return;
            enCurso.current = true;
            setEventoEnCurso(evento);
            try {
                await emitir(evento, payload, init);
            } finally {
                enCurso.current = false;
                setEventoEnCurso(null);
            }
        },
        [emitir, eventosSinBloqueo]
    );

    return { ctx, emitir: emitirConProceso, procesando: eventoEnCurso !== null, eventoEnCurso };
};
