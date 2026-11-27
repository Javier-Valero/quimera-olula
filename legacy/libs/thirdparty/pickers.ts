import {
  DatePicker as MuiDatePicker,
  DateTimePicker as MuiDateTimePicker,
  TimePicker as MuiTimePicker,
} from "@mui/x-date-pickers";
import { type ComponentType, createElement } from "react";
import { adaptarPropsPicker } from "./pickers_adaptador";

type Props = Record<string, unknown>;

const adaptar = (Picker: ComponentType<never>) => {
  const Adaptado = (props: Props) => createElement(Picker, adaptarPropsPicker(props) as never);
  Adaptado.displayName = `Adaptado(${Picker.displayName ?? Picker.name ?? "Picker"})`;
  return Adaptado;
};

export const DatePicker = adaptar(MuiDatePicker as ComponentType<never>);
export const DateTimePicker = adaptar(MuiDateTimePicker as ComponentType<never>);
export const TimePicker = adaptar(MuiTimePicker as ComponentType<never>);
