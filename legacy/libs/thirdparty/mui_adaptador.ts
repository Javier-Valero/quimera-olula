import { unstable_extendSxProp as extendSxProp } from "@mui/system";

// Traducción de la API de @mui/material 7 que sigue usando el legacy a la de @mui/material 9.
// Funciones puras: `mui.ts` las aplica envolviendo cada componente exportado por thirdparty.

export type Props = Record<string, unknown>;

const esObjeto = (v: unknown): v is Props => typeof v === "object" && v !== null && !Array.isArray(v);

// prop eliminada -> clave dentro de slotProps
type MapaSlots = Record<string, string>;

export interface Reglas {
  slotProps?: MapaSlots;
  slots?: MapaSlots;
  // mueve las system props (m, p, display, justifyContent...) a `sx`, como hacía la v7
  sistema?: boolean;
  // props propias del componente que coinciden con una system prop y no deben ir a `sx`
  conservar?: string[];
}

const TRANSICIONES: Reglas = {
  slotProps: { TransitionProps: "transition" },
  slots: { TransitionComponent: "transition" },
};

export const REGLAS: Record<string, Reglas> = {
  Box: { sistema: true },
  Grid: { sistema: true },
  Typography: { sistema: true, conservar: ["color"] },
  Link: { sistema: true, conservar: ["color"] },
  DialogContentText: { sistema: true, conservar: ["color"] },
  TextField: {
    slotProps: {
      InputProps: "input",
      inputProps: "htmlInput",
      SelectProps: "select",
      InputLabelProps: "inputLabel",
      FormHelperTextProps: "formHelperText",
    },
  },
  Checkbox: { slotProps: { inputProps: "input" } },
  Radio: { slotProps: { inputProps: "input" } },
  Switch: { slotProps: { inputProps: "input" } },
  Avatar: { slotProps: { imgProps: "img" } },
  CardHeader: { slotProps: { titleTypographyProps: "title", subheaderTypographyProps: "subheader" } },
  Accordion: TRANSICIONES,
  Backdrop: TRANSICIONES,
  Dialog: {
    slotProps: { ...TRANSICIONES.slotProps, PaperProps: "paper", BackdropProps: "backdrop" },
    slots: { ...TRANSICIONES.slots, BackdropComponent: "backdrop" },
  },
  Drawer: { slotProps: { ...TRANSICIONES.slotProps, PaperProps: "paper" }, slots: TRANSICIONES.slots },
  Menu: { slotProps: { ...TRANSICIONES.slotProps, PaperProps: "paper" }, slots: TRANSICIONES.slots },
  Popover: { slotProps: { ...TRANSICIONES.slotProps, PaperProps: "paper" }, slots: TRANSICIONES.slots },
  Snackbar: {
    slotProps: { ...TRANSICIONES.slotProps, ContentProps: "content", ClickAwayListenerProps: "clickAwayListener" },
    slots: TRANSICIONES.slots,
  },
  Tooltip: {
    slotProps: { ...TRANSICIONES.slotProps, PopperProps: "popper" },
    slots: { ...TRANSICIONES.slots, PopperComponent: "popper" },
  },
};

// `components`/`componentsProps` (claves en PascalCase) -> `slots`/`slotProps` (camelCase)
const aCamel = (o: Props): Props =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v]));

const moverASlots = (props: Props, mapa: MapaSlots | undefined, destino: "slots" | "slotProps"): Props => {
  const antiguo = destino === "slots" ? "components" : "componentsProps";
  const legacy: Props = esObjeto(props[antiguo]) ? aCamel(props[antiguo] as Props) : {};
  const resto: Props = { ...props };
  delete resto[antiguo];

  Object.entries(mapa ?? {}).forEach(([prop, slot]) => {
    if (prop in resto) {
      if (resto[prop] !== undefined) legacy[slot] = resto[prop];
      delete resto[prop];
    }
  });
  if (!Object.keys(legacy).length) return resto;

  // Lo que ya venga en la API nueva tiene prioridad (p. ej. los `params.slotProps` de Autocomplete)
  const actual = esObjeto(resto[destino]) ? (resto[destino] as Props) : {};
  const combinado: Props = { ...actual };
  Object.entries(legacy).forEach(([slot, valor]) => {
    combinado[slot] =
      destino === "slotProps" && esObjeto(valor) && esObjeto(actual[slot])
        ? { ...valor, ...(actual[slot] as Props) }
        : slot in actual
          ? actual[slot]
          : valor;
  });
  return { ...resto, [destino]: combinado };
};

const esColumna = (d: unknown): boolean =>
  typeof d === "string"
    ? d.startsWith("column")
    : Array.isArray(d)
      ? d.some(esColumna)
      : esObjeto(d) && Object.values(d).some(esColumna);

const moverSistemaASx = (props: Props, conservar: string[] = []): Props => {
  const guardadas: Props = {};
  const entrada: Props = { ...props };
  conservar.forEach(p => {
    if (p in entrada) {
      guardadas[p] = entrada[p];
      delete entrada[p];
    }
  });
  const resultado = extendSxProp(entrada) as Props;
  // extendSxProp siempre añade `sx`; si no había nada que mover se deja como estaba
  if (!("sx" in props) && esObjeto(resultado.sx) && !Object.keys(resultado.sx).length) delete resultado.sx;
  return { ...resultado, ...guardadas };
};

export const adaptarProps = (componente: string, props: Props): Props => {
  const reglas = REGLAS[componente];
  if (!reglas) return props;

  let resultado = props;
  if (reglas.sistema) resultado = moverSistemaASx(resultado, reglas.conservar);

  // Grid 9 solo admite direction row/row-reverse; la v7 aplicaba flex-direction también en columna
  if (componente === "Grid" && esColumna(resultado.direction)) {
    const { direction, ...resto } = resultado;
    const sx = resto.sx;
    const flex = { flexDirection: direction };
    resultado = {
      ...resto,
      sx: Array.isArray(sx) ? [flex, ...sx] : esObjeto(sx) ? { ...flex, ...sx } : sx ? [flex, sx] : flex,
    };
  }

  resultado = moverASlots(resultado, reglas.slotProps, "slotProps");
  resultado = moverASlots(resultado, reglas.slots, "slots");

  // `inputRef` de Checkbox/Radio/Switch pasa a `slotProps.input.ref`
  if (["Checkbox", "Radio", "Switch"].includes(componente) && "inputRef" in resultado) {
    const { inputRef, ...resto } = resultado;
    const slotProps = esObjeto(resto.slotProps) ? resto.slotProps : {};
    const input = esObjeto(slotProps.input) ? slotProps.input : {};
    resultado = { ...resto, slotProps: { ...slotProps, input: { ref: inputRef, ...input } } };
  }

  // Dialog/Modal 9 eliminan `disableEscapeKeyDown`: se filtra el cierre por Escape en onClose
  if (componente === "Dialog" && "disableEscapeKeyDown" in resultado) {
    const { disableEscapeKeyDown, onClose, ...resto } = resultado;
    resultado = resto;
    if (typeof onClose === "function") {
      resultado.onClose = (evento: unknown, motivo: string) => {
        if (disableEscapeKeyDown && motivo === "escapeKeyDown") return;
        (onClose as (e: unknown, m: string) => void)(evento, motivo);
      };
    }
  }

  return resultado;
};
