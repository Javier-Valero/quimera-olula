import createCache from "@emotion/cache";
import { useTheme } from "@mui/material/styles";
import { createMakeAndWithStyles } from "tss-react";

// Sustituto de `makeStyles` de @mui/styles (deprecado, sin versiones nuevas) sobre tss-react,
// con la misma firma que usa el legacy: `const useStyles = makeStyles(theme => ({...}))` y
// `const classes = useStyles()`.

type Estilos = Record<string, unknown>;
type Theme = ReturnType<typeof useTheme>;
type DefinicionEstilos = Estilos | ((theme: Theme) => Estilos);

// Caché propia sin insertionPoint: sus <style> se añaden al final del <head>, detrás de los de
// MUI, igual que hacía JSS. Así los estilos de makeStyles siguen ganando a los de los componentes.
const cacheMakeStyles = createCache({ key: "qmk", prepend: false });

const { makeStyles: tssMakeStyles } = createMakeAndWithStyles({ useTheme, cache: cacheMakeStyles });

const esObjeto = (v: unknown): v is Estilos => typeof v === "object" && v !== null && !Array.isArray(v);

// JSS permitía referenciar otra regla con `$nombre` ("&$disabled"); en tss-react es `.${classes.nombre}`
export const traducirReferencias = (estilos: Estilos, clases: Record<string, string>): Estilos =>
  Object.fromEntries(
    Object.entries(estilos).map(([clave, valor]) => [
      clave.replace(/\$([A-Za-z_][\w-]*)/g, (_, nombre: string) => `.${clases[nombre]}`),
      esObjeto(valor) ? traducirReferencias(valor, clases) : valor,
    ]),
  );

export const makeStyles = (definicion: DefinicionEstilos, opciones: { name?: string } = {}) => {
  const useTss = tssMakeStyles({ name: opciones.name })((theme, _params, clases) =>
    traducirReferencias(
      typeof definicion === "function" ? definicion(theme) : definicion,
      clases as Record<string, string>,
    ) as never,
  );
  // El legacy llama a useStyles() o useStyles(props); los estilos no dependen de props
  return (_props?: unknown) => useTss().classes as Record<string, string>;
};
