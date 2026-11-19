import { puede } from "@olula/lib/dominio.ts";
import { Link } from "react-router";
import { useAgenteSeguido } from "../contextos/smartsales/comun/useAgenteSeguido.ts";
import "./ExtraLogoSanhigia.css";

const EnlaceSmartsales = () => {
  const { agentePropio } = useAgenteSeguido();
  if (!agentePropio) return null;

  return (
    <Link to="/ss/dashboard" className="extra-logo-sanhigia">
      SmartSales
    </Link>
  );
};

/**
 * Logo adicional para la cabecera de Sanhigia
 * Muestra el logo de SmartSales junto al principal
 * Solo visible para usuarios con acceso a "crm.trato" y agente asociado:
 * la nueva UI de SmartSales es exclusiva de agentes.
 */
export const ExtraLogoSanhigia = () => {
  if (!puede("crm.trato")) return null;

  return <EnlaceSmartsales />;
};
