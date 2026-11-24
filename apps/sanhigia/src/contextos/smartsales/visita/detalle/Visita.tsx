import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QMapa } from "@olula/componentes/mapa/qmapa.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ModalProcesando } from "../../comun/componentes/ModalProcesando.tsx";
import { NotaDictada } from "../../comun/componentes/NotaDictada.tsx";
import { textoTipoTarea } from "../../comun/dominio.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { useMaquinaConProceso } from "../../comun/useMaquinaConProceso.ts";
import { DialogoDocumentoTrato } from "../../trato/componentes/DialogoDocumentoTrato.tsx";
import { textoBotonGanar } from "../../trato/dominio.ts";
import { CambioVisita, SiguientePaso, TiposTratoUsuario } from "../diseño.ts";
import {
  contextoInicial,
  destinoAlTerminar,
  esVisita,
  MAX_NOTA,
  puedeEditar,
  puedeGenerarSiguiente,
} from "../dominio.ts";
import { getMaquina } from "../maquina.ts";
import { EditarTarea } from "../componentes/EditarTarea.tsx";
import "./Visita.css";

// Editar campos y la carga inicial (que ya muestra "Cargando…") no bloquean la pantalla.
// Cambiar el cliente o la dirección del documento consulta al backend, pero es inmediato y no debe
// mostrar el indicador.
const EVENTOS_SIN_BLOQUEO = [
  "cambiar",
  "cambiar_documento",
  "cambiar_cliente",
  "cambiar_direccion",
  "cargar",
];

const siguientesPasos: { valor: SiguientePaso; descripcion: string }[] = [
  { valor: "ninguno", descripcion: "Ninguno" },
  { valor: "presupuesto", descripcion: "Enviar presupuesto" },
  { valor: "pedido", descripcion: "Crear pedido" },
];

