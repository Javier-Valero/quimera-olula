import { Periodo } from "../comun/diseño.ts";
import { HistoricoAPI, MesGrafico, MesHistorico, VentasFamilia, VentasFamiliaAPI } from "./diseño.ts";

export const parametrosPeriodo = (periodo: Periodo, agente: string | null): Record<string, string | boolean | number> => {
    const codAgente = agente ?? "TODOS";
    if (periodo.tipo === "fechas") {
        return { codAgente, customDates: true, dateFrom: periodo.desde, dateTo: periodo.hasta };
    }
    const numeros = periodo.trimestres.map((t) => t.numero);
    return {
        codAgente,
        customDates: false,
        anio: periodo.trimestres[0]?.año ?? new Date().getFullYear(),
        ...Object.fromEntries([1, 2, 3, 4].map((n) => [`T${n}`, numeros.includes(n as 1 | 2 | 3 | 4)])),
    };
};

export const periodoCompleto = (periodo: Periodo) =>
    periodo.tipo === "fechas" ? !!periodo.desde && !!periodo.hasta && periodo.desde <= periodo.hasta : periodo.trimestres.length > 0;

export const añoDelPeriodo = (periodo: Periodo, hoy: Date = new Date()) =>
    periodo.tipo === "trimestres"
        ? (periodo.trimestres[0]?.año ?? hoy.getFullYear())
        : Number(periodo.desde.slice(0, 4)) || hoy.getFullYear();

export const variacion = (actual: number, anterior: number): number | null =>
    anterior > 0 ? (actual * 100) / anterior - 100 : null;

export const textoVariacion = (valor: number | null) =>
    valor === null ? "—" : `${valor > 0 ? "+" : ""}${valor.toFixed(1)} %`;

export const historicoDesdeAPI = (historico: HistoricoAPI): MesHistorico[] =>
    historico.meses.map((mes, i) => ({
        mes,
        ventas: historico.ventas[i] ?? null,
        objetivo: Number(historico.objetivo[i]) || 0,
        prevision: historico.prevision[i] ?? null,
    }));

// Objetivo dinámico (propuesta pendiente de validar con el cliente): el backend reparte el objetivo del
// trimestre a partes iguales entre sus tres meses. Aquí cada mes pasa a necesitar lo que quedaba del
// trimestre entre los meses que faltaban: 1.º objetivo/3, 2.º (objetivo - ventas del 1.º)/2, 3.º lo que
// quede. Un mes sin ventas todavía (futuro) se supone que cumple su parte, para que los siguientes no se
// carguen con ella. Si ya se ha cubierto el trimestre, lo necesario es 0.
export const mesesConObjetivoPendiente = (meses: MesHistorico[]): MesGrafico[] => {
    const resultado: MesGrafico[] = [];
    for (let inicio = 0; inicio < meses.length; inicio += 3) {
        const trimestre = meses.slice(inicio, inicio + 3);
        const objetivoTrimestre = trimestre.reduce((total, m) => total + m.objetivo, 0);
        let restante = objetivoTrimestre;
        trimestre.forEach((mes, i) => {
            const necesario = Math.max(restante, 0) / (trimestre.length - i);
            resultado.push({ mes: mes.mes, ventas: mes.ventas, prevision: mes.prevision, necesario, objetivoTrimestre });
            restante -= mes.ventas ?? necesario;
        });
    }
    return resultado;
};

export const maximoHistorico = (meses: MesGrafico[]) =>
    Math.max(0, ...meses.flatMap((m) => [m.ventas ?? 0, m.necesario, m.prevision ?? 0]));

const claveMes = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

// Mes que aparece elegido al entrar: el actual si el gráfico es del año en curso.
export const mesInicial = (meses: { mes: string }[], hoy: Date = new Date()): string | null => {
    const actual = claveMes(hoy);
    return meses.some((m) => m.mes === actual) ? actual : null;
};

const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const eurosMes = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const verboNecesario = (mes: string, hoy: Date) => {
    const actual = claveMes(hoy);
    return mes < actual ? "Necesitabas" : mes === actual ? "Necesitas" : "Necesitarás";
};

// Línea de datos del mes elegido en el gráfico: ventas (o previsión si aún no ha llegado) y lo necesario
// para el objetivo del trimestre, con el % cubierto.
export const resumenMes = (mes: MesGrafico, hoy: Date = new Date()): string => {
    const [año, numero] = mes.mes.split("-").map(Number);
    const nombre = nombreMes.format(new Date(año, numero - 1, 1));
    const partes = [nombre.charAt(0).toUpperCase() + nombre.slice(1)];
    if (mes.ventas !== null) partes.push(`Ventas ${eurosMes.format(mes.ventas)}`);
    else if (mes.prevision !== null) partes.push(`Previsión ${eurosMes.format(mes.prevision)}`);
    else partes.push("Sin ventas ni previsión");
    if (mes.objetivoTrimestre <= 0) {
        partes.push("Sin objetivo");
    } else if (mes.necesario <= 0) {
        partes.push("Objetivo del trimestre cubierto");
    } else {
        const importe = mes.ventas ?? mes.prevision;
        const porcentaje = importe !== null ? ` (${Math.round((importe * 100) / mes.necesario)} %)` : "";
        partes.push(`${verboNecesario(mes.mes, hoy)} ${eurosMes.format(mes.necesario)}${porcentaje}`);
    }
    return partes.join(" · ");
};

export const familiaDesdeAPI =(familia: VentasFamiliaAPI): VentasFamilia => ({
    codigo: familia.codfamilia,
    descripcion: familia.descripcion,
    importe: Number(familia.importe) || 0,
    importeAnterior: Number(familia.importe_anterior) || 0,
    objetivo: familia.objetivo ? Number(familia.objetivo) : null,
    subfamilias: familia.subfamilias.map((s) => ({
        codigo: s.codsubfamilia,
        descripcion: s.descripcion,
        importe: Number(s.importe) || 0,
        importeAnterior: Number(s.importe_anterior) || 0,
    })),
});
