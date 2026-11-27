// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- las apps no incluyen este .d.ts en su tsconfig
/// <reference path="./plotly_dist.d.ts" />
import { createElement, lazy, Suspense } from "react";
import type { PlotParams } from "react-plotly.js";
import {
  adaptarConfig,
  adaptarEventoRelayout,
  adaptarLayout,
  adaptarTraza,
  type Objeto,
} from "./plot_adaptador";

// Se usa la factory con el bundle explícito de plotly.js: el `index` de react-plotly.js 4 importa
// "plotly.js/dist/plotly" sin extensión, que Node/Vitest no resuelven. Además, la carga diferida
// evita meter plotly (~8 MB) en el arranque de las apps que no pintan gráficos.
const ReactPlot = lazy(async () => {
  const [{ default: createPlotlyComponent }, plotly] = await Promise.all([
    import("react-plotly.js/factory"),
    import("plotly.js/dist/plotly.js"),
  ]);
  return { default: createPlotlyComponent(plotly.default ?? plotly) };
});

export type PlotProps = PlotParams & {
  // Permite HTML en text/hovertext/name. Solo para textos fijos del propio código, nunca datos de la API
  permitirHtml?: boolean;
};

export const Plot = ({ permitirHtml = false, data, layout, config, onRelayout, ...props }: PlotProps) =>
  createElement(
    Suspense,
    { fallback: null },
    createElement(ReactPlot, {
      ...props,
      data: (data ?? []).map(traza => adaptarTraza(traza as Objeto, permitirHtml)) as PlotParams["data"],
      layout: adaptarLayout(layout as Objeto) as PlotParams["layout"],
      config: adaptarConfig(config as Objeto) as PlotParams["config"],
      onRelayout: onRelayout
        ? (evento => onRelayout(adaptarEventoRelayout(evento as Objeto) as typeof evento))
        : undefined,
    }),
  );
