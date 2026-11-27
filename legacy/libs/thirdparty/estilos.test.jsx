import { render } from "@testing-library/react";
import { traducirReferencias } from "./estilos";
import { Button, CacheProvider, createCache, createTheme, makeStyles, ThemeProvider } from "./index";

const theme = createTheme({ palette: { primary: { main: "#123456" } } });
theme.custom = { menu: { main: "#abcdef" } };

const useStyles = makeStyles(t => ({
  raiz: { color: t.custom.menu.main, padding: t.spacing(2), "&$deshabilitado": { color: "lightgrey" } },
  boton: { backgroundColor: "#ff0000" },
}));

const Componente = () => {
  const classes = useStyles();
  return (
    <div className={classes.raiz} data-testid="raiz">
      <Button variant="contained" className={classes.boton}>b</Button>
    </div>
  );
};

describe("makeStyles sobre tss-react", () => {
  test("traduce referencias $regla de JSS", () => {
    expect(traducirReferencias({ a: { "&$b:hover": { "& $c": { x: 1 } } } }, { b: "B", c: "C" })).toEqual({
      a: { "&.B:hover": { "& .C": { x: 1 } } },
    });
  });

  test("aplica el tema, resuelve $regla y gana a los estilos de MUI", () => {
    const errores = vi.spyOn(console, "error");
    // Misma caché de MUI que crea core/App.jsx cuando la página no tiene punto de inserción
    const cacheMui = createCache({ key: "css", prepend: true });
    render(<CacheProvider value={cacheMui}><ThemeProvider theme={theme}><Componente /></ThemeProvider></CacheProvider>);
    const estilos = [...document.querySelectorAll("style")];
    const css = estilos.map(s => s.textContent).join("\n");
    expect(css).toMatch(/#abcdef/);
    expect(css).toMatch(/padding:\s*16px/);
    expect(css).toMatch(/\.qmk-[\w-]+-deshabilitado-ref/);
    // Las hojas de makeStyles (clave qmk) van detrás de las de MUI (clave css)
    const ultimaMui = estilos.map(s => s.dataset.emotion).lastIndexOf("css");
    const primeraQmk = estilos.map(s => s.dataset.emotion).indexOf("qmk");
    expect(primeraQmk).toBeGreaterThan(ultimaMui);
    expect(errores).not.toHaveBeenCalled();
  });
});
