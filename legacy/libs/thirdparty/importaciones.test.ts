// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Control permanente: las librerías externas que envuelve @quimera/thirdparty solo se importan
// desde thirdparty. Así los adaptadores (MUI 7 -> 9, chart.js 2 -> 4, pickers, Plot seguro...)
// no se pueden saltar y una actualización futura se hace en un único sitio.
// El ESLint del monorepo solo revisa .ts/.tsx y el legacy es sobre todo .js/.jsx, por eso es un test.

const RAIZ_LEGACY = fileURLToPath(new URL("../..", import.meta.url));

const PROHIBIDAS = [
  /^@mui\//,
  /^@emotion\//,
  /^@hello-pangea\/dnd$/,
  /^react-beautiful-dnd$/,
  /^react-plotly\.js/,
  /^plotly\.js/,
  /^chart\.js/,
  /^chartjs-plugin-annotation$/,
  /^react-i18next$/,
  /^date-fns/,
  /^react-infinite-scroll-component$/,
  /^react-number-format$/,
  /^react-signature-canvas$/,
  /^react-swipeable-list$/,
  /^d3$/,
  /^clsx$/,
  /^tss-react/,
  /^jquery$/,
];

// Excepciones documentadas (rutas relativas a legacy/)
const EXCEPCIONES = [
  // thirdparty es quien envuelve las librerías
  "libs/thirdparty/",
  // elganso sigue en @mui/material 7 con sus propias dependencias: @aldabil/react-scheduler 3.1.2
  // (última versión) exige @mui/x-date-pickers 7, que solo admite @mui/material 7
  "extensions/elganso/",
];

const EXTENSIONES = /\.(js|jsx|ts|tsx)$/;
const IMPORT = /^\s*(?:import\s[^;]*?from\s*|import\s*|export\s[^;]*?from\s*)["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/gm;

const ficheros = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (["node_modules", "dist", "build"].includes(e.name) || e.name.startsWith(".")) return [];
    const ruta = join(dir, e.name);
    return e.isDirectory() ? ficheros(ruta) : EXTENSIONES.test(e.name) ? [ruta] : [];
  });

test("las librerías envueltas solo se importan desde @quimera/thirdparty", () => {
  const infracciones: string[] = [];
  ["extensions", "libs", "apps"].forEach(carpeta => {
    ficheros(join(RAIZ_LEGACY, carpeta)).forEach(fichero => {
      const rel = relative(RAIZ_LEGACY, fichero).split("\\").join("/");
      if (EXCEPCIONES.some(e => rel.startsWith(e))) return;
      const codigo = readFileSync(fichero, "utf8");
      for (const m of codigo.matchAll(IMPORT)) {
        const modulo = m[1] ?? m[2];
        if (PROHIBIDAS.some(p => p.test(modulo))) infracciones.push(`${rel}: ${modulo}`);
      }
    });
  });
  expect(infracciones, "Importa estas librerías desde @quimera/thirdparty").toEqual([]);
});
