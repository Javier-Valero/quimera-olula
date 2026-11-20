import {
    EstadoTratoFiltro,
    FamiliaTrato,
    FiltrosTratos,
    FormularioTrato,
    NuevoTratoAPI,
    OrigenTrato,
    TotalesTratos,
    TratoListaAPI,
} from "./diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import { GRUPOS_MARKETING } from "../contacto/dominio.ts";

export const CUENTA_CAMPANIAS_COMERCIAL = "comercial";

export const origenTrato = (trato: TratoListaAPI, tipoTratoFarma: string | null): OrigenTrato => {
    if (tipoTratoFarma && String(trato.idtipotrato) === tipoTratoFarma) return "farma";
    if (!trato.idcampania) return null;
    return trato.cuentamarketing === CUENTA_CAMPANIAS_COMERCIAL ? "campaña" : "mkt";
};

const clausulaEstado: Record<EstadoTratoFiltro, unknown[] | null> = {
    abiertos: ["estado", "eq", "-"],
    ganados: ["estado", "eq", "Ganado"],
    perdidos: ["estado", "eq", "Perdido"],
    todos: null,
};

export const filtroTratos = (filtros: FiltrosTratos, conEstado = true) => {
    const clausulas: unknown[] = [];
    if (filtros.agente) {
        clausulas.push({ or: [["codagente", "eq", filtros.agente], ["codagenteobservador", "eq", filtros.agente]] });
    }
    if (conEstado && clausulaEstado[filtros.estado]) clausulas.push(clausulaEstado[filtros.estado]);
    if (filtros.titulo) clausulas.push(["titulo", "like", filtros.titulo]);
    if (filtros.contacto) clausulas.push(["nombrecontacto", "like", filtros.contacto]);
    if (filtros.codCliente) clausulas.push(["codcliente", "eq", filtros.codCliente]);
    if (filtros.cifNif) clausulas.push(["cifnif", "like", filtros.cifNif]);
    if (filtros.desde) clausulas.push(["fecha", "gte", filtros.desde]);
    if (filtros.hasta) clausulas.push(["fecha", "lte", filtros.hasta]);
    return clausulas.length ? { and: clausulas } : undefined;
};

// Como legacy: tras crear un trato con contacto, si no está en la lista del agente se pregunta si
// asociarlo; a Marketing no se le pregunta.
export const debePreguntarAsociar = (grupo: string | null, yaAsociado: boolean) =>
    !yaAsociado && !GRUPOS_MARKETING.includes(grupo ?? "");

// Total de la lista según el estado filtrado ("Mostrando X de total").
export const totalSegunEstado = (totales: TotalesTratos, estado: EstadoTratoFiltro): number =>
    estado === "todos" ? totales.abiertos + totales.ganados + totales.perdidos : totales[estado];

export const totalesDesdeAPI = ({ total, ganados, perdidos }: { total: number; ganados: number; perdidos: number }) => ({
    abiertos: Math.max(Number(total) - Number(ganados) - Number(perdidos), 0),
    ganados: Number(ganados),
    perdidos: Number(perdidos),
});

// Mismas reglas que el alta legacy: cliente o contacto; un trato farma exige los dos y el permiso.
export const erroresTrato = (formulario: FormularioTrato, tipoTratoFarma: string | null = null, puedeFarma = true): string[] => {
    const farma = !!tipoTratoFarma && formulario.idTipoTrato === tipoTratoFarma;
    return [
        !formulario.titulo.trim() && "Indica el título",
        farma && !formulario.cliente && "Elige un cliente: este tipo de trato lo exige",
        farma && !formulario.contacto && "Elige un contacto: este tipo de trato lo exige",
        !farma && !formulario.cliente && !formulario.contacto && "Elige un cliente o un contacto",
        !formulario.idTipoTrato && "Elige el tipo de trato",
        farma && !puedeFarma && "No tienes permisos para usar este tipo de trato",
        formulario.valor < 0 && "El valor no puede ser negativo",
    ].filter((e): e is string => !!e);
};

export const familiasATexto = (familias: FamiliaTrato[]) => familias.map((familia) => JSON.stringify(familia)).join(";");

export const familiasDesdeTexto = (texto: string | null): FamiliaTrato[] =>
    (texto ?? "")
        .split(";")
        .filter(Boolean)
        .flatMap((familia) => {
            try {
                return [JSON.parse(familia) as FamiliaTrato];
            } catch {
                return [];
            }
        });

const horaConSegundos = (ahora: Date) =>
    [ahora.getHours(), ahora.getMinutes(), ahora.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");

// Mismos campos que manda el alta de trato legacy: el backend asigna el agente
// del cliente si codagente llega vacío.
export const tratoParaAPI = (formulario: FormularioTrato, codAgente: string | null, ahora: Date = new Date()): NuevoTratoAPI => {
    const producto = formulario.producto;
    return {
        codagente: codAgente || null,
        estado: "-",
        estadoasigagente: "Publicado",
        fecha: fechaIso(ahora),
        horaalta: horaConSegundos(ahora),
        titulo: formulario.titulo.trim().slice(0, 100),
        codcliente: formulario.cliente?.codigo ?? null,
        codcontacto: formulario.contacto?.codigo ?? null,
        idtipotrato: formulario.idTipoTrato ? Number(formulario.idTipoTrato) : null,
        valor: formulario.valor,
        familias: familiasATexto(formulario.familias),
        referencia: producto?.tipo === "articulo" ? producto.codigo : null,
        codfamilia: producto?.tipo === "familia" ? producto.codigo : null,
        codsubfamilia: producto?.tipo === "subfamilia" ? producto.codigo : null,
    };
};
