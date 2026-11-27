type Props = Record<string, unknown>;

const esObjeto = (v: unknown): v is Props => typeof v === "object" && v !== null && !Array.isArray(v);

// Props de MUI v4 (`KeyboardDatePicker`) que siguen pasando DateField/TimeField y que
// @mui/x-date-pickers 9 ya no entiende: se traducen o se descartan
const OBSOLETAS = [
  "cancelLabel",
  "clearLabel",
  "okLabel",
  "clearable",
  "autoOk",
  "margin",
  "inputVariant",
  "KeyboardButtonProps",
  "keyboardIcon",
  "invalidDateMessage",
];

// Props que en v4 iban al TextField y ahora van en `slotProps.textField`
const DEL_TEXTFIELD = ["id", "error", "helperText", "onFocus", "onBlur", "required", "fullWidth", "variant", "placeholder"];

// pickers 9 solo acepta Date | null; el legacy pasa timestamps (Date.parse) o cadenas ISO
export const normalizarValor = (valor: unknown): Date | null => {
  if (valor === null || valor === undefined || valor === "") return null;
  if (valor instanceof Date) return valor;
  if (typeof valor === "number" || typeof valor === "string") return new Date(valor);
  return null;
};

export const adaptarPropsPicker = (props: Props): Props => {
  const adaptadas: Props = {};
  const textField: Props = {};

  Object.entries(props).forEach(([clave, valor]) => {
    if (OBSOLETAS.includes(clave)) return;
    if (DEL_TEXTFIELD.includes(clave)) {
      if (valor !== undefined) textField[clave] = valor;
      return;
    }
    adaptadas[clave] = valor;
  });

  if ("value" in props) adaptadas.value = normalizarValor(props.value);
  if (props.autoOk !== undefined && props.closeOnSelect === undefined) {
    adaptadas.closeOnSelect = Boolean(props.autoOk);
  }
  if (props.margin !== undefined) textField.margin = props.margin;
  if (props.inputVariant !== undefined && textField.variant === undefined) {
    textField.variant = props.inputVariant;
  }

  const localeText: Props = {
    ...(props.okLabel ? { okButtonLabel: props.okLabel } : {}),
    ...(props.cancelLabel ? { cancelButtonLabel: props.cancelLabel } : {}),
    ...(props.clearLabel ? { clearButtonLabel: props.clearLabel } : {}),
    ...(esObjeto(props.localeText) ? props.localeText : {}),
  };
  if (Object.keys(localeText).length) adaptadas.localeText = localeText;

  const slotProps = esObjeto(props.slotProps) ? props.slotProps : {};
  const actionBar = esObjeto(slotProps.actionBar) ? slotProps.actionBar : {};
  adaptadas.slotProps = {
    ...slotProps,
    textField: { ...textField, ...(esObjeto(slotProps.textField) ? slotProps.textField : {}) },
    ...(props.clearable && !actionBar.actions
      ? { actionBar: { ...actionBar, actions: ["clear", "cancel", "accept"] } }
      : {}),
  };

  return adaptadas;
};
