import { Nota } from "../diseño.ts";

export type EstadoNotas = "lista" | "creando";

export type ContextoNotas = {
    estado: EstadoNotas;
    notas: Nota[];
    cargando: boolean;
    incidenciaId: string;
    agenteId: string;
};
