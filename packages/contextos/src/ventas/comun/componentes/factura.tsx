import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro } from "@olula/lib/diseño.ts";
import { getFacturas } from "../../factura/infraestructura.ts";

interface FacturaProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Factura = ({
  descripcion = "",
  valor,
  nombre = "factura_id",
  label = "Factura",
  deshabilitado = false,
  onChange,
  ...props
}: FacturaProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: ["codigo", "~", texto],
      orden: ["id"],
    };

    const { datos } = await getFacturas(
      criteria.filtro as unknown as Filtro,
      criteria.orden,
      { pagina: 1, limite: 10 }
    );

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.map((factura) => ({
      valor: factura.id,
      descripcion: factura.codigo,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      {...props}
    />
  );
};
