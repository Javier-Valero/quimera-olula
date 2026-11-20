import { FamiliaTrato } from "../tratos/diseño.ts";

export type EstadoTrato = "Ganado" | "Perdido" | "-";

export type TratoDetalle = {
    id: string;
    titulo: string;
    valor: number;
    estado: EstadoTrato;
    idTipoTrato: string | null;
    tipoTrato: string | null;
    fecha: string | null;
    hora: string | null;
    codCliente: string | null;
    nombreCliente: string | null;
    codContacto: string | null;
    nombreContacto: string | null;
    codAgente: string | null;
    idCampania: number | null;
    causaPerdida: string | null;
    idPresupuesto: string | null;
    codPresupuesto: string | null;
    idPedido: string | null;
    codPedido: string | null;
    exigirPedido: boolean;
    idLicencia: string | null;
    familias: FamiliaTrato[];
};

export type TratoDetalleAPI = {
    idtrato: number;
    titulo: string;
    valor: number | null;
    estado: string | null;
    idtipotrato: number | null;
    tipotrato: string | null;
    fecha: string | null;
    horaalta: string | null;
    codcliente: string | null;
    nombrecliente: string | null;
    codcontacto: string | null;
    nombrecontacto: string | null;
    codagente: string | null;
    idcampania: number | null;
    descripcionperdida: string | null;
    idpresupuesto: number | null;
    codpresupuesto: string | null;
    idpedido: number | null;
    codpedido: string | null;
    exigirgenerarpedido: boolean | null;
    idlicencia: number | null;
    familias: string | null;
};

export type CambiosTratoAPI = Partial<{
    titulo: string;
    valor: number;
    idtipotrato: number | null;
    codcontacto: string | null;
    familias: string;
    estado: EstadoTrato;
    idperdida: number | null;
    codcliente: string;
}>;

export type FormularioEdicion = {
    titulo: string;
    valor: number;
    idTipoTrato: string | null;
    codContacto: string | null;
    familias: FamiliaTrato[];
};

export type Nota = {
    id: string;
    texto: string;
    fecha: string;
};

export type AccionGanar = "ganar" | "licencia" | "aprobar_presupuesto" | "crear_pedido";

// Acción que la ficha lanza al abrirse con ?accion=, p. ej. desde "Finalizar visita".
export type AccionInicialTrato = "presupuesto" | "pedido" | "ganar";

export type TipoDocumentoTrato = "presupuesto" | "pedido";

export type DatosDocumento = {
    // Solo si el trato no tiene cliente (trato de contacto): se elige al crear el documento.
    cliente: Opcion | null;
    // Presupuesto de un trato sin cliente para un cliente no registrado (como legacy): nombre y dirección libres.
    noRegistrado: { nombre: string; direccion: string } | null;
    codDireccion: string | null;
    regimenIva: string | null;
    codEvento: string | null;
};

export type Opcion = {
    valor: string;
    descripcion: string;
};

// Lo que hay que preguntar de la dirección al crear el presupuesto o el pedido.
export type PreparacionDocumento = {
    conDireccion: boolean;
    direcciones: Opcion[];
    direccionUnica: string | null;
    canarias: boolean;
};

export type FechasLicencia = {
    fin: string;
    caducidad: string;
};

export type Dialogo =
    | { tipo: "ninguno" }
    | { tipo: "causa_perdida"; causas: Opcion[] }
    | { tipo: "licencia" }
    | { tipo: "documento"; documento: TipoDocumentoTrato; pideCliente: boolean; conDireccion: boolean; direcciones: Opcion[] }
    | { tipo: "asociar_pedido" }
    | { tipo: "borrar" };
