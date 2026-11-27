import { adaptarEventoRelayout, adaptarLayout, adaptarTraza, escaparHtml } from "./plot_adaptador";

describe("adaptador Plot", () => {
  test("escapa HTML en text, hovertext y name", () => {
    const traza = adaptarTraza({
      type: "bar",
      text: ["<img src=x onerror=alert(1)>", "A&B"],
      hovertext: "<b>x</b>",
      name: "<script>",
      customdata: [{ group_id: 1 }],
    });
    expect(traza.text).toEqual(["&lt;img src=x onerror=alert(1)&gt;", "A&amp;B"]);
    expect(traza.hovertext).toBe("&lt;b&gt;x&lt;/b&gt;");
    expect(traza.name).toBe("&lt;script&gt;");
    expect(traza.customdata).toEqual([{ group_id: 1 }]);
  });

  test("permitirHtml deja los textos intactos", () => {
    expect(adaptarTraza({ type: "bar", text: "<b>x</b>" }, true).text).toBe("<b>x</b>");
  });

  test("convierte trazas mapbox a map", () => {
    expect(adaptarTraza({ type: "scattermapbox", subplot: "mapbox2" })).toMatchObject({
      type: "scattermap",
      subplot: "map2",
    });
    expect(adaptarTraza({ type: "densitymapbox" }).type).toBe("densitymap");
    expect(adaptarTraza({ type: "pie" }).type).toBe("pie");
  });

  test("convierte layout.mapbox a layout.map sin token", () => {
    const layout = adaptarLayout({ mapbox: { zoom: 3, accesstoken: "x", style: "open-street-map" }, height: 10 });
    expect(layout).toEqual({ map: { zoom: 3, style: "open-street-map" }, height: 10 });
  });

  test("duplica los eventos de relayout con prefijo mapbox", () => {
    const evento = adaptarEventoRelayout({ "map.zoom": 5, "map.center": { lat: 1, lon: 2 }, autosize: true });
    expect(evento["mapbox.zoom"]).toBe(5);
    expect(evento["mapbox.center"]).toEqual({ lat: 1, lon: 2 });
    expect(evento["map.zoom"]).toBe(5);
    expect(evento.autosize).toBe(true);
  });

  test("escaparHtml escapa comillas", () => {
    expect(escaparHtml(`"'`)).toBe("&quot;&#39;");
  });
});
