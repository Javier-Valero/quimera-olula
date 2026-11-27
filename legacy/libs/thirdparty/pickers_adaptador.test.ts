import { adaptarPropsPicker, normalizarValor } from "./pickers_adaptador";

describe("adaptador de pickers", () => {
  test("normaliza timestamps y cadenas a Date", () => {
    expect(normalizarValor(Date.UTC(2026, 0, 2))).toEqual(new Date(Date.UTC(2026, 0, 2)));
    expect(normalizarValor("2026-01-02")).toBeInstanceOf(Date);
    expect(normalizarValor(null)).toBeNull();
    expect(normalizarValor("")).toBeNull();
  });

  test("traduce las props de MUI v4 que usa DateField", () => {
    const onBlur = () => {};
    const props = adaptarPropsPicker({
      value: 0, format: "dd/MM/yyyy", onChange: () => {}, id: "fecha", error: true, onBlur,
      cancelLabel: "CANCELAR", clearLabel: "BORRAR", okLabel: "ACEPTAR", clearable: true,
      margin: "dense", autoOk: true, KeyboardButtonProps: { size: "small" }, invalidDateMessage: "x",
    });
    expect(props.value).toEqual(new Date(0));
    expect(props.format).toBe("dd/MM/yyyy");
    expect(props.closeOnSelect).toBe(true);
    expect(props.localeText).toEqual({ okButtonLabel: "ACEPTAR", cancelButtonLabel: "CANCELAR", clearButtonLabel: "BORRAR" });
    expect(props.slotProps).toEqual({
      textField: { id: "fecha", error: true, onBlur, margin: "dense" },
      actionBar: { actions: ["clear", "cancel", "accept"] },
    });
    ["cancelLabel", "clearable", "margin", "KeyboardButtonProps", "invalidDateMessage", "id", "error"].forEach(p =>
      expect(props).not.toHaveProperty(p));
  });

  test("respeta slotProps.textField explícitos (datePickerProps de monterelax)", () => {
    const props = adaptarPropsPicker({ margin: "dense", slotProps: { textField: { variant: "standard" } } });
    expect(props.slotProps).toEqual({ textField: { margin: "dense", variant: "standard" } });
  });
});
