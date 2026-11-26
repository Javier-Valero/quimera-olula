import { useCallback, useEffect, useState } from "react";
import { ConfigVista, VistaCompartida } from "./diseño.ts";
import {
  borrarVistaCompartida,
  getGrupos,
  getVistasCompartidas,
  guardarVistaCompartida,
} from "./infraestructura.ts";

/** Regla que permite compartir vistas con la empresa o con un grupo. */
export const REGLA_VISTA_COMPARTIDA = "comun.vista_compartida";

type Grupo = { id: string; nombre: string };

/**
 * Parte del panel «Personalizar pantalla» para quien administra las vistas:
 * compartir la vista que ve ahora con toda la empresa o con un grupo (los
 * demás la ven como punto de partida, encima pueden personalizar lo suyo),
 * quitar lo compartido y bloquear la personalización de la pantalla.
 */
export const SeccionCompartir = ({
  pantalla,
  vista,
  nombreVista,
  paraCompartir,
  onCambio,
}: {
  pantalla: string;
  /** Vista activa ('' = la de por defecto). */
  vista: string;
  nombreVista: string;
  /** La configuración que se comparte (la de ahora). */
  paraCompartir: () => ConfigVista;
  /** Lo compartido cambió: lo que ve el usuario puede ser otro. */
  onCambio: () => void;
}) => {
  const [compartidas, setCompartidas] = useState<VistaCompartida[] | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [destino, setDestino] = useState("");
  const [error, setError] = useState<string | null>(null);

  // `puede` deja pasar las reglas que no conoce: quien decide es el servidor.
  // Si no deja leer lo compartido (sin la regla), la sección no aparece.
  const [permitido, setPermitido] = useState<boolean | null>(null);
  const cargar = useCallback(
    () =>
      Promise.resolve()
        .then(() => getVistasCompartidas(pantalla))
        .then((lista) => {
          setCompartidas(lista);
          setPermitido(true);
        })
        .catch(() => setPermitido((antes) => antes ?? false)),
    [pantalla]
  );

  useEffect(() => {
    void cargar();
    // Sin permiso para listar grupos, solo se comparte con la empresa.
    Promise.resolve()
      .then(() => getGrupos())
      .then((lista) => setGrupos(Array.isArray(lista) ? lista : []))
      .catch(() => setGrupos([]));
  }, [cargar]);

  const nombreGrupo = (id: string | null) =>
    id === null ? "Toda la empresa" : (grupos.find((g) => g.id === id)?.nombre ?? id);

  const ejecutar = (accion: Promise<unknown>) => {
    setError(null);
    void accion
      .then(() => cargar())
      .then(() => onCambio())
      .catch(() => setError("No se ha podido guardar. Inténtalo de nuevo."));
  };

  const empresaPorDefecto = compartidas?.find((c) => c.grupo_id === null && c.vista === "");
  const bloqueada = !!empresaPorDefecto?.bloqueada;

  const compartir = () =>
    ejecutar(
      guardarVistaCompartida(pantalla, {
        vista,
        grupo_id: destino || null,
        config: paraCompartir(),
        // Al compartir la vista por defecto con la empresa se conserva el bloqueo.
        ...(vista === "" && !destino ? { bloqueada } : {}),
      })
    );

  const alternarBloqueo = () =>
    ejecutar(
      guardarVistaCompartida(pantalla, {
        vista: "",
        grupo_id: null,
        config: empresaPorDefecto?.config ?? {},
        bloqueada: !bloqueada,
      })
    );

  if (!permitido) return null;

  return (
    <>
      <h4>Compartir</h4>
      <p className="panel-personalizar-ayuda">
        Comparte «{nombreVista}» tal como la ves ahora. Quien la reciba la verá como punto de
        partida y podrá personalizarla para sí, salvo que bloquees la pantalla.
      </p>
      <label className="panel-personalizar-campo">
        <span>Con</span>
        <select value={destino} onChange={(e) => setDestino(e.target.value)}>
          <option value="">Toda la empresa</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              Grupo {grupo.nombre}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="panel-personalizar-enlace" onClick={compartir}>
        Compartir esta vista
      </button>

      <label className="panel-personalizar-casilla">
        <input type="checkbox" checked={bloqueada} onChange={alternarBloqueo} />
        <span>Bloquear la personalización de esta pantalla para toda la empresa</span>
      </label>

      {compartidas && compartidas.length > 0 && (
        <ul className="panel-personalizar-compartidas" aria-label="Vistas compartidas">
          {compartidas.map((c) => (
            <li key={`${c.grupo_id ?? ""}:${c.vista}`}>
              <span>
                {c.nombre ?? (c.vista ? c.vista : "Vista por defecto")}
                <small> · {nombreGrupo(c.grupo_id)}</small>
              </span>
              <button
                type="button"
                className="panel-personalizar-enlace"
                aria-label={`Dejar de compartir ${c.nombre ?? (c.vista || "la vista por defecto")} con ${nombreGrupo(c.grupo_id)}`}
                onClick={() => ejecutar(borrarVistaCompartida(pantalla, c.vista, c.grupo_id))}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="panel-personalizar-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
};
