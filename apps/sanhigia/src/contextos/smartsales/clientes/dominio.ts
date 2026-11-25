import { DireccionCliente, EstadoClienteFiltro } from "./diseño.ts";

const soloDigitos = (telefono: string) => telefono.replace(/[^\d+]/g, "");

export const enlaceLlamar = (telefono: string | null) => (telefono ? `tel:${soloDigitos(telefono)}` : null);

export const enlaceEmail = (email: string | null) => (email ? `mailto:${email}` : null);

export const enlaceWhatsapp = (telefono: string | null) => {
    if (!telefono) return null;
    const digitos = soloDigitos(telefono).replace(/^\+/, "").replace(/^00/, "");
    const internacional = digitos.length === 9 ? `34${digitos}` : digitos;
    return `https://wa.me/${internacional}`;
};

export const enlaceComoLlegar = (direccion: DireccionCliente | null) => {
    if (!direccion) return null;
    const destino =
        direccion.latitud !== null && direccion.longitud !== null
            ? `${direccion.latitud},${direccion.longitud}`
            : [direccion.direccion, direccion.codPostal, direccion.ciudad, direccion.provincia].filter(Boolean).join(", ");
    return destino ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}` : null;
};

export const textoEstadoTrato = (estado: string) => (estado === "-" ? "Abierto" : estado);

// Filtro de la lista de clientes: nombre y estado (activo como en la ficha: no de baja y con pedidos recientes).
export const filtroClientes = (texto: string, estado: EstadoClienteFiltro) => {
    const clausulas: unknown[] = [];
    if (texto) clausulas.push(["nombre", "like", texto]);
    if (estado !== "todos") clausulas.push(["activo", "eq", estado === "activos"]);
    return clausulas.length ? { and: clausulas } : undefined;
};
