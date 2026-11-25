import { renderHook, waitFor, act } from "@testing-library/react";
import { usePreferenciasVista } from "./usePreferenciasVista.ts";
import * as infra from "./infraestructura.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);
const guardarVista = vi.mocked(infra.guardarVistaUsuario);

beforeEach(() => vi.clearAllMocks());

describe("usePreferenciasVista", () => {
  test("sin pantalla la vista es fija: no pide nada ni deja personalizar", () => {
    const { result } = renderHook(() => usePreferenciasVista(undefined));

    expect(getVista).not.toHaveBeenCalled();
    expect(result.current.personalizable).toBe(false);
    expect(result.current.cargada).toBe(true);
    expect(result.current.config).toBeUndefined();
  });

  test("carga la configuración y su origen", async () => {
    getVista.mockResolvedValue({
      pantalla: "ventas.pedido",
      vista: "",
      config: { modo: "tarjetas" },
      origen: "empresa",
    });

    const { result } = renderHook(() => usePreferenciasVista("ventas.pedido"));

    await waitFor(() => expect(result.current.cargada).toBe(true));
    expect(getVista).toHaveBeenCalledWith("ventas.pedido", "");
    expect(result.current.config).toEqual({ modo: "tarjetas" });
    expect(result.current.personalizada).toBe(true);
    expect(result.current.personalizable).toBe(true);
  });

  test("si el servidor falla, la del código y sin personalizar", async () => {
    getVista.mockRejectedValue({ estado: 500 });

    const { result } = renderHook(() => usePreferenciasVista("ventas.pedido"));

    await waitFor(() => expect(result.current.cargada).toBe(true));
    expect(result.current.config).toBeUndefined();
    expect(result.current.personalizable).toBe(false);
  });

  test("guardar la deja como del usuario", async () => {
    getVista.mockResolvedValue({ pantalla: "ventas.pedido", vista: "", config: null, origen: null });
    guardarVista.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePreferenciasVista("ventas.pedido", "pendientes"));
    await waitFor(() => expect(result.current.cargada).toBe(true));
    expect(result.current.personalizada).toBe(false);

    await act(() => result.current.guardar({ tabla: { columnas: ["codigo"] } }));

    expect(guardarVista).toHaveBeenCalledWith(
      "ventas.pedido", { tabla: { columnas: ["codigo"] } }, "pendientes");
    expect(result.current.origen).toBe("usuario");
    expect(result.current.config).toEqual({ tabla: { columnas: ["codigo"] } });
  });

  test("si guardar falla, vuelve a la configuración anterior", async () => {
    getVista.mockResolvedValue({
      pantalla: "ventas.pedido", vista: "", config: { modo: "tabla" }, origen: "empresa",
    });
    guardarVista.mockRejectedValue({ estado: 500 });

    const { result } = renderHook(() => usePreferenciasVista("ventas.pedido"));
    await waitFor(() => expect(result.current.cargada).toBe(true));

    await act(() => result.current.guardar({ modo: "tarjetas" }));

    expect(result.current.config).toEqual({ modo: "tabla" });
    expect(result.current.origen).toBe("empresa");
  });
});
