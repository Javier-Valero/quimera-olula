import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { fechaIso } from "../comun/dominio.ts";
import { posicionActual } from "../comun/geolocalizacion.ts";
import { rutasSmartsales } from "../comun/rutas.ts";
import { DatosDocumento, Opcion, TipoDocumentoTrato } from "../trato/diseño.ts";
import {
    accionGanar,
    datosConDireccionUnica,
    datosDocumentoIniciales,
    erroresDocumento,
    puedeCrearPresupuesto,
    SIN_DIRECCION,
} from "../trato/dominio.ts";
import { aprobarPresupuesto, crearDocumentoTrato, esDireccionCanarias, getTrato, prepararDocumento } from "../trato/infraestructura.ts";
import { Producto } from "../nueva_tarea/diseño.ts";
import {
    CambioVisita,
    ContextoVisita,
    EdicionTareaAPI,
    EstadoVisita,
    FinalizacionAPI,
    FormularioEdicionTarea,
    TareaVisita,
    TiposTratoUsuario,
} from "./diseño.ts";
import {
    anularInicioVisita,
    cerrarTrato,
    finalizarTarea,
    getCausasPerdida,
    getContactosCliente,
    getTareaVisita,
    iniciarVisita,
    quedanTareasPendientes,
} from "./infraestructura.ts";

type ProcesarVisita = ProcesarContexto<EstadoVisita, ContextoVisita>;

export const MAX_NOTA = 1000;
const MAX_TITULO = 100;

// Edición: solo de tareas pendientes que no estén en curso (una visita iniciada se anula antes de cambiarla).
export const puedeEditar = (tarea: TareaVisita) => !tarea.completada && !tarea.enCurso;

export const formularioEdicion = (tarea: TareaVisita, producto: Producto | null): FormularioEdicionTarea => ({
    titulo: tarea.titulo,
    tipo: tarea.tipo,
    fecha: tarea.fecha,
    hora: tarea.hora?.slice(0, 5) ?? "",
    idMotivo: tarea.idMotivo,
    producto,
    nota: tarea.nota,
});

export const erroresEdicion = (formulario: FormularioEdicionTarea): string[] =>
    [
        !formulario.titulo.trim() && "Indica el título",
        formulario.titulo.length > MAX_TITULO && `El título no puede pasar de ${MAX_TITULO} caracteres`,
        !formulario.fecha && "Indica la fecha",
        !formulario.hora && "Indica la hora",
        formulario.nota.length > MAX_NOTA && `La nota no puede pasar de ${MAX_NOTA} caracteres`,
    ].filter((error): error is string => !!error);

export const edicionParaAPI = (formulario: FormularioEdicionTarea): EdicionTareaAPI => {
    const producto = formulario.producto;
    return {
        titulo: formulario.titulo.trim(),
        tipo: formulario.tipo,
        fecha: formulario.fecha,
        hora: formulario.hora.length === 5 ? `${formulario.hora}:00` : formulario.hora,
        nota: formulario.nota,
        idmotivo: formulario.idMotivo ? Number(formulario.idMotivo) : null,
        referencia: producto?.tipo === "articulo" ? producto.codigo : null,
        codfamilia: producto?.tipo === "familia" ? producto.codigo : null,
        codsubfamilia: producto?.tipo === "subfamilia" ? producto.codigo : null,
    };
};


export const contextoInicial: ContextoVisita = {
    estado: "CARGANDO",
    tarea: null,
    trato: null,
    contactos: [],
    causas: [],
    nota: "",
    interlocutor: null,
    horaFin: "",
    siguientePaso: "ninguno",
    generarSiguiente: false,
    estadoTrato: null,
    idCausa: null,
    tratoCerrado: false,
    documento: null,
    documentoCreado: null,
    accionEnFicha: null,
    errores: [],
};

