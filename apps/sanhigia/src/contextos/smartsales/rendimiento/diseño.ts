export type VentasPeriodo = {
    ventas: number;
    objetivo: number;
    ventasAñoAnterior: number;
};

export type VentasPeriodoAPI = {
    total: number;
    goal: number;
    previous_year_sold: number;
};

export type MesHistorico = {
    mes: string;
    ventas: number | null;
    objetivo: number;
    prevision: number | null;
};

// Mes del gráfico: "necesario" es lo que quedaba por vender del objetivo del trimestre, repartido entre
// los meses que faltaban (dinámico: depende de lo vendido en los meses anteriores del trimestre).
export type MesGrafico = {
    mes: string;
    ventas: number | null;
    prevision: number | null;
    necesario: number;
    objetivoTrimestre: number;
};

export type HistoricoAPI = {
    meses: string[];
    ventas: (number | null)[];
    objetivo: number[];
    prevision: (number | null)[];
};

export type VentasSubfamilia = {
    codigo: string;
    descripcion: string;
    importe: number;
    importeAnterior: number;
};

export type VentasFamilia = VentasSubfamilia & {
    objetivo: number | null;
    subfamilias: VentasSubfamilia[];
};

type VentasSubfamiliaAPI = {
    codsubfamilia: string;
    descripcion: string;
    importe: number;
    importe_anterior: number;
};

export type VentasFamiliaAPI = {
    codfamilia: string;
    descripcion: string;
    importe: number;
    importe_anterior: number;
    objetivo: number | null;
    subfamilias: VentasSubfamiliaAPI[];
};
