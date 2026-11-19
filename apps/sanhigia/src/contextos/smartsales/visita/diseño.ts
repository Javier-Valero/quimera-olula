import { Contexto } from "@olula/lib/diseño.ts";
import { TipoTarea } from "../comun/diseño.ts";
import { Posicion } from "../comun/geolocalizacion.ts";
import { AccionInicialTrato, DatosDocumento, Opcion, TipoDocumentoTrato, TratoDetalle } from "../trato/diseño.ts";

export type TareaVisita = {
    id: string;
    titulo: string;
    tipo: TipoTarea;
    fecha: string;
    hora: string | null;
    completada: boolean;
    enCurso: boolean;
    fechaInicio: string | null;
    horaInicio: string | null;
    posicionInicio: Posicion | null;
    nota: string;
    idTrato: string | null;
    codCliente: string | null;
    nombreCliente: string | null;
    interlocutor: string | null;
};

export type TareaVisitaAPI = {
    idtarea: number;
    titulo: string;
    tipo: TipoTarea;
    fecha: string;
    hora: string | null;
    completada: boolean;
    encurso: boolean | null;
    fechainicio: string | null;
    horainicio: string | null;
    latitudinicio: number | null;
    longitudinicio: number | null;
    nota: string | null;
    idtrato: number | null;
    codcliente: string | null;
    codclienteincidencia: string | null;
    nombrecliente: string | null;
    interlocutor: string | null;
};

export type Contacto = {
    codigo: string;
    nombre: string;
};

export type CausaPerdida = {
    id: string;
    descripcion: string;
};

export type SiguientePaso = "ninguno" | "presupuesto" | "pedido";

export type EstadoTrato = "Ganado" | "Perdido";

export type EstadoVisita =
    | "CARGANDO"
    | "PENDIENTE"
    | "EN_CURSO"
    | "FINALIZANDO"
    | "DOCUMENTO"
    | "CERRANDO_TRATO"
    | "TERMINADA";

// Presupuesto o pedido que se está pidiendo crear: el siguiente paso elegido
// o el pedido que exige el tipo de trato para ganarlo (ganaTrato).
export type DocumentoEnCurso = {
    tipo: TipoDocumentoTrato;
    conDireccion: boolean;
    direcciones: Opcion[];
    datos: DatosDocumento;
    dirCanarias: boolean;
    ganaTrato: boolean;
};

export type ContextoVisita = Contexto<EstadoVisita> & {
    tarea: TareaVisita | null;
    trato: TratoDetalle | null;
    contactos: Contacto[];
    causas: CausaPerdida[];
    nota: string;
    interlocutor: string | null;
    horaFin: string;
    siguientePaso: SiguientePaso;
    generarSiguiente: boolean;
    estadoTrato: EstadoTrato | null;
    idCausa: string | null;
    tratoCerrado: boolean;
    documento: DocumentoEnCurso | null;
    documentoCreado: { tipo: TipoDocumentoTrato; id: string } | null;
    // Lo que no se puede resolver aquí (licencia farma, trato sin cliente o sin agente) se termina en la ficha.
    accionEnFicha: AccionInicialTrato | null;
    errores: string[];
};

export type TiposTratoUsuario = {
    tipoTratoFarma: string | null;
    tipoTratoTareaUnica: string | null;
};

export type CambioVisita = Partial<
    Pick<ContextoVisita, "nota" | "interlocutor" | "horaFin" | "siguientePaso" | "generarSiguiente" | "estadoTrato" | "idCausa">
>;

export type FinalizacionAPI = {
    completada: true;
    fechafin: string;
    horafin: string;
    latitudfin: number | null;
    longitudfin: number | null;
    nota: string;
    interlocutor: string | null;
};
