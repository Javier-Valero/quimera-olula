import { ContextoError } from '@olula/lib/contexto.ts';
import { Contexto, EmitirEvento, Maquina } from '@olula/lib/diseño.ts';
import { procesarEvento } from '@olula/lib/dominio.js';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface UseMaquinaReturn<Estado extends string, C extends Contexto<Estado>> {
    ctx: C;
    setCtx: React.Dispatch<React.SetStateAction<C>>;
    emitir: EmitirEvento;
}

export function useMaquina<Estado extends string, C extends Contexto<Estado>>(
    getMaquina: () => Maquina<Estado, C>,
    contextoInicial: C,
    publicar: EmitirEvento = async () => { },
): UseMaquinaReturn<Estado, C> {

    const { intentar } = useContext(ContextoError);
    const maquina = useMemo(() => getMaquina(), []);

    const [ctx, setCtx] = useState<C>(contextoInicial);
    const ctxRef = useRef<C>(contextoInicial);

    useEffect(() => {
        ctxRef.current = ctx;
    }, [ctx]);

    const emitir: EmitirEvento = useCallback(async (evento: string, payload?: unknown, init: boolean = false): Promise<void> => {
        const contexto: C = {
            ...ctxRef.current,
            estado: init ? contextoInicial.estado : ctxRef.current.estado,
        };

        const [nuevoContexto, eventos] = await intentar(() =>
            procesarEvento(maquina, contexto, evento, payload)
        );

        ctxRef.current = nuevoContexto;
        setCtx(nuevoContexto);

        if (publicar) {
            eventos.forEach(([nombre, datos]) => publicar(nombre, datos));
        }

        // return eventos;
    }, [maquina, intentar, publicar, contextoInicial.estado]);

    return {
        ctx,
        setCtx,
        emitir,
    };
}
