import { adaptarConfigChart } from "./chart_adaptador";

type Obj = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Configuraciones copiadas de los dashboards de monterelax (formato chart.js 2)
const horizontalConTooltip = {
  type: "horizontalBar",
  data: { labels: ["Ana", "Luis"], datasets: [{ label: "Total", data: [3, 4], fill: false }] },
  options: {
    aspectRatio: 1.25,
    maintainAspectRatio: true,
    responsive: true,
    tooltips: {
      callbacks: {
        label(t: Obj, d: Obj) {
          return `${d.datasets[t.datasetIndex].label}: ${t.xLabel}`;
        },
      },
    },
    title: { display: true, text: "UP Totales por cosedor", fontSize: 16, fontStyle: "bold" },
    scales: { xAxes: [{ stacked: true }], yAxes: [{ stacked: true, ticks: { beginAtZero: true, fontSize: 10 } }] },
  },
};

const lineaConAnotacion = {
  type: "line",
  data: { labels: ["ene"], datasets: [{ label: "m", data: [1], lineTension: 0.3 }] },
  options: {
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: 42,
          borderColor: "tomato",
          borderWidth: 2,
          label: { backgroundColor: "red", content: "Media Pedidos", enabled: true, position: "left", fontSize: 10 },
        },
      ],
    },
  },
};

describe("adaptador chart.js 2 -> 4", () => {
  test("horizontalBar -> bar con indexAxis y", () => {
    const c = adaptarConfigChart(horizontalConTooltip) as Obj;
    expect(c.type).toBe("bar");
    expect(c.options.indexAxis).toBe("y");
    expect(c.options.aspectRatio).toBe(1.25);
  });

  test("title y escalas", () => {
    const c = adaptarConfigChart(horizontalConTooltip) as Obj;
    expect(c.options.plugins.title).toEqual({
      display: true,
      text: "UP Totales por cosedor",
      font: { size: 16, weight: "bold" },
    });
    expect(c.options.scales).toEqual({
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true, ticks: { font: { size: 10 } } },
    });
    expect(c.options).not.toHaveProperty("tooltips");
    expect(c.options).not.toHaveProperty("title");
  });

  test("callback de tooltip v2 recibe xLabel como valor en barras horizontales", () => {
    const c = adaptarConfigChart(horizontalConTooltip) as Obj;
    const label = c.options.plugins.tooltip.callbacks.label;
    const ctx = {
      parsed: { x: 4, y: 1 },
      label: "Luis",
      formattedValue: "4",
      datasetIndex: 0,
      dataIndex: 1,
      chart: { data: horizontalConTooltip.data },
    };
    expect(label(ctx)).toBe("Total: 4");
  });

  test("callback en barras verticales: xLabel es la categoría", () => {
    const vertical = { ...horizontalConTooltip, type: "bar" };
    const label = (adaptarConfigChart(vertical) as Obj).options.plugins.tooltip.callbacks.label;
    expect(label({ parsed: { x: 1, y: 4 }, label: "Luis", datasetIndex: 0, dataIndex: 1, chart: { data: vertical.data } }))
      .toBe("Total: Luis");
  });

  test("anotaciones 0.5 -> 3 y lineTension -> tension", () => {
    const c = adaptarConfigChart(lineaConAnotacion) as Obj;
    expect(c.options.plugins.annotation.annotations).toEqual([
      {
        type: "line",
        scaleID: "y",
        value: 42,
        borderColor: "tomato",
        borderWidth: 2,
        label: { backgroundColor: "red", content: "Media Pedidos", display: true, position: "start", font: { size: 10 } },
      },
    ]);
    expect(c.data.datasets[0]).toEqual({ label: "m", data: [1], tension: 0.3 });
  });

  test("configuración vacía (estado inicial de los dashboards)", () => {
    expect(adaptarConfigChart({})).toEqual({ type: undefined, options: {} });
  });
});
