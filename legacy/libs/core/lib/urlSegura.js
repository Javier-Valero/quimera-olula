const PROTOCOLOS_PERMITIDOS = ["http:", "https:", "blob:"];

// Devuelve la URL normalizada si usa un protocolo permitido; null si no (javascript:, data:, etc.)
export const urlSegura = url => {
  if (typeof url !== "string" || !url.trim()) return null;
  try {
    const parsed = new URL(url.trim(), window.location.href);
    return PROTOCOLOS_PERMITIDOS.includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

// window.open para URLs que vienen de la API: solo http(s)/blob y sin acceso a window.opener
export const abrirUrlSegura = (url, destino = "_blank") => {
  const segura = urlSegura(url);
  if (!segura) {
    console.warn("abrirUrlSegura: URL bloqueada", url);
    return null;
  }
  return window.open(segura, destino, "noopener,noreferrer");
};
