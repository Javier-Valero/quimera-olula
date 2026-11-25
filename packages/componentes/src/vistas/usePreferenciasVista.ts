import { useCallback, useEffect, useState } from "react";
import { ConfigVista, OrigenVista } from "./diseño.ts";
import {
  getVistaUsuario,
  guardarVistaUsuario,
  restaurarVistaUsuario,
} from "./infraestructura.ts";

/**
 * Configuración de vista que ve el usuario en `pantalla`: la suya, si no la de
 * la empresa y si no ninguna (`config` undefined: el componente usa la del
 * código). Si el servidor no responde no se ofrece personalizar. Sin
 * `pantalla` la vista es fija: no se pide nada.
 */
export const usePreferenciasVista = (pantalla: string | undefined, vista = "") => {
  const [config, setConfig] = useState<ConfigVista | undefined>(undefined);
  const [origen, setOrigen] = useState<OrigenVista>(null);
  const [disponible, setDisponible] = useState(false);
  const [cargada, setCargada] = useState(!pantalla);

  useEffect(() => {
    if (!pantalla) return;
    let cancelado = false;
    getVistaUsuario(pantalla, vista)
      .then((respuesta) => {
        if (cancelado) return;
        setConfig(respuesta.config ?? undefined);
        setOrigen(respuesta.origen);
        setDisponible(true);
      })
      .catch(() => !cancelado && setDisponible(false))
      .finally(() => !cancelado && setCargada(true));
    return () => {
      cancelado = true;
    };
  }, [pantalla, vista]);

  const guardar = useCallback(
    async (nueva: ConfigVista) => {
      if (!pantalla) return;
      await guardarVistaUsuario(pantalla, nueva, vista);
      setConfig(nueva);
      setOrigen("usuario");
    },
    [pantalla, vista]
  );

  const restaurar = useCallback(async () => {
    if (!pantalla) return;
    await restaurarVistaUsuario(pantalla, vista);
    const respuesta = await getVistaUsuario(pantalla, vista);
    setConfig(respuesta.config ?? undefined);
    setOrigen(respuesta.origen);
  }, [pantalla, vista]);

  return {
    config,
    origen,
    /** Hay configuración propia o de empresa (para el aviso «vista personalizada»). */
    personalizada: origen !== null,
    personalizable: !!pantalla && disponible,
    /** Ya se sabe qué config aplicar: evita pintar la del código y cambiarla. */
    cargada,
    guardar,
    restaurar,
  };
};
