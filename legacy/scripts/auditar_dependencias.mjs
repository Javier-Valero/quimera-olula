// Falla si `pnpm audit` encuentra avisos de gravedad alta o crítica en dependencias del legacy.
// Se limita a las rutas `legacy/...` porque el resto del monorepo tiene su propio ciclo de
// actualización; un `pnpm audit` global fallaría por avisos ajenos a este código.
//
// Uso: pnpm run audit:legacy   (o `node legacy/scripts/auditar_dependencias.mjs --nivel moderate`)

import { execFileSync } from "node:child_process";

const NIVELES = ["low", "moderate", "high", "critical"];
const indice = process.argv.indexOf("--nivel");
const nivelMinimo = indice > -1 ? process.argv[indice + 1] : "high";
if (!NIVELES.includes(nivelMinimo)) {
  console.error(`Nivel no válido: ${nivelMinimo}. Usa uno de: ${NIVELES.join(", ")}`);
  process.exit(2);
}

let salida;
try {
  salida = execFileSync("pnpm", ["audit", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (error) {
  // pnpm audit sale con código distinto de 0 cuando hay avisos; el JSON viene igualmente
  salida = error.stdout;
  if (!salida) {
    console.error("No se pudo ejecutar pnpm audit:", error.message);
    process.exit(2);
  }
}

const informe = JSON.parse(salida);
const avisos = Object.values(informe.advisories ?? {})
  .filter(a => NIVELES.indexOf(a.severity) >= NIVELES.indexOf(nivelMinimo))
  .map(a => ({
    gravedad: a.severity,
    paquete: a.module_name,
    versiones: a.vulnerable_versions,
    titulo: a.title,
    url: a.url,
    rutas: [...new Set(a.findings.flatMap(f => f.paths))].filter(r => r.startsWith("legacy")),
  }))
  .filter(a => a.rutas.length);

if (!avisos.length) {
  console.log(`Sin avisos de nivel ${nivelMinimo} o superior en las dependencias de legacy/.`);
  process.exit(0);
}

console.error(`${avisos.length} aviso(s) de nivel ${nivelMinimo} o superior en legacy/:\n`);
for (const a of avisos) {
  console.error(`- [${a.gravedad}] ${a.paquete} ${a.versiones}: ${a.titulo}`);
  console.error(`  ${a.url}`);
  a.rutas.slice(0, 3).forEach(r => console.error(`  via ${r.replaceAll("__", "/")}`));
}
console.error("\nActualiza la librería en legacy/libs/thirdparty (o donde se declare) y adapta el control.");
process.exit(1);
