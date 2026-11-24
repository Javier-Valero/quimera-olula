import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ClienteElegido, Motivo, NuevaTareaAPI, Producto, Sugerencia, TipoProducto, TratoCliente } from "./diseño.ts";

const LIMITE_BUSQUEDA = 20;

const buscar = async <T>(modelo: string, filtroTexto: unknown, fields: string[], filtrosExtra: unknown[] = []) =>
    (
        await LegacyAPI.get<{ data: T[] }>(
            legacyUrl(modelo, {
                params: {
                    filter: { and: [filtroTexto, ...filtrosExtra] },
                    fields,
                    page: { limit: LIMITE_BUSQUEDA },
                },
            })
        )
    ).data;

// Como el selector de cliente legacy (base-ventas Cliente): sin los clientes dados de baja.
export const buscarClientes = async (texto: string): Promise<ClienteElegido[]> =>
    (
        await buscar<{ codcliente: string; nombre: string }>("clientes", ["nombre", "like", texto], ["codcliente", "nombre"], [["debaja", "eq", false]])
    ).map((cliente) => ({ codigo: cliente.codcliente, nombre: cliente.nombre }));

const catalogos: Record<TipoProducto, { modelo: string; codigo: string }> = {
    articulo: { modelo: "articulos", codigo: "referencia" },
    familia: { modelo: "familias", codigo: "codfamilia" },
    subfamilia: { modelo: "subfamilias", codigo: "codsubfamilia" },
};

// Por código o por descripción; la descripción sin distinguir tildes ("esterilizacion" encuentra "esterilización").
export const buscarProductos = async (tipo: TipoProducto, texto: string): Promise<Producto[]> => {
    const { modelo, codigo } = catalogos[tipo];
    const porTexto = { or: [[codigo, "like", texto], ["descripcion", "like_ua", texto]] };
    const filas = await buscar<Record<string, string>>(modelo, porTexto, [codigo, "descripcion"]);
    return filas.map((fila) => ({ tipo, codigo: fila[codigo], descripcion: fila.descripcion }));
};

// Descripción de un producto ya elegido (al editar una tarea solo se guarda el código).
export const getProducto = async (tipo: TipoProducto, valor: string): Promise<Producto> => {
    const { modelo, codigo } = catalogos[tipo];
    const filas = await buscar<Record<string, string>>(modelo, [codigo, "eq", valor], [codigo, "descripcion"]);
    return { tipo, codigo: valor, descripcion: filas[0]?.descripcion ?? valor };
};

export const getTratosAbiertosCliente =async (codCliente: string): Promise<TratoCliente[]> => {
    const respuesta = await LegacyAPI.get<{ data: { idtrato: number; titulo: string }[] }>(
        legacyUrl("ss_tratos", {
            params: {
                filter: { and: [["codcliente", "eq", codCliente], ["estado", "eq", "-"]] },
                fields: ["idtrato", "titulo"],
                order: { field: "fecha", direction: "DESC" },
                page: { limit: 50 },
            },
        })
    );
    return respuesta.data.map((trato) => ({ id: String(trato.idtrato), titulo: trato.titulo }));
};

export const getNombreCliente = async (codCliente: string): Promise<string> => {
    const respuesta = await LegacyAPI.get<{ data: { nombre: string }[] }>(
        legacyUrl("clientes", { id: codCliente, params: { fields: ["codcliente", "nombre"] } })
    );
    return respuesta.data[0]?.nombre ?? codCliente;
};

const getDireccionFacturacion = async (codCliente: string): Promise<number | null> => {
    const respuesta = await LegacyAPI.get<{ data: { id: number }[] }>(
        legacyUrl("dirclientes", {
            params: {
                filter: { and: [["codcliente", "eq", codCliente], ["dirclientes.domfacturacion", "eq", true]] },
                fields: ["id"],
                page: { limit: 1 },
            },
        })
    );
    return respuesta.data[0]?.id ?? null;
};

export const getSugerencias = async (codCliente: string): Promise<Sugerencia[]> => {
    const codDir = await getDireccionFacturacion(codCliente);
    if (codDir === null) return [];

    const respuesta = await LegacyAPI.get<{ data: { codsubfamilia: string; descripcion: string; score: number }[] }>(
        legacyUrl("ss_recomendaciones", {
            action: "get_subfamilias_by_cliente",
            staticAction: true,
            params: {
                filter: { and: [["codcliente", "eq", codCliente], ["coddir", "eq", codDir]] },
                page: { limit: 50 },
            },
        })
    );
    return respuesta.data.map((s) => ({ codSubfamilia: s.codsubfamilia, descripcion: s.descripcion, score: s.score }));
};

export const getMotivos = async (): Promise<Motivo[]> => {
    const respuesta = await RestAPI.get<{ datos: { id: string | number; descripcion: string; activo: boolean }[] }>(
        "/crm/motivo_tarea"
    );
    return respuesta.datos
        .filter((motivo) => motivo.activo)
        .map((motivo) => ({ id: String(motivo.id), descripcion: motivo.descripcion }));
};

export const crearTarea = async (tarea: NuevaTareaAPI & { idtrato: number; codagente: string }) =>
    LegacyAPI.post<typeof tarea, { pk: number }>(legacyUrl("ss_tareas"), tarea);

export const crearTareaUnica = async (tarea: NuevaTareaAPI & { codcliente: string }) =>
    LegacyAPI.post<typeof tarea, { pk: number; idtrato: number }>(
        legacyUrl("ss_tareas", { action: "crear_tarea_unica", staticAction: true }),
        tarea
    );
