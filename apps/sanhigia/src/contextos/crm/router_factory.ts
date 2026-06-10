// import { MaestroConDetalleIncidencia } from "./incidencia/maestro/MaestroConDetalleIncidencia.tsx";
import { MaestroIncidencias } from "./incidencia_copy/maestro/MaestroIncidencias.tsx";

export class RouterFactoryCrmSanhigia {
    static router = {
        // "crm/incidencia": MaestroConDetalleIncidencia,
        "crm/incidencia": MaestroIncidencias,
    };
}
