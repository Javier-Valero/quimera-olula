import { AccionesCabeceraMonterelax } from "./componentes/AccionesCabeceraMonterelax.tsx";
import { FactoryAuthMonterelax } from "./contextos/auth/factory.ts";
import { FactoryVentasLegacy } from "./contextos/ventas/factory.ts";

class FactoryComponentesMonterelax {
    static cabecera_acciones = AccionesCabeceraMonterelax;
}

export class FactoryLegacy {
    Auth = FactoryAuthMonterelax;
    Componentes = FactoryComponentesMonterelax;
    Ventas = FactoryVentasLegacy;
}

export default FactoryLegacy;
