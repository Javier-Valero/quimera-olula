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
    const { ctx, setCtx, emitir } = useMaquina(getMaquina, contextoInicial);
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

    // Para editar campos de texto: aplica el cambio en el mismo render, sin pasar por emitir (que es
    // asíncrono y calcula sobre el contexto de su último render). Con emitir, el valor del campo llegaba un
    // instante tarde y el cursor saltaba al final, y escribiendo rápido se podían perder letras.
    // Solo para cambios puros (sin backend); el resto de eventos siguen por emitir.
    const modificar = useCallback((cambio: (actual: C) => C) => setCtx(cambio), [setCtx]);

    return { ctx, emitir: emitirConProceso, modificar, procesando: eventoEnCurso !== null, eventoEnCurso };
};
