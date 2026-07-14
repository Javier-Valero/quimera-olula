import { MetaModelo } from "@olula/lib/dominio.js";

export type NuevaCarpeta = {
    nombre: string;
};

export const metaNuevaCarpeta: MetaModelo<NuevaCarpeta> = {
    campos: {
        nombre: { requerido: true },
    },
};

export const carpetaVacia: NuevaCarpeta = {
    nombre: "",
};
