import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useState } from "react";
import { Documento } from "../diseño.ts";
import "./TabDocumentosLista.css";

export const TabDocumentosLista = ({
  documentos,
  cargando,
}: {
  documentos: Documento[];
  cargando: boolean;
}) => {
  const [ordenActual, setOrdenActual] = useState<[string, "ASC" | "DESC"]>([
    "fechaSubida",
    "DESC",
  ]);

  const handleOrdenar = (columna: string) => {
    if (ordenActual[0] === columna) {
      // Si es la misma columna, cambiar dirección
      setOrdenActual([columna, ordenActual[1] === "ASC" ? "DESC" : "ASC"]);
    } else {
      // Si es otra columna, ordenar ascendente
      setOrdenActual([columna, "ASC"]);
    }
  };

  const documentosOrdenados = [...documentos].sort((a, b) => {
    const [columna, direccion] = ordenActual;
    const valorA = String(a[columna as keyof Documento] ?? "");
    const valorB = String(b[columna as keyof Documento] ?? "");

    if (valorA < valorB) return direccion === "ASC" ? -1 : 1;
    if (valorA > valorB) return direccion === "ASC" ? 1 : -1;
    return 0;
  });

  const metaTabla: MetaTabla<Documento> = [
    {
      id: "nombre",
      cabecera: "Nombre",
      prioridad: "alta",
      esTitulo: true,
      ancho: "40%",
    },
    // {
    //   id: "tipo",
    //   cabecera: "Tipo",
    //   prioridad: "media",
    //   ancho: "15%",
    // },
    {
      id: "fechaSubida",
      cabecera: "Fecha",
      tipo: "fecha",
      prioridad: "media",
      ancho: "15%",
    },
    {
      id: "horaSubida",
      cabecera: "Hora",
      tipo: "hora",
      prioridad: "media",
      ancho: "15%",
    },
    // {
    //   id: "urlDescarga",
    //   cabecera: "Acciones",
    //   prioridad: "alta",
    //   ancho: "18%",
    //   render: (doc) => (
    //     <a
    //       href={doc.urlDescarga}
    //       download
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Descargar
    //     </a>
    //   ),
    // },
  ];

  if (documentos.length === 0 && !cargando) {
    return (
      <div className="TabDocumentosLista">
        <p className="sin-datos">No hay documentos adjuntos</p>
      </div>
    );
  }

  return (
    <div className="TabDocumentosLista">
      <QTabla
        metaTabla={metaTabla}
        datos={documentosOrdenados}
        cargando={cargando}
        orden={ordenActual}
        onOrdenar={handleOrdenar}
      />
    </div>
  );
};
