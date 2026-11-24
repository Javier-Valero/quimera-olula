export type Posicion = {
    latitud: number;
    longitud: number;
};

const pedirPosicion = (opciones: PositionOptions): Promise<Posicion | null> =>
    new Promise((resolver) => {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => resolver({ latitud: coords.latitude, longitud: coords.longitude }),
            () => resolver(null),
            opciones
        );
    });

// Primero con alta precisión (GPS); si falla o se agota el tiempo (habitual en un ordenador sin GPS),
// otra vez sin alta precisión y aceptando una posición de hasta 5 minutos, que basta para distancias.
export const posicionActual = async (espera = 10000): Promise<Posicion | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return null;
    return (
        (await pedirPosicion({ enableHighAccuracy: true, timeout: espera, maximumAge: 60000 })) ??
        (await pedirPosicion({ enableHighAccuracy: false, timeout: espera, maximumAge: 300000 }))
    );
};

export const distanciaKm = (desde: Posicion, latitud: number | null, longitud: number | null): number | null => {
    if (latitud === null || longitud === null) return null;
    const radianes = (grados: number) => (grados * Math.PI) / 180;
    const dLat = radianes(latitud - desde.latitud);
    const dLon = radianes(longitud - desde.longitud);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radianes(desde.latitud)) * Math.cos(radianes(latitud)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
