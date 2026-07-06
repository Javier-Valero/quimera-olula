import { QBoton, QTextArea } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { postNota } from "../../../../infraestructura.ts";
import "./CrearNota.css";

export const CrearNota = ({
  incidenciaId,
  agenteId,
  emitir,
}: {
  incidenciaId: string;
  agenteId: string;
  emitir: EmitirEvento;
}) => {
  const { intentar } = useContext(ContextoError);
  const [texto, setTexto] = useState("");
  const [creando, setCreando] = useState(false);

  const handleAgregar = useCallback(async () => {
    if (texto.trim()) {
      setCreando(true);
      const id = await intentar(async () => {
        const ahora = new Date().toISOString().split("T")[0];
        return await postNota({
          texto,
          fecha: ahora,
          agenteId,
          incidenciaId,
        });
      });
      if (id) {
        setTexto("");
        emitir("nota_creada");
      } else {
        setCreando(false);
      }
    }
  }, [texto, agenteId, incidenciaId, emitir, intentar]);

  const handleCancelar = useCallback(() => {
    if (!creando) {
      setTexto("");
      emitir("creacion_nota_cancelada");
    }
  }, [creando, emitir]);

  console.log("mimensaje_creando", creando);

  return (
    <div className="CrearNota">
      <QTextArea
        nombre="texto"
        label=""
        valor={texto}
        onChange={(valor: string) => setTexto(valor)}
        placeholder="Ingresa el texto de la nueva nota..."
        rows={4}
      />
      <div className="CrearNota-Boton">
        <QBoton
          onClick={handleAgregar}
          deshabilitado={!texto.trim() || creando}
        >
          Añadir nota
        </QBoton>
        <QBoton onClick={handleCancelar} deshabilitado={creando}>
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
