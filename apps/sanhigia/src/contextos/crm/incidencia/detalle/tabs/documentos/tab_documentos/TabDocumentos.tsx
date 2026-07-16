import { QArbolDocumentos } from "@olula/componentes/index.js";

export const TabDocumentos = ({ incidenciaId }: { incidenciaId: string }) => {
  return (
    <div className="TabDocumentos">
      <QArbolDocumentos tipoObjeto="incidencia" objetoId={incidenciaId} />
    </div>
  );
};
