import {
  Accordion as MuiAccordion,
  Avatar as MuiAvatar,
  Backdrop as MuiBackdrop,
  Box as MuiBox,
  CardHeader as MuiCardHeader,
  Checkbox as MuiCheckbox,
  Dialog as MuiDialog,
  DialogContentText as MuiDialogContentText,
  Drawer as MuiDrawer,
  Grid as MuiGrid,
  Link as MuiLink,
  Menu as MuiMenu,
  Popover as MuiPopover,
  Radio as MuiRadio,
  Snackbar as MuiSnackbar,
  Switch as MuiSwitch,
  TextField as MuiTextField,
  Tooltip as MuiTooltip,
  Typography as MuiTypography,
} from "@mui/material";
import { type ComponentType, createElement } from "react";
import { adaptarProps, type Props } from "./mui_adaptador";

type ComponenteMui = ComponentType<never> & { muiName?: string };

// Envuelve un componente de MUI 9 para que acepte la API de MUI 7 que usa el legacy.
// En React 19 `ref` llega como prop normal, así que no hace falta forwardRef.
const adaptar = (nombre: string, Componente: ComponenteMui) => {
  const Adaptado = (props: Props) => createElement(Componente, adaptarProps(nombre, props) as never);
  Adaptado.displayName = `Adaptado(${nombre})`;
  // MUI identifica algunos hijos por `muiName` (p. ej. Grid anidado dentro de Grid container)
  if (Componente.muiName) (Adaptado as { muiName?: string }).muiName = Componente.muiName;
  return Adaptado;
};

export const Accordion = adaptar("Accordion", MuiAccordion as ComponenteMui);
export const Avatar = adaptar("Avatar", MuiAvatar as ComponenteMui);
export const Backdrop = adaptar("Backdrop", MuiBackdrop as ComponenteMui);
export const Box = adaptar("Box", MuiBox as ComponenteMui);
export const CardHeader = adaptar("CardHeader", MuiCardHeader as ComponenteMui);
export const Checkbox = adaptar("Checkbox", MuiCheckbox as ComponenteMui);
export const Dialog = adaptar("Dialog", MuiDialog as ComponenteMui);
export const DialogContentText = adaptar("DialogContentText", MuiDialogContentText as ComponenteMui);
export const Drawer = adaptar("Drawer", MuiDrawer as ComponenteMui);
export const Grid = adaptar("Grid", MuiGrid as ComponenteMui);
export const Link = adaptar("Link", MuiLink as ComponenteMui);
export const Menu = adaptar("Menu", MuiMenu as ComponenteMui);
export const Popover = adaptar("Popover", MuiPopover as ComponenteMui);
export const Radio = adaptar("Radio", MuiRadio as ComponenteMui);
export const Snackbar = adaptar("Snackbar", MuiSnackbar as ComponenteMui);
export const Switch = adaptar("Switch", MuiSwitch as ComponenteMui);
export const TextField = adaptar("TextField", MuiTextField as ComponenteMui);
export const Tooltip = adaptar("Tooltip", MuiTooltip as ComponenteMui);
export const Typography = adaptar("Typography", MuiTypography as ComponenteMui);
