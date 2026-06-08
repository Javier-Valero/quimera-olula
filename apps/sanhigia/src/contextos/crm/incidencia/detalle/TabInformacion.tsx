import { Incidencia } from "../diseño.ts";

/**
 * Tab Información: solo lectura, muestra datos de la incidencia
 */
export const TabInformacion = ({ incidencia }: { incidencia: Incidencia }) => {
  return (
    <div className="TabInformacion">
      <div className="info-grupo">
        <h4>Detalles de la Incidencia</h4>
        <p>
          <strong>ID:</strong> {incidencia.id}
        </p>
        <p>
          <strong>Cliente:</strong> {incidencia.nombreCliente}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`badge estado-${incidencia.estado}`}>
            {incidencia.estado}
          </span>
        </p>
        <p>
          <strong>Prioridad:</strong>{" "}
          <span className={`badge prioridad-${incidencia.prioridad}`}>
            {incidencia.prioridad}
          </span>
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(incidencia.fecha).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="info-grupo">
        <h4>Descripción</h4>
        <p className="descripcion-texto">
          {incidencia.descripcion || <em>Sin descripción</em>}
        </p>
      </div>

      {incidencia.descripcionLarga && (
        <div className="info-grupo">
          <h4>Descripción detallada</h4>
          <p className="descripcion-texto">{incidencia.descripcionLarga}</p>
        </div>
      )}

      {incidencia.resolucion && (
        <div className="info-grupo">
          <h4>Resolución</h4>
          <p className="descripcion-texto">{incidencia.resolucion}</p>
        </div>
      )}

      <div className="info-grupo">
        <h4>Información adicional</h4>
        {incidencia.clienteId && (
          <p>
            <strong>Cliente ID:</strong> {incidencia.clienteId}
          </p>
        )}
        {incidencia.articuloId && (
          <p>
            <strong>Artículo ID:</strong> {incidencia.articuloId}
          </p>
        )}
        {incidencia.presupuestoId && (
          <p>
            <strong>Presupuesto ID:</strong> {incidencia.presupuestoId}
          </p>
        )}
        {incidencia.familiaId && (
          <p>
            <strong>Familia ID:</strong> {incidencia.familiaId}
          </p>
        )}
        {incidencia.agenteId && (
          <p>
            <strong>Agente ID:</strong> {incidencia.agenteId}
          </p>
        )}
        <p>
          <strong>En garantía:</strong> {incidencia.enGarantia ? "Sí" : "No"}
        </p>
      </div>
    </div>
  );
};
