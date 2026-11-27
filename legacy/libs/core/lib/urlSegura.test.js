import { abrirUrlSegura, urlSegura } from "./urlSegura";

describe("urlSegura", () => {
  test("acepta http, https y blob", () => {
    expect(urlSegura("https://ejemplo.com/etiqueta.pdf")).toBe("https://ejemplo.com/etiqueta.pdf");
    expect(urlSegura("http://ejemplo.com/a")).toBe("http://ejemplo.com/a");
    expect(urlSegura("blob:https://ejemplo.com/123")).toBe("blob:https://ejemplo.com/123");
  });

  test("resuelve rutas relativas contra la página actual", () => {
    expect(urlSegura("/etiquetas/1.pdf")).toBe(`${window.location.origin}/etiquetas/1.pdf`);
  });

  test("bloquea javascript:, data: y valores vacíos", () => {
    expect(urlSegura("javascript:alert(1)")).toBeNull();
    expect(urlSegura(" JaVaScRiPt:alert(1)")).toBeNull();
    expect(urlSegura("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(urlSegura("")).toBeNull();
    expect(urlSegura(undefined)).toBeNull();
  });

  test("abrirUrlSegura no abre URLs bloqueadas y usa noopener", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    abrirUrlSegura("javascript:alert(1)");
    expect(open).not.toHaveBeenCalled();
    abrirUrlSegura("https://ejemplo.com/e.pdf");
    expect(open).toHaveBeenCalledWith("https://ejemplo.com/e.pdf", "_blank", "noopener,noreferrer");
    vi.restoreAllMocks();
  });
});