export const Visita = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ctx, emitir, procesando, eventoEnCurso } = useMaquinaConProceso(
    getMaquina,
    contextoInicial,
    EVENTOS_SIN_BLOQUEO
  );
  const { usuario, agentePropio } = useAgenteSeguido();
  const [confirmarAnulacion, setConfirmarAnulacion] = useState(false);
  const [editando, setEditando] = useState(false);
  const tiposTrato: TiposTratoUsuario = {
    tipoTratoFarma: usuario?.tipoTratoFarma ?? null,
    tipoTratoTareaUnica: usuario?.tipoTratoTareaUnica ?? null,
  };
  const { estado, tarea, errores } = ctx;

  const cambiar = (cambio: CambioVisita) => emitir("cambiar", cambio);

  useEffect(() => {
    if (id) emitir("cargar", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (estado === "TERMINADA" && tarea && !tarea.completada)
      navigate(destinoAlTerminar(ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  if (!tarea) {
    return (
      <LayoutSmartsales>
        <p>Cargando…</p>
      </LayoutSmartsales>
    );
  }

  const visita = esVisita(tarea);

  return (
    // Al finalizar, el "Volver" de arriba regresa a la visita en curso (como el de abajo), no sale de la pantalla.
    // Al editar, cancela la edición.
    <LayoutSmartsales
      alVolver={
        estado === "FINALIZANDO"
          ? () => emitir("volver")
          : estado === "PENDIENTE" && editando
            ? () => setEditando(false)
            : undefined
      }
    >
      <div className="Visita">
        <QCargando visible={procesando} mensaje="Procesando…" />
        <h1>
          {estado === "FINALIZANDO"
            ? `Finalizar ${visita ? "visita" : "tarea"}`
            : estado === "PENDIENTE" && editando
              ? `Editar ${visita ? "visita" : "tarea"}`
              : `${visita ? "Visita" : "Tarea"}${estado === "EN_CURSO" ? " en curso" : ""}`}
        </h1>

        <header className="tarjeta cabecera-visita">
          <span className="icono">
            <QIcono nombre={visita ? "calendario_evento" : "tarea"} />
          </span>
          <div>
            <strong>{tarea.nombreCliente ?? tarea.titulo}</strong>
            <span className="subtitulo">
              {textoTipoTarea[tarea.tipo]} · {tarea.fecha}{" "}
              {tarea.hora?.slice(0, 5)}
            </span>
            {tarea.enCurso && tarea.horaInicio && (
              <span className="en-curso">
                En curso desde las {tarea.horaInicio.slice(0, 5)}
              </span>
            )}
          </div>
        </header>

        {estado === "EN_CURSO" && tarea.posicionInicio && (
          <section className="tarjeta ubicacion-inicio">
            <QMapa
              centro={tarea.posicionInicio}
              radioKm={0.5}
              puntos={[]}
              posicion={tarea.posicionInicio}
            />
            <span className="secundario">
              <QIcono nombre="casa" tamaño="sm" /> Ubicación registrada
              {tarea.horaInicio && ` a las ${tarea.horaInicio.slice(0, 5)}`}
            </span>
          </section>
        )}

        {estado === "TERMINADA" && <p>Esta tarea ya está completada.</p>}

        {estado === "PENDIENTE" && editando && (
          <EditarTarea
            tarea={tarea}
            onCancelar={() => setEditando(false)}
            onGuardada={() => {
              setEditando(false);
              emitir("cargar", tarea.id).catch(() => undefined);
            }}
          />
        )}

        {estado === "PENDIENTE" && !editando && (
          <section className="tarjeta acciones-principales">
            <p className="titulo-tarea">{tarea.titulo}</p>
            {tarea.nota && <p className="nota-previa">{tarea.nota}</p>}
            {visita ? (
              <QBoton ancho onClick={() => emitir("iniciar")}>
                Iniciar visita
              </QBoton>
            ) : (
              <QBoton ancho onClick={() => emitir("finalizar")}>
                Completar tarea
              </QBoton>
            )}
            {puedeEditar(tarea) && (
              <QBoton variante="borde" ancho onClick={() => setEditando(true)}>
                Editar
              </QBoton>
            )}
          </section>
        )}

        {(estado === "EN_CURSO" || estado === "FINALIZANDO") && (
          <section className="tarjeta formulario">
            {estado === "FINALIZANDO" && (
              <QInput
                label="Hora de fin"
                nombre="hora_fin"
                tipo="hora"
                valor={ctx.horaFin}
                onChange={(horaFin) => cambiar({ horaFin })}
              />
            )}
            <QSelect
              label="Interlocutor"
              nombre="interlocutor"
              opcional
              valor={ctx.interlocutor ?? ""}
              opciones={ctx.contactos.map((c) => ({
                valor: c.codigo,
                descripcion: c.nombre,
              }))}
              onChange={(opcion) =>
                cambiar({ interlocutor: opcion?.valor || null })
              }
            />
            <NotaDictada
              valor={ctx.nota}
              maximo={MAX_NOTA}
              onChange={(nota) => cambiar({ nota })}
            />

            {estado === "FINALIZANDO" && tarea.idTrato && (
              <>
                <span className="titulo-campo" id="siguiente-paso">
                  Siguiente paso
                </span>
                <div
                  className="opciones"
                  role="radiogroup"
                  aria-labelledby="siguiente-paso"
                >
                  {siguientesPasos.map(({ valor, descripcion }) => (
                    <button
                      key={valor}
                      type="button"
                      role="radio"
                      aria-checked={ctx.siguientePaso === valor}
                      onClick={() => cambiar({ siguientePaso: valor })}
                    >
                      {descripcion}
                    </button>
                  ))}
                </div>
              </>
            )}
            {estado === "FINALIZANDO" && puedeGenerarSiguiente(ctx) && (
              <QCheckbox
                label="Generar siguiente tarea"
                nombre="generar_siguiente"
                valor={ctx.generarSiguiente}
                onChange={(valor) =>
                  cambiar({ generarSiguiente: valor === "true" })
                }
              />
            )}

            <div className="acciones">
              {estado === "EN_CURSO" ? (
                <>
                  <QBoton
                    variante="borde"
                    ancho
                    onClick={() => setConfirmarAnulacion(true)}
                  >
                    Anular inicio
                  </QBoton>
                  <QBoton ancho onClick={() => emitir("finalizar")}>
                    Finalizar
                  </QBoton>
                </>
              ) : (
                <>
                  <QBoton
                    variante="borde"
                    ancho
                    onClick={() => emitir("volver")}
                  >
                    Volver
                  </QBoton>
                  <QBoton ancho onClick={() => emitir("guardar")}>
                    Guardar y cerrar
                  </QBoton>
                </>
              )}
            </div>
          </section>
        )}

        <ModalProcesando
          nombre="anular_inicio"
          titulo="¿Anular el inicio de la visita?"
          abierto={confirmarAnulacion && estado === "EN_CURSO"}
          onCerrar={() => setConfirmarAnulacion(false)}
          procesando={eventoEnCurso === "anular_inicio"}
        >
          <div className="dialogo">
            <p>La visita volverá a pendiente.</p>
            <div className="acciones">
              <QBoton
                variante="borde"
                onClick={() => setConfirmarAnulacion(false)}
              >
                Cancelar
              </QBoton>
              <QBoton
                onClick={() => {
                  emitir("anular_inicio")
                    .then(() => setConfirmarAnulacion(false))
                    .catch(() => undefined);
                }}
              >
                Anular inicio
              </QBoton>
            </div>
          </div>
        </ModalProcesando>

        {estado === "CERRANDO_TRATO" && ctx.trato && (
          <section className="tarjeta formulario">
            <p>
              Era la última tarea pendiente del trato{" "}
              <strong>{ctx.trato.titulo}</strong>. ¿Cómo ha terminado?
            </p>
            {ctx.estadoTrato === "Perdido" ? (
              <>
                <QSelect
                  label="Causa de la pérdida"
                  nombre="causa"
                  valor={ctx.idCausa ?? ""}
                  opciones={ctx.causas.map((c) => ({
                    valor: c.id,
                    descripcion: c.descripcion,
                  }))}
                  onChange={(opcion) =>
                    cambiar({ idCausa: opcion?.valor || null })
                  }
                />
                <div className="acciones">
                  <QBoton
                    variante="borde"
                    ancho
                    onClick={() =>
                      cambiar({ estadoTrato: null, idCausa: null })
                    }
                  >
                    Volver
                  </QBoton>
                  <QBoton ancho onClick={() => emitir("perder_trato")}>
                    Marcar perdido
                  </QBoton>
                </div>
              </>
            ) : (
              <div className="acciones">
                <QBoton
                  variante="borde"
                  ancho
                  onClick={() => cambiar({ estadoTrato: "Perdido" })}
                >
                  Perdido
                </QBoton>
                <QBoton
                  ancho
                  deshabilitado={!usuario}
                  onClick={() => emitir("ganar_trato", tiposTrato)}
                >
                  {textoBotonGanar(
                    ctx.trato,
                    tiposTrato.tipoTratoFarma,
                    tiposTrato.tipoTratoTareaUnica
                  )}
                </QBoton>
              </div>
            )}
            <QBoton
              variante="texto"
              ancho
              onClick={() => emitir("mantener_abierto")}
            >
              Dejar el trato abierto
            </QBoton>
          </section>
        )}

        {estado === "DOCUMENTO" && ctx.documento && (
          <DialogoDocumentoTrato
            abierto
            documento={ctx.documento.tipo}
            pideCliente={ctx.documento.pideCliente}
            conDireccion={ctx.documento.conDireccion}
            direcciones={ctx.documento.direcciones}
            datos={ctx.documento.datos}
            dirCanarias={ctx.documento.dirCanarias}
            errores={errores}
            procesando={eventoEnCurso === "confirmar_documento"}
            onCambiarCliente={(cliente) => emitir("cambiar_cliente", cliente)}
            onCambiarDireccion={(codDireccion) =>
              emitir("cambiar_direccion", codDireccion)
            }
            onCambiar={(cambios) => emitir("cambiar_documento", cambios)}
            onCancelar={() => emitir("cancelar_documento")}
            onConfirmar={() => emitir("confirmar_documento", agentePropio)}
          />
        )}

        {errores.length > 0 && (
          <ul className="errores">
            {errores.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </LayoutSmartsales>
  );
};
