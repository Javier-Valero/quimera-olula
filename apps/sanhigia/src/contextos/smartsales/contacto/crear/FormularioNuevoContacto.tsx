import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCargando } from "@olula/componentes/atomos/qcargando.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { ClienteContacto, EstadoEmail, FormularioContacto } from "../diseño.ts";
import { altaParaAPI, emailValido, erroresAlta, formularioVacio } from "../dominio.ts";
import { crearContacto, getContactoPorEmail } from "../infraestructura.ts";
import { CamposContacto } from "../detalle/CamposContacto.tsx";
import "../detalle/Contacto.css";

const ESPERA_EMAIL = 1000;

const textoEstadoEmail: Partial<Record<EstadoEmail, string>> = {
    invalido: "Formato de e-mail no válido",
    comprobando: "Comprobando…",
    libre: "E-mail disponible",
};

type Props = {
    cliente?: ClienteContacto | null;
    onCreado: (contacto: { codigo: string; nombre: string }) => void;
    onCancelar: () => void;
};

// Alta de contacto: página "Nuevo contacto" y diálogo "Crear nuevo contacto" del alta de trato.
export const FormularioNuevoContacto = ({ cliente = null, onCreado, onCancelar }: Props) => {
    const { intentar } = useContext(ContextoError);
    const { usuario } = useAgenteSeguido();

    const [formulario, setFormulario] = useState<FormularioContacto>(() => ({ ...formularioVacio(), cliente }));
    const [estadoEmail, setEstadoEmail] = useState<EstadoEmail>("vacio");
    const [existente, setExistente] = useState<string | null>(null);
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    const cambiar = (cambios: Partial<FormularioContacto>) => setFormulario((actual) => ({ ...actual, ...cambios }));

    useEffect(() => {
        const email = formulario.email.trim();
        setExistente(null);
        if (!email) return setEstadoEmail("vacio");
        if (!emailValido(email)) return setEstadoEmail("invalido");
        setEstadoEmail("comprobando");
        let activo = true;
        const espera = setTimeout(() => {
            getContactoPorEmail(email)
                .then((codigo) => {
                    if (!activo) return;
                    setExistente(codigo);
                    setEstadoEmail(codigo ? "existe" : "libre");
                })
                .catch(() => activo && setEstadoEmail("vacio"));
        }, ESPERA_EMAIL);
        return () => {
            activo = false;
            clearTimeout(espera);
        };
    }, [formulario.email]);

    const guardar = async () => {
        const encontrados = [...erroresAlta(formulario), ...(existente ? ["Ya existe un contacto con ese e-mail"] : [])];
        setErrores(encontrados);
        if (encontrados.length > 0) return;

        setGuardando(true);
        try {
            const codigo = await intentar(() => crearContacto(altaParaAPI(formulario, usuario?.empresa ?? null)));
            onCreado({ codigo, nombre: formulario.nombre.trim() });
        } catch {
            setGuardando(false);
        }
    };

    return (
        <div className="Contacto">
            <QCargando visible={guardando} mensaje="Guardando…" />
            <QInput label="Nombre" nombre="nombre" valor={formulario.nombre} onChange={(nombre) => cambiar({ nombre })} />
            <QInput
                label="E-mail"
                nombre="email"
                valor={formulario.email}
                erroneo={estadoEmail === "invalido"}
                advertido={estadoEmail === "existe"}
                valido={estadoEmail === "libre"}
                textoValidacion={textoEstadoEmail[estadoEmail]}
                onChange={(email) => cambiar({ email })}
            />
            {estadoEmail === "existe" && existente && (
                <p className="aviso">
                    El contacto ya existe. <Link to={rutasSmartsales.contacto(existente)}>Ir al contacto</Link>
                </p>
            )}

            <CamposContacto formulario={formulario} cambiar={cambiar} />

            {errores.length > 0 && (
                <ul className="errores">
                    {errores.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            )}

            <div className="acciones">
                <QBoton variante="borde" onClick={onCancelar}>
                    Cancelar
                </QBoton>
                <QBoton deshabilitado={guardando || estadoEmail === "comprobando"} onClick={() => guardar()}>
                    Crear contacto
                </QBoton>
            </div>
        </div>
    );
};
