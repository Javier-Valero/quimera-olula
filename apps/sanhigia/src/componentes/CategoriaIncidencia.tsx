import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface CategoriaIncidenciaProps {
  valor: string;
  onChange: (
    opcion: {
      valor: string;
      descripcion: string;
      tipoIncidencia?: string;
    } | null
  ) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

const opcionesCategoria = [
  {
    valor: "INCIDT",
    descripcion: "Incidencia de Transporte (INCIDT)",
    tipoIncidencia: "Transportista",
  },
  {
    valor: "TRANSM",
    descripcion: "Incidencia de Transporte (TRANSM)",
    tipoIncidencia: "Transportista",
  },
  {
    valor: "CalidadProveedor",
    descripcion: "Incidencia Calidad del Fabricante (CalidadProveedor)",
    tipoIncidencia: "Proveedor",
  },
  {
    valor: "INCI PTA",
    descripcion: "Máquina Averiada o Problema (INCI PTA)",
    tipoIncidencia: "Proveedor",
  },
  {
    valor: "Piezasaveria",
    descripcion: "Avería de Pieza o Fallo (Piezasaveria)",
    tipoIncidencia: "Proveedor",
  },
  {
    valor: "INCIDC",
    descripcion: "Incidencia de Calidad del Fabricante (INCIDC)",
    tipoIncidencia: "Proveedor",
  },
];

export const CategoriaIncidencia = ({
  valor,
  onChange,
  getProps,
}: CategoriaIncidenciaProps) => {
  const handleChange = (
    opcion: { valor: string; descripcion: string } | null
  ) => {
    if (opcion) {
      // Buscar la opción completa con todos sus atributos
      const opcionCompleta = opcionesCategoria.find(
        (opt) => opt.valor === opcion.valor
      );
      onChange(opcionCompleta || opcion);
    } else {
      onChange(null);
    }
  };

  return (
    <QSelect
      label="Categoría"
      nombre="categoria_incidencia"
      valor={valor}
      onChange={handleChange}
      opciones={opcionesCategoria}
      {...(getProps ? getProps("categoriaIncidencia") : {})}
    />
  );
};
