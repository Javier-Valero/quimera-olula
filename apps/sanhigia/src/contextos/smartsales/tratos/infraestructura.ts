import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Pagina } from "../comun/diseño.ts";
import { FamiliaTrato, FiltrosTratos, NuevoTratoAPI, TipoTrato, TotalesTratos, TratoLista, TratoListaAPI } from "./diseño.ts";
import { filtroTratos, origenTrato, totalesDesdeAPI } from "./dominio.ts";

const camposLista = [
    "idtrato",
    "titulo",
    "nombrecliente",
    "nombrecontacto",
    "nombreagente",
    "valor",
    "estado",
    "fecha",
    "idcampania",
    "idtipotrato",
    "cuentamarketing",
];

// Una página de tratos, del más reciente al más antiguo (la API desempata por idtrato).
export const getPaginaTratos = async (
    filtros: FiltrosTratos,
    tipoTratoFarma: string | null,
    limite: number,
    siguiente: unknown | null
): Promise<Pagina<TratoLista>> => {
    const respuesta = await LegacyAPI.get<{ data: TratoListaAPI[]; page?: { next: unknown | null } }>(
        legacyUrl("ss_tratos", {
            params: {
                filter: filtroTratos(filtros),
                fields: camposLista,
                order: { field: "fecha", direction: "DESC" },
                page: siguiente ? { limit: limite, next: siguiente } : { limit: limite },
            },
        })
    );
    return {
        elementos: respuesta.data.map((trato) => ({
            id: String(trato.idtrato),
            titulo: trato.titulo,
            cliente: trato.nombrecliente,
            contacto: trato.nombrecontacto,
            agente: trato.nombreagente ?? null,
            valor: Number(trato.valor) || 0,
            estado: trato.estado,
            fecha: trato.fecha,
            origen: origenTrato(trato, tipoTratoFarma),
        })),
        siguiente: respuesta.page?.next ?? null,
    };
};

export const getTotalesTratos = async (filtros: FiltrosTratos): Promise<TotalesTratos> => {
    const respuesta = await LegacyAPI.get<{ data: { total: number; ganados: number; perdidos: number } }>(
        legacyUrl("ss_tratos", {
            action: "get_totales",
            staticAction: true,
            params: { filter: filtroTratos(filtros, false) },
        })
    );
    return totalesDesdeAPI(respuesta.data);
};

export const getTiposTrato = async (): Promise<TipoTrato[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idtipotrato: number; tipo: string }[] }>(
        legacyUrl("ss_tipostrato", { params: { fields: ["idtipotrato", "tipo"], page: { limit: 100 } } })
    );
    return respuesta.data.map((t) => ({ id: String(t.idtipotrato), descripcion: t.tipo }));
};

export const getPvpArticulo = async (referencia: string): Promise<number> => {
    const respuesta = await LegacyAPI.get<{ data: { pvp: number | null }[] }>(
        legacyUrl("articulos", { id: referencia, params: { fields: ["referencia", "pvp"] } })
    );
    return Number(respuesta.data[0]?.pvp) || 0;
};

export const getFamiliaDeProducto = async (tipo: "articulo" | "subfamilia", codigo: string): Promise<FamiliaTrato | null> => {
    const modelo = tipo === "articulo" ? "articulos" : "subfamilias";
    const campo = tipo === "articulo" ? "referencia" : "codsubfamilia";
    const producto = await LegacyAPI.get<{ data: { codfamilia: string | null }[] }>(
        legacyUrl(modelo, { params: { filter: { and: [[campo, "eq", codigo]] }, fields: [campo, "codfamilia"], page: { limit: 1 } } })
    );
    const codFamilia = producto.data[0]?.codfamilia;
    return codFamilia ? getFamilia(codFamilia) : null;
};

export const getFamilia = async (codFamilia: string): Promise<FamiliaTrato> => {
    const respuesta = await LegacyAPI.get<{ data: { codfamilia: string; descripcion: string }[] }>(
        legacyUrl("familias", { params: { filter: { and: [["codfamilia", "eq", codFamilia]] }, fields: ["codfamilia", "descripcion"] } })
    );
    return respuesta.data[0] ?? { codfamilia: codFamilia, descripcion: codFamilia };
};

export const getDescripcionProducto = async (tipo: "articulo" | "familia" | "subfamilia", codigo: string): Promise<string> => {
    const modelos = {
        articulo: ["articulos", "referencia"],
        familia: ["familias", "codfamilia"],
        subfamilia: ["subfamilias", "codsubfamilia"],
    } as const;
    const [modelo, campo] = modelos[tipo];
    const respuesta = await LegacyAPI.get<{ data: { descripcion: string }[] }>(
        legacyUrl(modelo, { params: { filter: { and: [[campo, "eq", codigo]] }, fields: [campo, "descripcion"], page: { limit: 1 } } })
    );
    return respuesta.data[0]?.descripcion ?? codigo;
};

// Como el selector de contacto legacy: si hay cliente, solo sus contactos.
export const buscarContactos = async (texto: string, codCliente: string | null): Promise<{ codigo: string; nombre: string }[]> => {
    const clausulas = [
        ...(texto ? [["nombre", "like", texto]] : []),
        ...(codCliente ? [["codcliente", "eq", codCliente]] : []),
    ];
    const respuesta = await LegacyAPI.get<{ data: { codcontacto: string; nombre: string }[] }>(
        legacyUrl("contactos", {
            params: {
                filter: clausulas.length ? { and: clausulas } : undefined,
                fields: ["codcontacto", "nombre"],
                order: { field: "nombre", direction: "ASC" },
                page: { limit: 20 },
            },
        })
    );
    return respuesta.data.map((c) => ({ codigo: c.codcontacto, nombre: c.nombre }));
};

// Lista de contactos del agente (ss_contactos_agente), por email, como el alta de trato legacy.
export const contactoEnListaAgente = async (codContacto: string, codAgente: string): Promise<{ asociado: boolean; email: string | null }> => {
    const respuesta = await LegacyAPI.post<{ contacto: string; agente: string }, { data: unknown[]; email: string | null }>(
        legacyUrl("ss_contactos_agente", { action: "are_associated", staticAction: true }),
        { contacto: codContacto, agente: codAgente }
    );
    return { asociado: respuesta.data.length > 0, email: respuesta.email };
};

export const asociarContactoAgente = (email: string, codAgente: string) =>
    LegacyAPI.post(legacyUrl("ss_contactos_agente"), { contacto: email, agente: codAgente });

export const crearTrato = async (trato: NuevoTratoAPI) => LegacyAPI.post<NuevoTratoAPI, { pk: number }>(legacyUrl("ss_tratos"), trato);
