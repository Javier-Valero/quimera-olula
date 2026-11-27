export type Objeto = Record<string, unknown>;

// plotly.js 4 eliminó las trazas *mapbox y el subplot `mapbox` en favor de sus equivalentes con maplibre
const TRAZAS_MAPBOX: Record<string, string> = {
  scattermapbox: "scattermap",
  choroplethmapbox: "choroplethmap",
  densitymapbox: "densitymap",
};

// Campos de texto que plotly pinta interpretando etiquetas HTML (<b>, <a>, <br>...)
const CAMPOS_TEXTO = ["text", "hovertext", "name"];

const esObjeto = (v: unknown): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);

export const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escaparValor = (valor: unknown): unknown => {
  if (typeof valor === "string") return escaparHtml(valor);
  if (Array.isArray(valor)) return valor.map(escaparValor);
  return valor;
};

export const adaptarTraza = (traza: Objeto, permitirHtml = false): Objeto => {
  const adaptada: Objeto = { ...traza };
  const tipo = typeof traza.type === "string" ? traza.type : undefined;
  if (tipo && TRAZAS_MAPBOX[tipo]) {
    adaptada.type = TRAZAS_MAPBOX[tipo];
    if (typeof traza.subplot === "string") {
      adaptada.subplot = traza.subplot.replace(/^mapbox/, "map");
    }
  }
  if (!permitirHtml) {
    CAMPOS_TEXTO.forEach(campo => {
      if (campo in traza) adaptada[campo] = escaparValor(traza[campo]);
    });
  }
  return adaptada;
};

export const adaptarLayout = (layout: Objeto | undefined): Objeto | undefined => {
  if (!layout) return layout;
  const adaptado: Objeto = {};
  Object.entries(layout).forEach(([clave, valor]) => {
    const nueva = /^mapbox\d*$/.test(clave) ? clave.replace(/^mapbox/, "map") : clave;
    if (nueva !== clave && esObjeto(valor)) {
      // `accesstoken` no existe en `map`; los estilos de mapbox:// no funcionan sin token
      const { accesstoken: _token, ...resto } = valor;
      adaptado[nueva] = resto;
    } else {
      adaptado[nueva] = valor;
    }
  });
  return adaptado;
};

// Los eventos de relayout llegan como `map.center`, `map._derived`...; se duplican con el prefijo
// `mapbox` para que los manejadores escritos para plotly 2/3 sigan funcionando
export const adaptarEventoRelayout = (evento: Objeto): Objeto => {
  const adaptado: Objeto = { ...evento };
  Object.entries(evento).forEach(([clave, valor]) => {
    if (/^map\d*(\.|$)/.test(clave)) {
      adaptado[clave.replace(/^map/, "mapbox")] = valor;
    }
  });
  return adaptado;
};

export const adaptarConfig = (config: Objeto | undefined): Objeto | undefined => {
  if (!config) return config;
  const { mapboxAccessToken: _token, ...resto } = config;
  return resto;
};