export const horaActual = (ahora: Date = new Date()) =>
    `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

export const estadoSegunTarea = (tarea: TareaVisita): EstadoVisita => {
    if (tarea.completada) return "TERMINADA";
    return tarea.enCurso ? "EN_CURSO" : "PENDIENTE";
};

export const esVisita = (tarea: TareaVisita | null) => tarea?.tipo === "Cita";

export const erroresFinalizacion = (ctx: ContextoVisita): string[] =>
    [
        !ctx.horaFin && "Indica la hora de fin",
        ctx.nota.length > MAX_NOTA && `La nota no puede pasar de ${MAX_NOTA} caracteres`,
    ].filter((e): e is string => !!e);

export const erroresPerdida = (ctx: ContextoVisita): string[] => (ctx.idCausa ? [] : ["Indica la causa de la pérdida"]);

export const finalizacionParaAPI = (
    ctx: ContextoVisita,
    posicion: { latitud: number; longitud: number } | null,
    hoy: Date = new Date()
): FinalizacionAPI => ({
    completada: true,
    fechafin: ctx.tarea?.fechaInicio ?? fechaIso(hoy),
    horafin: ctx.horaFin.length === 5 ? `${ctx.horaFin}:00` : ctx.horaFin,
    latitudfin: posicion?.latitud ?? null,
    longitudfin: posicion?.longitud ?? null,
    nota: ctx.nota,
    interlocutor: ctx.interlocutor,
});

// Generar la siguiente tarea tiene prioridad sobre ir al documento creado.
export const destinoAlTerminar = (ctx: ContextoVisita): string => {
    const tarea = ctx.tarea;
    if (tarea?.idTrato && ctx.accionEnFicha) return rutasSmartsales.tratoConAccion(tarea.idTrato, ctx.accionEnFicha);
    if (ctx.generarSiguiente && tarea?.codCliente) {
        return rutasSmartsales.nuevaTareaPara(tarea.codCliente, ctx.tratoCerrado ? null : tarea.idTrato);
    }
    // Trato de un contacto, sin cliente: la siguiente tarea va al mismo trato (como legacy), si sigue abierto.
    if (ctx.generarSiguiente && tarea?.idTrato && !ctx.tratoCerrado) {
        return rutasSmartsales.nuevaTareaDeTrato(tarea.idTrato);
    }
    if (ctx.documentoCreado) {
        const { tipo, id } = ctx.documentoCreado;
        return tipo === "presupuesto" ? rutasSmartsales.presupuesto(id) : rutasSmartsales.pedido(id);
    }
    return rutasSmartsales.agenda;
};

export const documentoYaCreado = (tipo: TipoDocumentoTrato, trato: NonNullable<ContextoVisita["trato"]>) =>
    tipo === "presupuesto" ? !puedeCrearPresupuesto(trato) : !!trato.idPedido;

// Como en legacy: si era la última tarea pendiente de un trato abierto, se pregunta cómo ha terminado.
const comprobarCierreTrato = async (ctx: ContextoVisita): Promise<ContextoVisita> => {
    const tarea = ctx.tarea!;
    const terminada: ContextoVisita = { ...ctx, estado: "TERMINADA", documento: null, errores: [] };
    if (!tarea.idTrato || ctx.tratoCerrado || (await quedanTareasPendientes(tarea.idTrato, tarea.id))) return terminada;
    const trato = await getTrato(tarea.idTrato);
    if (trato.estado !== "-") return terminada;
    return { ...terminada, estado: "CERRANDO_TRATO", trato, causas: await getCausasPerdida(tarea.idTrato) };
};

const abrirDocumento = async (ctx: ContextoVisita, tipo: TipoDocumentoTrato, ganaTrato: boolean): Promise<ContextoVisita> => {
    const trato = await getTrato(ctx.tarea!.idTrato!);
    if (!trato.codAgente) {
        return { ...ctx, trato, estado: "TERMINADA", accionEnFicha: ganaTrato ? "ganar" : tipo };
    }
    if (documentoYaCreado(tipo, trato)) return comprobarCierreTrato({ ...ctx, trato });

    // Trato de contacto sin cliente: el cliente se elige en el propio diálogo.
    const pideCliente = !trato.codCliente;
    const preparacion = trato.codCliente ? await prepararDocumento(trato.codCliente) : SIN_DIRECCION;
    return {
        ...ctx,
        trato,
        estado: "DOCUMENTO",
        errores: [],
        documento: {
            tipo,
            pideCliente,
            conDireccion: preparacion.conDireccion,
            direcciones: preparacion.direcciones,
            datos: datosConDireccionUnica(datosDocumentoIniciales, preparacion),
            dirCanarias: preparacion.canarias,
            ganaTrato,
        },
    };
};

export const cargarProceso: ProcesarVisita = async (_ctx, payload) => {
    const tarea = await getTareaVisita(String(payload));
    const contactos = tarea.codCliente ? await getContactosCliente(tarea.codCliente) : [];
    return {
        ...contextoInicial,
        estado: estadoSegunTarea(tarea),
        tarea,
        contactos,
        nota: tarea.nota,
        interlocutor: tarea.interlocutor,
    };
};

// Crear el pedido gana el trato: no tiene sentido generar otra tarea tras él.
export const puedeGenerarSiguiente = (ctx: ContextoVisita) => ctx.siguientePaso !== "pedido";

export const cambiarProceso: ProcesarVisita = async (ctx, payload) => {
    const cambiado = { ...ctx, ...(payload as CambioVisita), errores: [] };
    return puedeGenerarSiguiente(cambiado) ? cambiado : { ...cambiado, generarSiguiente: false };
};

export const iniciarProceso: ProcesarVisita = async (ctx) => {
    const tarea = ctx.tarea!;
    await iniciarVisita(tarea.id, await posicionActual());
    return { ...ctx, estado: "EN_CURSO", tarea: await getTareaVisita(tarea.id) };
};

// La nota y el interlocutor que no se han guardado se descartan: vuelven a los de la tarea.
export const anularInicioProceso: ProcesarVisita = async (ctx) => {
    const id = ctx.tarea!.id;
    await anularInicioVisita(id);
    const tarea = await getTareaVisita(id);
    return { ...ctx, estado: "PENDIENTE", tarea, nota: tarea.nota, interlocutor: tarea.interlocutor, errores: [] };
};

export const pedirFinalizacionProceso: ProcesarVisita = async (ctx) => ({
    ...ctx,
    estado: "FINALIZANDO",
    horaFin: horaActual(),
    errores: [],
});

export const volverProceso: ProcesarVisita = async (ctx) => ({
    ...ctx,
    estado: ctx.tarea?.enCurso ? "EN_CURSO" : "PENDIENTE",
    errores: [],
});

export const guardarProceso: ProcesarVisita = async (ctx) => {
    const errores = erroresFinalizacion(ctx);
    if (errores.length > 0) return { ...ctx, errores };

    const tarea = ctx.tarea!;
    await finalizarTarea(tarea.id, finalizacionParaAPI(ctx, await posicionActual()));

    if (tarea.idTrato && ctx.siguientePaso !== "ninguno") return abrirDocumento(ctx, ctx.siguientePaso, false);
    return comprobarCierreTrato(ctx);
};

export const cambiarDocumentoProceso: ProcesarVisita = async (ctx, payload) => {
    const documento = ctx.documento!;
    return { ...ctx, documento: { ...documento, datos: { ...documento.datos, ...(payload as Partial<DatosDocumento>) } }, errores: [] };
};

export const cambiarDireccionDocumentoProceso: ProcesarVisita = async (ctx, payload) => {
    const codDireccion = (payload as string | null) || null;
    const canarias = codDireccion ? await esDireccionCanarias(codDireccion) : false;
    const documento = ctx.documento!;
    return {
        ...ctx,
        errores: [],
        documento: {
            ...documento,
            dirCanarias: canarias,
            datos: { ...documento.datos, codDireccion, regimenIva: canarias ? "Exportaciones" : null },
        },
    };
};

export const cambiarClienteDocumentoProceso: ProcesarVisita = async (ctx, payload) => {
    const cliente = (payload as Opcion | null) ?? null;
    const preparacion = cliente ? await prepararDocumento(cliente.valor, true) : SIN_DIRECCION;
    const documento = ctx.documento!;
    return {
        ...ctx,
        errores: [],
        documento: {
            ...documento,
            conDireccion: preparacion.conDireccion,
            direcciones: preparacion.direcciones,
            dirCanarias: preparacion.canarias,
            datos: datosConDireccionUnica({ ...documento.datos, cliente }, preparacion),
        },
    };
};

// payload: agente del usuario, que va como agente de marketing si el trato no tiene cliente.
export const confirmarDocumentoProceso: ProcesarVisita = async (ctx, payload) => {
    const documento = ctx.documento!;
    const errores = erroresDocumento(documento.tipo, documento.datos, documento.conDireccion, documento.pideCliente);
    if (errores.length > 0) return { ...ctx, errores };

    const id = await crearDocumentoTrato(documento.tipo, ctx.trato!, documento.datos, (payload as string | null) ?? null);
    const conDocumento: ContextoVisita = { ...ctx, documento: null, documentoCreado: { tipo: documento.tipo, id }, errores: [] };
    // Crear el pedido gana el trato: ya no hay que preguntar por su cierre.
    if (documento.tipo === "pedido") return { ...conDocumento, estado: "TERMINADA", tratoCerrado: true };
    return comprobarCierreTrato(conDocumento);
};

export const cancelarDocumentoProceso: ProcesarVisita = async (ctx) => {
    if (ctx.documento?.ganaTrato) return { ...ctx, estado: "CERRANDO_TRATO", documento: null, errores: [] };
    return comprobarCierreTrato({ ...ctx, documento: null });
};

// Ganar sigue las mismas reglas que la ficha del trato (accionGanar).
export const ganarTratoProceso: ProcesarVisita = async (ctx, payload) => {
    const { tipoTratoFarma, tipoTratoTareaUnica } = payload as TiposTratoUsuario;
    const trato = ctx.trato!;
    const accion = accionGanar(trato, tipoTratoFarma, tipoTratoTareaUnica);
    if (accion === "crear_pedido") return abrirDocumento(ctx, "pedido", true);
    if (accion === "licencia") return { ...ctx, estado: "TERMINADA", accionEnFicha: "ganar" };
    if (accion === "aprobar_presupuesto") await aprobarPresupuesto(trato);
    await cerrarTrato(trato.id, "Ganado", null);
    return { ...ctx, estado: "TERMINADA", tratoCerrado: true };
};

export const perderTratoProceso: ProcesarVisita = async (ctx) => {
    const errores = erroresPerdida(ctx);
    if (errores.length > 0) return { ...ctx, errores };

    await cerrarTrato(ctx.trato!.id, "Perdido", ctx.idCausa);
    return { ...ctx, estado: "TERMINADA", tratoCerrado: true };
};
