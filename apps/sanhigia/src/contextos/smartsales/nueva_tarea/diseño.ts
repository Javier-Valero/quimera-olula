import { TipoTarea } from "../comun/diseño.ts";

export type TipoProducto = "articulo" | "familia" | "subfamilia";

export type Producto = {
    tipo: TipoProducto;
    codigo: string;
    descripcion: string;
};

export type ClienteElegido = {
    codigo: string;
    nombre: string;
};

export type TratoCliente = {
    id: string;
    titulo: string;
};

export type Motivo = {
    id: string;
    descripcion: string;
};

export type Sugerencia = {
    codSubfamilia: string;
    descripcion: string;
    score: number;
};

// Trato de un contacto, sin cliente, desde el que se abre Nueva tarea: la tarea se crea en ese trato
// (como el alta de tarea de legacy) y no se pide cliente.
export type TratoSinCliente = {
    id: string;
    titulo: string;
    contacto: string | null;
};

export type FormularioTarea = {
    cliente: ClienteElegido | null;
    tratoSinCliente: TratoSinCliente | null;
    // Mientras el comercial no lo escribe, el título es el automático (tipo · cliente · motivo).
    titulo: string;
    tituloManual: boolean;
    idTrato: string | null;
    tipo: TipoTarea;
    fecha: string;
    hora: string;
    idMotivo: string | null;
    producto: Producto | null;
    nota: string;
};

export type NuevaTareaAPI = {
    titulo: string;
    fecha: string;
    hora: string;
    tipo: TipoTarea;
    nota: string;
    idmotivo: number | null;
    referencia: string | null;
    codfamilia: string | null;
    codsubfamilia: string | null;
};
