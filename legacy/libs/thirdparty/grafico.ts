import { Chart as ChartJS, type ChartConfiguration, type ChartItem, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { adaptarConfigChart } from "./chart_adaptador";

// chart.js 4 es modular: se registran todos los tipos/escalas/plugins como hacía la v2 por defecto
ChartJS.register(...registerables, annotationPlugin);

// `Chart` acepta la configuración de chart.js 2 que usa el legacy y la traduce a la v4
export class Chart extends ChartJS {
  constructor(item: ChartItem, config: Record<string, unknown>) {
    const { plugins, ...resto } = config;
    // annotation ya está registrado globalmente; si además se pasa inline se ejecutaría dos veces
    const pluginsInline = Array.isArray(plugins) ? plugins.filter(p => p !== annotationPlugin) : [];
    super(item, { ...adaptarConfigChart(resto), plugins: pluginsInline } as unknown as ChartConfiguration);
  }
}

export const ChartAnnotation = annotationPlugin;
