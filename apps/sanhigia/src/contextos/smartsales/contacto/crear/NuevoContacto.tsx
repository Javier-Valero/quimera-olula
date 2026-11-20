import { useNavigate } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { FormularioNuevoContacto } from "./FormularioNuevoContacto.tsx";
import "../detalle/Contacto.css";

export const NuevoContacto = () => {
    const navigate = useNavigate();

    return (
        <LayoutSmartsales>
            <div className="Contacto">
                <header>
                    <h1>Nuevo contacto</h1>
                </header>
                <FormularioNuevoContacto onCreado={({ codigo }) => navigate(rutasSmartsales.contacto(codigo))} onCancelar={() => navigate(-1)} />
            </div>
        </LayoutSmartsales>
    );
};
