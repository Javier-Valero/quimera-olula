import { createElement } from "react";
import ReactPlot from "react-plotly.js";
import type { PlotParams } from "react-plotly.js";
import {
  adaptarConfig,
  adaptarEventoRelayout,
  adaptarLayout,
  adaptarTraza,
  type Objeto,
} from "./plot_adaptador";

export type PlotProps = PlotParams & {
  // Permite HTML en text/hovertext/name. Solo para textos fijos del propio código, nunca datos de la API
  permitirHtml?: boolean;
};

export const Plot = ({ permitirHtml = false, data, layout, config, onRelayout, ...props }: PlotProps) =>
  createElement(ReactPlot, {
    ...props,
    data: (data ?? []).map(traza => adaptarTraza(traza as Objeto, permitirHtml)) as PlotParams["data"],
    layout: adaptarLayout(layout as Objeto) as PlotParams["layout"],
    config: adaptarConfig(config as Objeto) as PlotParams["config"],
    onRelayout: onRelayout
      ? (evento => onRelayout(adaptarEventoRelayout(evento as Objeto) as typeof evento))
      : undefined,
  });
