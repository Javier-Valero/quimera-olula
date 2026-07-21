export type FiltroInformeIncidencias = {
    agenteId: string;
    fechaDesde: string;
    fechaHasta: string;
};

export type GetInformeIncidencias = (filtro: FiltroInformeIncidencias) => Promise<Blob>;
