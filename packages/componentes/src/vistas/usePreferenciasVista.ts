import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { tokenAcceso } from "@olula/lib/api/token_acceso.ts";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { ConfigVista, OrigenVista } from "./diseño.ts";
import {
  getVistaUsuario,
  guardarVistaUsuario,
  restaurarVistaUsuario,
} from "./infraestructura.ts";

type Estado = {
  config?: ConfigVista;
  origen: OrigenVista;
  /** El servidor respondió: se puede personalizar. */
  disponible: boolean;
  cargada: boolean;
};

const PENDIENTE: Estado = { origen: null, disponible: false, cargada: false };
const FIJA: Estado = { origen: null, disponible: false, cargada: true };

// Una sola copia por pantalla y vista, compartida por todos los componentes que
// la usan (el listado y el detalle de una misma pantalla guardan en la misma
// fila: con copias separadas, guardar desde uno pisaría lo del otro).
const estados = new Map<string, Estado>();
const oyentes = new Map<string, Set<() => void>>();
const cargas = new Map<string, Promise<void>>();

const claveDe = (pantalla: string, vista: string) => `${pantalla}:${vista}`;

const fijar = (clave: string, estado: Estado) => {
  estados.set(clave, estado);
  oyentes.get(clave)?.forEach((avisar) => avisar());
};

const cargar = (pantalla: string, vista: string): Promise<void> => {
  const clave = claveDe(pantalla, vista);
  const enCurso = cargas.get(clave);
  if (enCurso) return enCurso;
  const carga = getVistaUsuario(pantalla, vista)
    .then((respuesta) =>
      fijar(clave, {
        config: respuesta.config ?? undefined,
        origen: respuesta.origen,
        disponible: true,
        cargada: true,
      })
    )
    .catch(() => fijar(clave, { origen: null, disponible: false, cargada: true }))
    .finally(() => cargas.delete(clave));
  cargas.set(clave, carga);
  return carga;
};

/** Olvida lo cargado (tests, cambio de usuario). */
export const olvidarPreferenciasVista = () => {
  estados.clear();
  cargas.clear();
};

// Al cerrar sesión (no al refrescar el token) se olvida la del usuario anterior.
window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, () => {
  if (!tokenAcceso.obtener()) olvidarPreferenciasVista();
});

/**
 * Configuración de vista que ve el usuario en `pantalla`: la suya, si no la de
 * la empresa y si no ninguna (`config` undefined: el componente usa la del
 * código). Si el servidor no responde no se ofrece personalizar. Sin
 * `pantalla` la vista es fija: no se pide nada.
 */
export const usePreferenciasVista = (pantalla: string | undefined, vista = "") => {
  const clave = pantalla ? claveDe(pantalla, vista) : undefined;

  const suscribir = useCallback(
    (avisar: () => void) => {
      if (!clave) return () => undefined;
      const conjunto = oyentes.get(clave) ?? new Set();
      conjunto.add(avisar);
      oyentes.set(clave, conjunto);
      return () => conjunto.delete(avisar);
    },
    [clave]
  );
  const estado = useSyncExternalStore(suscribir, () =>
    clave ? (estados.get(clave) ?? PENDIENTE) : FIJA
  );

  useEffect(() => {
    if (pantalla && clave && !estados.has(clave)) void cargar(pantalla, vista);
  }, [pantalla, vista, clave]);

  // Optimista: la vista cambia al momento y vuelve atrás si el servidor falla
  // (salvo que entretanto haya cambiado otra vez).
  const guardar = useCallback(
    async (nueva: ConfigVista) => {
      if (!pantalla || !clave) return;
      const anterior = estados.get(clave) ?? PENDIENTE;
      const optimista: Estado = { ...anterior, config: nueva, origen: "usuario" };
      fijar(clave, optimista);
      try {
        await guardarVistaUsuario(pantalla, nueva, vista);
      } catch {
        if (estados.get(clave) === optimista) fijar(clave, anterior);
      }
    },
    [pantalla, vista, clave]
  );

  const restaurar = useCallback(async () => {
    if (!pantalla || !clave) return;
    await restaurarVistaUsuario(pantalla, vista);
    estados.delete(clave);
    await cargar(pantalla, vista);
  }, [pantalla, vista, clave]);

  /** Guarda lo que queda tras quitar una parte, o borra la fila si no queda nada. */
  const quitar = useCallback(
    (resto: ConfigVista | undefined) => (resto ? guardar(resto) : restaurar()),
    [guardar, restaurar]
  );

  return {
    config: estado.config,
    origen: estado.origen,
    /** Hay configuración propia o de empresa (para el aviso «vista personalizada»). */
    personalizada: estado.origen !== null,
    personalizable: !!pantalla && estado.disponible,
    /** Ya se sabe qué config aplicar: evita pintar la del código y cambiarla. */
    cargada: estado.cargada,
    guardar,
    restaurar,
    quitar,
  };
};
