// Equivalente a `$.param(obj)` de jQuery 3 (modo no tradicional), para no depender de jquery
// solo por esta función. Formato: arrays `a[]=1&a[]=2`, objetos `a[b]=1`, null/undefined -> "".

const esObjetoPlano = valor =>
  Object.prototype.toString.call(valor) === "[object Object]";

const construir = (prefijo, valor, añadir) => {
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => {
      if (/\[\]$/.test(prefijo)) {
        añadir(prefijo, v);
      } else {
        construir(`${prefijo}[${typeof v === "object" && v != null ? i : ""}]`, v, añadir);
      }
    });
  } else if (esObjetoPlano(valor)) {
    Object.keys(valor).forEach(nombre => construir(`${prefijo}[${nombre}]`, valor[nombre], añadir));
  } else {
    añadir(prefijo, valor);
  }
};

export const serializarParams = params => {
  const partes = [];
  const añadir = (clave, valorOFuncion) => {
    const valor = typeof valorOFuncion === "function" ? valorOFuncion() : valorOFuncion;
    partes.push(`${encodeURIComponent(clave)}=${encodeURIComponent(valor == null ? "" : valor)}`);
  };

  if (params == null) return "";
  if (Array.isArray(params)) {
    // Array de {name, value}, como serializeArray()
    params.forEach(({ name, value }) => añadir(name, value));
  } else {
    Object.keys(params).forEach(prefijo => construir(prefijo, params[prefijo], añadir));
  }
  return partes.join("&");
};
