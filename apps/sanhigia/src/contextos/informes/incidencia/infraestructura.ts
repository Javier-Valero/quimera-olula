import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { FiltroInformeIncidencias, GetInformeIncidencias } from "./diseño.ts";

const baseUrl = "/crm/incidencia-informe";

export const getInformeIncidencias: GetInformeIncidencias = async (filtro: FiltroInformeIncidencias) => {
    const params = new URLSearchParams();
    if (filtro.agenteId) params.set("agente_id", filtro.agenteId);
    if (filtro.fechaDesde) params.set("fecha_desde", filtro.fechaDesde);
    if (filtro.fechaHasta) params.set("fecha_hasta", filtro.fechaHasta);

    const qs = params.toString();
    const url = qs ? `${baseUrl}?${qs}` : baseUrl;

    return RestAPI.blob(url, "Error al generar el informe de incidencias");
};
