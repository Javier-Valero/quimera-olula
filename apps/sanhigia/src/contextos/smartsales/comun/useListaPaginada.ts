import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Pagina } from "./diseño.ts";

export type CargarPagina<T> = (siguiente: unknown | null) => Promise<Pagina<T>>;

// cargada: ya ha llegado la primera página de la carga actual (para no decir "no hay" mientras tanto).
type Estado<T> = { elementos: T[]; siguiente: unknown | null; cargando: boolean; cargada: boolean };

// Lista que se carga por páginas con el cursor de la API legacy (page.next) y un "Cargar más".
// Vuelve a empezar cada vez que cambia cargarPagina (definirla con useCallback y sus filtros);
// las respuestas de una carga anterior que lleguen tarde se descartan.
export const useListaPaginada = <T>(cargarPagina: CargarPagina<T> | null) => {
    const { intentar } = useContext(ContextoError);
    const [estado, setEstado] = useState<Estado<T>>({ elementos: [], siguiente: null, cargando: false, cargada: false });
    const peticion = useRef(0);

    useEffect(() => {
        if (!cargarPagina) return;
        const id = ++peticion.current;
        setEstado((actual) => ({ ...actual, cargada: false }));
        const cargar = async () => {
            const pagina = await intentar(() => cargarPagina(null));
            if (id === peticion.current) setEstado({ elementos: pagina.elementos, siguiente: pagina.siguiente, cargando: false, cargada: true });
        };
        cargar().catch(() => undefined);
    }, [cargarPagina, intentar]);

    const cargarMas = useCallback(async () => {
        if (!cargarPagina || estado.siguiente === null || estado.cargando) return;
        const id = peticion.current;
        setEstado((actual) => ({ ...actual, cargando: true }));
        try {
            const pagina = await intentar(() => cargarPagina(estado.siguiente));
            if (id !== peticion.current) return;
            setEstado((actual) => ({
                elementos: [...actual.elementos, ...pagina.elementos],
                siguiente: pagina.siguiente,
                cargando: false,
                cargada: true,
            }));
        } catch {
            setEstado((actual) => ({ ...actual, cargando: false }));
        }
    }, [cargarPagina, estado.siguiente, estado.cargando, intentar]);

    return { elementos: estado.elementos, hayMas: estado.siguiente !== null, cargando: estado.cargando, cargada: estado.cargada, cargarMas };
};
