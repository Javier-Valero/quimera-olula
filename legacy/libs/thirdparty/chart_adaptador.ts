// Traduce la configuración de chart.js 2 + chartjs-plugin-annotation 0.5 que usa el legacy
// (dashboards de monterelax vía comps/Chart/BaseChart) al formato de chart.js 4 + annotation 3.

type Obj = Record<string, unknown>;

const esObjeto = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

// v2: fontSize/fontStyle/fontColor/fontFamily -> v4: font{size,weight,family} y color
export const adaptarFuente = (o: Obj): Obj => {
  const { fontSize, fontStyle, fontColor, fontFamily, ...resto } = o;
  const font: Obj = {
    ...(esObjeto(resto.font) ? resto.font : {}),
    ...(fontSize !== undefined ? { size: fontSize } : {}),
    ...(fontStyle !== undefined ? { weight: fontStyle } : {}),
    ...(fontFamily !== undefined ? { family: fontFamily } : {}),
  };
  return {
    ...resto,
    ...(Object.keys(font).length ? { font } : {}),
    ...(fontColor !== undefined && resto.color === undefined ? { color: fontColor } : {}),
  };
};

const adaptarEje = (eje: Obj): Obj => {
  const { gridLines, scaleLabel, ticks, ...resto } = eje;
  const adaptado: Obj = { ...resto };
  if (esObjeto(gridLines)) adaptado.grid = gridLines;
  if (esObjeto(scaleLabel)) {
    const { labelString, ...titulo } = adaptarFuente(scaleLabel);
    adaptado.title = { ...titulo, ...(labelString !== undefined ? { text: labelString } : {}) };
  }
  if (esObjeto(ticks)) {
    const { beginAtZero, min, max, suggestedMin, suggestedMax, ...restoTicks } = adaptarFuente(ticks);
    Object.assign(adaptado, Object.fromEntries(
      Object.entries({ beginAtZero, min, max, suggestedMin, suggestedMax }).filter(([, v]) => v !== undefined),
    ));
    adaptado.ticks = restoTicks;
  }
  return adaptado;
};

// v2: scales.xAxes[]/yAxes[] -> v4: scales.x / scales.y (ids x-axis-0 / y-axis-0 -> x / y)
const adaptarEscalas = (scales: Obj): Obj => {
  const { xAxes, yAxes, ...resto } = scales;
  const nuevas: Obj = { ...resto };
  ([["x", xAxes], ["y", yAxes]] as const).forEach(([eje, lista]) => {
    if (!Array.isArray(lista)) return;
    lista.forEach((def: Obj, i: number) => {
      const id = (def.id as string) ?? (i === 0 ? eje : `${eje}${i}`);
      const { id: _id, ...resto } = def;
      nuevas[id] = { ...(i === 0 ? {} : { axis: eje }), ...adaptarEje(resto) };
    });
  });
  return nuevas;
};

const ID_EJE: Record<string, string> = { "x-axis-0": "x", "y-axis-0": "y" };
const POSICION: Record<string, string> = { left: "start", top: "start", right: "end", bottom: "end", center: "center" };

// annotation 0.5 -> 3: label.enabled -> display, position left/right -> start/end, ids de eje
const adaptarAnotacion = (a: Obj): Obj => {
  const { mode: _mode, scaleID, label, ...resto } = a;
  const adaptada: Obj = { ...resto };
  if (typeof scaleID === "string") adaptada.scaleID = ID_EJE[scaleID] ?? scaleID;
  ["xScaleID", "yScaleID"].forEach(k => {
    if (typeof a[k] === "string") adaptada[k] = ID_EJE[a[k] as string] ?? a[k];
  });
  if (esObjeto(label)) {
    const { enabled, position, ...restoLabel } = adaptarFuente(label);
    adaptada.label = {
      ...restoLabel,
      ...(enabled !== undefined ? { display: enabled } : {}),
      ...(typeof position === "string" ? { position: POSICION[position] ?? position } : {}),
    };
  }
  return adaptada;
};

type ItemTooltipV2 = { xLabel: unknown; yLabel: unknown; datasetIndex: number; index: number; label: unknown; value: unknown };
type CallbackV2 = (item: ItemTooltipV2, data: unknown) => unknown;
type ContextoV4 = {
  parsed: { x: unknown; y: unknown };
  label: unknown;
  formattedValue: unknown;
  datasetIndex: number;
  dataIndex: number;
  chart: { data: unknown };
};

// v2 callbacks reciben (tooltipItem, data); v4 reciben el contexto. xLabel/yLabel en v2 eran
// categoría/valor en barras verticales y valor/categoría en horizontalBar.
const adaptarCallbacks = (callbacks: Obj, horizontal: boolean): Obj =>
  Object.fromEntries(
    Object.entries(callbacks).map(([nombre, fn]) => {
      if (typeof fn !== "function" || fn.length < 2) return [nombre, fn];
      const legacy = fn as CallbackV2;
      return [
        nombre,
        (ctx: ContextoV4 | ContextoV4[]) => {
          const c = Array.isArray(ctx) ? ctx[0] : ctx;
          if (!c) return "";
          const item: ItemTooltipV2 = {
            xLabel: horizontal ? c.parsed?.x : c.label,
            yLabel: horizontal ? c.label : c.parsed?.y,
            datasetIndex: c.datasetIndex,
            index: c.dataIndex,
            label: c.label,
            value: c.formattedValue,
          };
          return legacy(item, c.chart?.data);
        },
      ];
    }),
  );

export const adaptarConfigChart = (config: Obj): Obj => {
  const horizontal = config.type === "horizontalBar";
  const { tooltips, title, legend, annotation, scales, plugins, ...opcionesResto } = esObjeto(config.options)
    ? config.options
    : ({} as Obj);

  const options: Obj = { ...opcionesResto };
  const pluginsOpciones: Obj = esObjeto(plugins) ? { ...plugins } : {};
  if (horizontal) options.indexAxis = "y";
  if (esObjeto(scales)) options.scales = adaptarEscalas(scales);
  if (esObjeto(title)) pluginsOpciones.title = adaptarFuente(title);
  if (esObjeto(legend)) {
    const labels = esObjeto(legend.labels) ? { labels: adaptarFuente(legend.labels) } : {};
    pluginsOpciones.legend = { ...legend, ...labels };
  }
  if (esObjeto(tooltips)) {
    const { callbacks, ...restoTooltips } = tooltips;
    pluginsOpciones.tooltip = {
      ...adaptarFuente(restoTooltips),
      ...(esObjeto(callbacks) ? { callbacks: adaptarCallbacks(callbacks, horizontal) } : {}),
    };
  }
  if (esObjeto(annotation)) {
    const { annotations, ...restoAnotacion } = annotation;
    pluginsOpciones.annotation = {
      ...restoAnotacion,
      annotations: Array.isArray(annotations) ? annotations.map(a => adaptarAnotacion(a as Obj)) : annotations,
    };
  }
  if (Object.keys(pluginsOpciones).length) options.plugins = pluginsOpciones;

  const data = esObjeto(config.data) ? config.data : undefined;
  const datasets = Array.isArray(data?.datasets)
    ? (data.datasets as Obj[]).map(({ lineTension, ...d }) => ({
        ...d,
        ...(lineTension !== undefined && d.tension === undefined ? { tension: lineTension } : {}),
      }))
    : undefined;

  return {
    ...config,
    type: horizontal ? "bar" : config.type,
    ...(data ? { data: { ...data, ...(datasets ? { datasets } : {}) } } : {}),
    options,
  };
};
