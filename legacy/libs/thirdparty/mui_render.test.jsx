import { render, fireEvent } from "@testing-library/react";
import { Box, Dialog, Grid, TextField, Typography, Autocomplete, Slide } from "./index";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { forwardRef } from "react";

const Transicion = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

test("los componentes adaptados renderizan con la API de MUI 7 sin errores", () => {
  const errores = vi.spyOn(console, "error");
  const { container, getByRole } = render(
    <ThemeProvider theme={createTheme()}>
      <Box id="b" display="flex" justifyContent="space-between" mt={2}>x</Box>
      <Typography id="t" color="primary" fontWeight="bold">t</Typography>
      <Grid container direction="column" spacing={1}>
        <Grid size={6} id="g">a</Grid>
      </Grid>
      <TextField id="tf" variant="standard" inputProps={{ maxLength: 30 }} InputProps={{ readOnly: true }} />
      <Autocomplete id="ac" options={["uno", "dos"]}
        renderInput={params => (
          <TextField {...params} label="Busca" InputProps={{ startAdornment: null, endAdornment: null }} />
        )} />
      <Dialog open TransitionComponent={Transicion} PaperProps={{ id: "papel" }}><div>d</div></Dialog>
    </ThemeProvider>,
  );
  const css = [...document.querySelectorAll("style")].map(s => s.textContent).join("\n");
  expect(css).toMatch(/display:\s*flex/);
  expect(css).toMatch(/justify-content:\s*space-between/);
  expect(css).toMatch(/flex-direction:\s*column/);
  expect(css).toMatch(/font-weight:\s*(bold|700)/);
  const tf = container.querySelector("#tf");
  expect(tf.getAttribute("maxlength")).toBe("30");
  expect(tf.hasAttribute("readonly")).toBe(true);
  expect(document.querySelector("#papel")).not.toBeNull();
  // Autocomplete sigue funcionando (abre la lista y conserva su botón de desplegar)
  const ac = document.querySelector("#ac");
  fireEvent.mouseDown(ac);
  expect(getByRole("listbox")).toBeTruthy();
  expect(document.querySelector(".MuiAutocomplete-popupIndicator")).not.toBeNull();
  expect(errores).not.toHaveBeenCalled();
});
