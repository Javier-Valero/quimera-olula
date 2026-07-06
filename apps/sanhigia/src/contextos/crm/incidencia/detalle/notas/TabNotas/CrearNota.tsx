import { QBoton, QTextArea } from "@olula/componentes/index.js";
import { useState } from "react";
import "./CrearNota.css";

export const CrearNota = ({
  onAgregar,
  cargando,
}: {
  onAgregar: (texto: string) => void;
  cargando: boolean;
}) => {
  const [texto, setTexto] = useState("");

  const handleAgregar = () => {
    if (texto.trim()) {
      onAgregar(texto);
      setTexto("");
    }
  };

  return (
    <div className="CrearNota">
      <QTextArea
        nombre="texto"
        label="Nueva nota"
        valor={texto}
        onChange={(valor: string) => setTexto(valor)}
        placeholder="Ingresa el texto de la nota..."
        rows={4}
      />
      <div className="CrearNota-Boton">
        <QBoton
          onClick={handleAgregar}
          deshabilitado={!texto.trim() || cargando}
        >
          Agregar nota
        </QBoton>
      </div>
    </div>
  );
};
