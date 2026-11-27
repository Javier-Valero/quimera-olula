import { adaptarProps } from "./mui_adaptador";

describe("adaptador MUI 7 -> 9", () => {
  test("Box: system props a sx, conservando el resto", () => {
    const props = adaptarProps("Box", { display: "flex", mt: 2, className: "c", sx: { color: "red" } });
    expect(props.className).toBe("c");
    expect(props).not.toHaveProperty("display");
    expect(props).not.toHaveProperty("mt");
    expect(props.sx).toEqual({ display: "flex", mt: 2, color: "red" });
  });

  test("Box sin system props no cambia", () => {
    expect(adaptarProps("Box", { className: "c" })).toEqual({ className: "c" });
  });

  test("Typography conserva su prop color y mueve el resto", () => {
    const props = adaptarProps("Typography", { color: "primary", fontWeight: "bold", variant: "h6" });
    expect(props.color).toBe("primary");
    expect(props.variant).toBe("h6");
    expect(props.sx).toEqual({ fontWeight: "bold" });
  });

  test("Grid direction column pasa a sx.flexDirection", () => {
    const props = adaptarProps("Grid", { container: true, direction: "column", spacing: 2 });
    expect(props).not.toHaveProperty("direction");
    expect(props.spacing).toBe(2);
    expect(props.sx).toEqual({ flexDirection: "column" });
    expect(adaptarProps("Grid", { container: true, direction: "row" }).direction).toBe("row");
  });

  test("TextField: props antiguas a slotProps sin pisar las nuevas", () => {
    const props = adaptarProps("TextField", {
      InputProps: { startAdornment: null, endAdornment: null, readOnly: true },
      inputProps: { maxLength: 30 },
      slotProps: { input: { endAdornment: "flecha" } },
    });
    expect(props).not.toHaveProperty("InputProps");
    expect(props).not.toHaveProperty("inputProps");
    expect(props.slotProps).toEqual({
      input: { startAdornment: null, endAdornment: "flecha", readOnly: true },
      htmlInput: { maxLength: 30 },
    });
  });

  test("Dialog: transición, paper y disableEscapeKeyDown", () => {
    const cerrar = vi.fn();
    const Transicion = () => null;
    const props = adaptarProps("Dialog", {
      TransitionComponent: Transicion,
      TransitionProps: { timeout: 600 },
      PaperProps: { elevation: 3 },
      disableEscapeKeyDown: true,
      onClose: cerrar,
    });
    expect(props.slots).toEqual({ transition: Transicion });
    expect(props.slotProps).toEqual({ transition: { timeout: 600 }, paper: { elevation: 3 } });
    (props.onClose as (e: unknown, m: string) => void)({}, "escapeKeyDown");
    expect(cerrar).not.toHaveBeenCalled();
    (props.onClose as (e: unknown, m: string) => void)({}, "backdropClick");
    expect(cerrar).toHaveBeenCalledWith({}, "backdropClick");
  });

  test("Checkbox: inputRef e inputProps a slotProps.input", () => {
    const ref = { current: null };
    const props = adaptarProps("Checkbox", { inputRef: ref, inputProps: { "aria-label": "x" } });
    expect(props.slotProps).toEqual({ input: { ref, "aria-label": "x" } });
  });

  test("componentsProps -> slotProps en camelCase", () => {
    const props = adaptarProps("Tooltip", { componentsProps: { Tooltip: { className: "t" } }, PopperProps: { disablePortal: true } });
    expect(props.slotProps).toEqual({ tooltip: { className: "t" }, popper: { disablePortal: true } });
  });

  test("componente sin reglas no cambia", () => {
    const props = { a: 1 };
    expect(adaptarProps("Button", props)).toBe(props);
  });
});
