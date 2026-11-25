import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ConfigVista, OrigenVista } from "./diseño.ts";

type VistaUsuarioApi = {
  pantalla: string;
  vista: string;
  config: ConfigVista | null;
  origen: OrigenVista;
};

const url = (pantalla: string, vista: string) =>
  `/comun/vista_usuario/${encodeURIComponent(pantalla)}` +
  (vista ? `?vista=${encodeURIComponent(vista)}` : "");

export const getVistaUsuario = (pantalla: string, vista = "") =>
  RestAPI.get<VistaUsuarioApi>(url(pantalla, vista));

export const guardarVistaUsuario = (
  pantalla: string,
  config: ConfigVista,
  vista = ""
) =>
  RestAPI.patch<{ config: ConfigVista }>(
    url(pantalla, vista),
    { config },
    "Error al guardar la vista"
  );

export const restaurarVistaUsuario = (pantalla: string, vista = "") =>
  RestAPI.delete(url(pantalla, vista), "Error al restaurar la vista");
