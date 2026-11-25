import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Pagina, Tarea } from "../comun/diseño.ts";
import { TareaAPI } from "../tareas/diseño.ts";
import { tareaDesdeAPI } from "../tareas/infraestructura.ts";
import { filtroClientes, filtroContactos } from "./dominio.ts";
import {
    ClienteLista,
    ContactoLista,
    EstadoClienteFiltro,
    DocumentoCliente,
    ResumenCliente,
    ResumenClienteAPI,
    TipoDocumento,
    TratoFicha,
} from "./diseño.ts";

const LIMITE = 50;

// Una página de clientes por orden alfabético (cursor page.next de la API legacy).
export const getPaginaClientes = async (
    texto: string,
    estado: EstadoClienteFiltro,
    limite: number,
    siguiente: unknown | null
): Promise<Pagina<ClienteLista>> => {
    const respuesta = await LegacyAPI.get<{ data: { codcliente: string; nombre: string; cifnif: string | null; activo: boolean | null }[]; page?: { next: unknown | null } }>(
        legacyUrl("clientes", {
            params: {
                filter: filtroClientes(texto, estado),
                fields: ["codcliente", "nombre", "cifnif", "activo"],
                order: { field: "nombre", direction: "ASC" },
                page: siguiente ? { limit: limite, next: siguiente } : { limit: limite },
            },
        })
    );
    return {
        elementos: respuesta.data.map((c) => ({ codigo: c.codcliente, nombre: c.nombre, cifNif: c.cifnif || null, activo: !!c.activo })),
        siguiente: respuesta.page?.next ?? null,
    };
};

type ContactoAPI = {
    codcontacto: string;
    nombre: string;
    email: string | null;
    telefono1: string | null;
    codcliente: string | null;
    num_tratos: number | null;
};

// Una página de contactos visibles para el agente, por orden alfabético.
export const getPaginaContactos = async (texto: string, limite: number, siguiente: unknown | null): Promise<Pagina<ContactoLista>> => {
    const respuesta = await LegacyAPI.get<{ data: ContactoAPI[]; page?: { next: unknown | null } }>(
        legacyUrl("contactos", {
            action: "get_contactos_visibles_agente",
            staticAction: true,
            params: {
                filter: filtroContactos(texto),
                order: { field: "nombre", direction: "ASC" },
                page: siguiente ? { limit: limite, next: siguiente } : { limit: limite },
            },
        })
    );
    return {
        elementos: respuesta.data.map((c) => ({
            codigo: c.codcontacto,
            nombre: c.nombre,
            email: c.email,
            telefono: c.telefono1,
            codCliente: c.codcliente,
            numTratos: Number(c.num_tratos) || 0,
        })),
        siguiente: respuesta.page?.next ?? null,
    };
};

export const getResumenCliente = async (codCliente: string): Promise<ResumenCliente> => {
    const r = await LegacyAPI.get<ResumenClienteAPI>(legacyUrl("clientes", { id: codCliente, action: "resumen_smartsales" }));
    return {
        codigo: r.codcliente,
        nombre: r.nombre,
        telefono: r.telefono,
        email: r.email,
        direccion: r.direccion && {
            direccion: r.direccion.direccion,
            codPostal: r.direccion.codpostal,
            ciudad: r.direccion.ciudad,
            provincia: r.direccion.provincia,
            latitud: r.direccion.latitud,
            longitud: r.direccion.longitud,
        },
        activo: r.activo,
        clienteDesde: r.clientedesde,
        ventas12Meses: r.ventas12meses,
        tratosAbiertos: r.tratosabiertos,
        ultimaVisita: r.ultimavisita,
        ultimaCompra: r.ultimacompra,
        proximasAcciones: r.proximasacciones,
    };
};

export const getTareasCliente = async (codCliente: string): Promise<Tarea[]> => {
    const respuesta = await LegacyAPI.get<{ data: TareaAPI[] }>(
        legacyUrl("ss_tareas", {
            params: {
                filter: { and: [{ or: [["codcliente", "eq", codCliente], ["codclienteincidencia", "eq", codCliente]] }] },
                fields: ["idtarea", "titulo", "fecha", "hora", "tipo", "completada", "encurso", "nombrecliente", "nombrecontactotrato"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: LIMITE },
            },
        })
    );
    return respuesta.data.map(tareaDesdeAPI);
};

export const getTratosCliente = async (codCliente: string): Promise<TratoFicha[]> => {
    const respuesta = await LegacyAPI.get<{
        data: { idtrato: number; titulo: string; estado: string; valor: number | null; fecha: string | null }[];
    }>(
        legacyUrl("ss_tratos", {
            params: {
                filter: { and: [["codcliente", "eq", codCliente]] },
                fields: ["idtrato", "titulo", "estado", "valor", "fecha"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: LIMITE },
            },
        })
    );
    return respuesta.data.map((t) => ({
        id: String(t.idtrato),
        titulo: t.titulo,
        estado: t.estado,
        valor: Number(t.valor) || 0,
        fecha: t.fecha,
    }));
};

const modelosDocumento: Record<TipoDocumento, { modelo: string; id: string; pdf: boolean }> = {
    presupuesto: { modelo: "presupuestoscli", id: "idpresupuesto", pdf: true },
    pedido: { modelo: "pedidoscli", id: "idpedido", pdf: false },
    factura: { modelo: "facturascli", id: "idfactura", pdf: false },
};

export const documentoConPdf = (tipo: TipoDocumento) => modelosDocumento[tipo].pdf;

export const getPdfDocumento = (tipo: TipoDocumento, idDocumento: string): Promise<Blob> => {
    const { modelo, id } = modelosDocumento[tipo];
    return LegacyAPI.blob(legacyUrl(modelo, { action: "to_pdf", staticAction: true, params: { extra: { [id]: idDocumento } } }));
};

export const getDocumentosCliente = async (tipo: TipoDocumento, codCliente: string): Promise<DocumentoCliente[]> => {
    const { modelo, id } = modelosDocumento[tipo];
    const respuesta = await LegacyAPI.get<{ data: Record<string, string | number>[] }>(
        legacyUrl(modelo, {
            params: {
                filter: { and: [["codcliente", "eq", codCliente]] },
                fields: [id, "codigo", "fecha", "total"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 20 },
            },
        })
    );
    return respuesta.data.map((d) => ({
        tipo,
        id: String(d[id]),
        codigo: String(d.codigo),
        fecha: String(d.fecha).slice(0, 10),
        total: Number(d.total) || 0,
    }));
};
