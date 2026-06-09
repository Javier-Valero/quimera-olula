import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Estados posibles de una incidencia
 */
export type EstadoIncidencia = 'Pendiente' | 'Nueva' | 'Pendiente de datos' | 'Asignada' | 'Rechazada' | 'Cerrada';

/**
 * Prioridades de una incidencia
 */
export type PrioridadIncidencia = 'Baja' | 'Media' | 'Alta';

/**
 * Tipos de una incidencia
 */
export type TipoIncidencia = 'Proveedor' | 'Transportista';

/**
 * Interfaz principal de Incidencia (camelCase para el frontend)
 * Representa una incidencia en el sistema CRM
 */
export interface Incidencia extends Entidad {
    id: string;
    fecha: Date;
    descripcion: string;
    descripcionLarga?: string | null;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    clienteId?: string | null;
    nombreCliente: string;
    articuloId?: string | null;
    descripcionReferencia?: string | null;
    presupuestoId?: string | null;
    codigoPresupuesto?: string | null;
    familiaId?: string | null;
    agenteId?: string | null;
    enGarantia: boolean;
    tipoIncidencia?: TipoIncidencia;
    proveedorId?: string | null;
    transportistaId?: string | null;
    resolucion?: string | null;
}

/**
 * Interfaz para respuesta de API (snake_case del backend)
 */
export interface IncidenciaAPI {
    id: string;
    fecha: string;
    descripcion: string;
    descripcionlarga?: string | null;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    cliente_id?: string | null;
    nombre_cliente: string;
    articulo_id?: string | null;
    descripcion_referencia?: string | null;
    presupuesto_id?: string | null;
    codigo_presupuesto?: string | null;
    familia_id?: string | null;
    agente_id?: string | null;
    en_garantia: boolean;
    tipo_incidencia?: TipoIncidencia;
    proveedor_id?: string | null;
    transportista_id?: string | null;
    resolucion?: string | null;
}

/**
 * Tipo para crear nueva incidencia (sin id)
 */
export interface NuevaIncidencia {
    fecha: Date;
    descripcion: string;
    prioridad: PrioridadIncidencia;
    estado: EstadoIncidencia;
    nombreCliente: string;
    clienteId?: string | null;
    tipoIncidencia?: TipoIncidencia;
    [key: string]: unknown; // Satisface la interfaz Modelo que requiere index signature
}

/**
 * Tipos de funciones para infraestructura (contratos)
 */
export type GetIncidencia = (id: string) => Promise<Incidencia>;

export type GetIncidencias = (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => Promise<RespuestaLista<Incidencia>>;

export type PostIncidencia = (incidencia: NuevaIncidencia) => Promise<string>;

export type PatchIncidencia = (id: string, incidencia: Partial<Incidencia>) => Promise<void>;

export type DeleteIncidencia = (id: string) => Promise<void>;
