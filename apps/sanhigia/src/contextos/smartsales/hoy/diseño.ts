import { RangoFechas, Tarea } from "../comun/diseño.ts";
import { OrigenTrato, TratoListaAPI } from "../tratos/diseño.ts";

export type LineaKpi = {
    clave: string;
    etiqueta: string;
    objetivo: number;
    alcanzada: number;
};

export type BloqueKpi = {
    lineas: LineaKpi[];
    rango: RangoFechas | null;
};

export type ProgresoComercial = {
    ventas: number;
    objetivo: number;
    porcentaje: number;
    incremento: number;
    nuevosClientes: BloqueKpi;
    unidades: BloqueKpi;
};

export type Avisos = {
    contactosCursos: number;
    contactosActivos: number;
    pedidosOtrosAgentes: number;
};

export type TratoAbierto = {
    id: string;
    titulo: string;
    estado: string;
    cliente: string | null;
    contacto: string | null;
    valor: number;
    fecha: string | null;
    origen: OrigenTrato;
};

export type TareasHoy = {
    deHoy: Tarea[];
    anteriores: Tarea[];
};

type LineaKpiAPI = {
    objetivo: number;
    alcanzada: number;
    codfamilia?: string;
    codsubfamilia?: string | null;
    etiqueta?: string;
    id?: number | string;
    nombre?: string;
};

export type BloqueKpiAPI = {
    detalle: LineaKpiAPI[];
    fechainicio?: string;
    fechafin?: string;
};

export type ProgresoComercialAPI = {
    total: number;
    goal: number;
    percent: number;
    increment: number;
    kpi_nuevos_clientes_familia: BloqueKpiAPI;
    kpi_unidades_producto: BloqueKpiAPI;
};

export type TratoAbiertoAPI = TratoListaAPI;
