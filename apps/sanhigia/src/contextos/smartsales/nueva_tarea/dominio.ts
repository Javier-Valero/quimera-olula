import { fechaIso, textoTipoTarea } from "../comun/dominio.ts";
import { FormularioTarea, Motivo, NuevaTareaAPI, Sugerencia } from "./diseño.ts";

export const MAX_NOTA = 1000;
export const MAX_TITULO = 100;
export const AFINIDAD_SUGERENCIA = 0.7;

export const formularioVacio = (ahora: Date = new Date()): FormularioTarea => ({
    cliente: null,
    tratoSinCliente: null,
    titulo: "",
    tituloManual: false,
    idTrato: null,
    tipo: "Cita",
    fecha: fechaIso(ahora),
    hora: `${String(ahora.getHours()).padStart(2, "0")}:00`,
    idMotivo: null,
    producto: null,
    nota: "",
});

export const erroresFormulario = (formulario: FormularioTarea): string[] =>
    [
        !formulario.cliente && !formulario.tratoSinCliente && "Elige un cliente",
        formulario.tituloManual && !formulario.titulo.trim() && "Indica el título",
        formulario.tituloManual && formulario.titulo.trim().length > MAX_TITULO && `El título no puede pasar de ${MAX_TITULO} caracteres`,
        !formulario.fecha && "Indica la fecha",
        !formulario.hora && "Indica la hora",
        formulario.nota.length > MAX_NOTA && `La nota no puede pasar de ${MAX_NOTA} caracteres`,
    ].filter((error): error is string => !!error);

// Título automático: tipo · cliente (o contacto del trato) · motivo.
export const tituloAutomatico = (formulario: FormularioTarea, motivos: Motivo[]): string => {
    const motivo = motivos.find((m) => m.id === formulario.idMotivo)?.descripcion;
    const interlocutor = formulario.cliente?.nombre ?? formulario.tratoSinCliente?.contacto ?? formulario.tratoSinCliente?.titulo;
    return [textoTipoTarea[formulario.tipo], interlocutor, motivo]
        .filter(Boolean)
        .join(" · ")
        .slice(0, MAX_TITULO);
};

// El que escribe el comercial o, si no lo ha tocado, el automático.
export const tituloTarea = (formulario: FormularioTarea, motivos: Motivo[]): string =>
    formulario.tituloManual ? formulario.titulo.trim() : tituloAutomatico(formulario, motivos);

export const tareaParaAPI = (formulario: FormularioTarea, motivos: Motivo[]): NuevaTareaAPI => {
    const producto = formulario.producto;
    return {
        titulo: tituloTarea(formulario, motivos),
        fecha: formulario.fecha,
        hora: formulario.hora.length === 5 ? `${formulario.hora}:00` : formulario.hora,
        tipo: formulario.tipo,
        nota: formulario.nota,
        idmotivo: formulario.idMotivo ? Number(formulario.idMotivo) : null,
        referencia: producto?.tipo === "articulo" ? producto.codigo : null,
        codfamilia: producto?.tipo === "familia" ? producto.codigo : null,
        codsubfamilia: producto?.tipo === "subfamilia" ? producto.codigo : null,
    };
};

export const sugerenciasVisibles = (sugerencias: Sugerencia[], todas: boolean): Sugerencia[] =>
    todas ? sugerencias : sugerencias.filter((s) => s.score > AFINIDAD_SUGERENCIA);

// Opciones del campo Motivo: los activos y, si la tarea ya tiene uno desactivado, también ese (con su nombre),
// para no perderlo al guardar. Un motivo que ya no existe se muestra con su número.
export const opcionesMotivoTarea = (motivos: Motivo[], idActual: string | null = null) => {
    const opciones = motivos.filter((m) => m.activo).map((m) => ({ valor: m.id, descripcion: m.descripcion }));
    if (!idActual || opciones.some((o) => o.valor === idActual)) return opciones;
    const actual = motivos.find((m) => m.id === idActual);
    return [...opciones, { valor: idActual, descripcion: `${actual?.descripcion ?? `Motivo ${idActual}`} (inactivo)` }];
};
