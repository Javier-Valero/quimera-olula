import { LegacyAPI, legacyUrl } from "@olula/lib/api/legacy_api.ts";
import { Agente, AgenteAPI, UsuarioSmartsales, UsuarioSmartsalesAPI } from "./diseño.ts";
import { Posicion } from "./geolocalizacion.ts";

const agenteDesdeAPI = (agente: AgenteAPI): Agente => ({
    codigo: agente.codagente,
    nombre: agente.nombreap,
});

// Coordenadas de la dirección de facturación de varios clientes (las geolocalizadas), por código.
export const getCoordenadasClientes = async (codigos: string[]): Promise<Record<string, Posicion>> => {
    if (codigos.length === 0) return {};
    const respuesta = await LegacyAPI.get<{ data: { codcliente: string; latitud: number; longitud: number }[] }>(
        legacyUrl("clientes", { action: "coordenadas_facturacion", staticAction: true, params: { extra: { codigos: codigos.join(",") } } })
    );
    return Object.fromEntries(respuesta.data.map((c) => [c.codcliente, { latitud: Number(c.latitud), longitud: Number(c.longitud) }]));
};

export const getUsuarioSmartsales = async (): Promise<UsuarioSmartsales> => {
    const usuario = await LegacyAPI.get<UsuarioSmartsalesAPI>(
        legacyUrl("user", { action: "whoami", staticAction: true })
    );

    return {
        agente: usuario.agente ?? "",
        superusuario: !!usuario.superuser,
        tipoTratoFarma: usuario.tratolicenciafarma ? String(usuario.tratolicenciafarma) : null,
        tipoTratoVentaProducto: usuario.tratoventaproducto ? String(usuario.tratoventaproducto) : null,
        tipoTratoTareaUnica: usuario.tratotareaunica ? String(usuario.tratotareaunica) : null,
        grupo: usuario.group ?? null,
        empresa: usuario.company ?? null,
    };
};

export const getAgentesPermitidos = async (): Promise<Agente[]> => {
    const respuesta = await LegacyAPI.get<{ data: AgenteAPI[] }>(
        legacyUrl("agentes", {
            params: {
                fields: ["codagente", "nombreap"],
                order: { field: "nombreap", direction: "ASC" },
                page: { limit: 10000 },
            },
        })
    );

    return respuesta.data.map(agenteDesdeAPI);
};
