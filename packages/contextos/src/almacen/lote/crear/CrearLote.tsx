import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { CampoFecha } from "#/produccion/comun/componentes/CampoFecha.tsx";
import { CrearSimple } from "#/produccion/comun/maestro_simple/CrearSimple.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useMemo } from "react";
import { NuevoLote } from "../diseño.ts";
import { conAlmacenYFechaDisponible, metaNuevoLote, nuevoLoteVacio } from "../dominio.ts";
import { postLote } from "../infraestructura.ts";
import "./CrearLote.css";

/**
 * Alta de un lote: código, artículo (solo por lotes) y caducidad; en lascunas, también almacén
 * (obligatorio) y fecha disponible. Publica `entidad_creada` con el código o `alta_cancelada`.
 */
export const CrearLote = ({ publicar }: { publicar: EmitirEvento }) => {
    const conAlmacen = conAlmacenYFechaDisponible();
    const meta = useMemo(() => metaNuevoLote(conAlmacen), [conAlmacen]);

    return (
        <CrearSimple<NuevoLote>
            publicar={publicar}
            nombre="crearLote"
            titulo="Nuevo lote"
            clase="CrearLote"
            meta={meta}
            vacio={nuevoLoteVacio}
            crear={postLote}
            campos={({ modelo, uiProps, set }, focus) => (
                <>
                    <QInput label="Código" {...uiProps("id")} maxLength={30} ref={focus} />
                    <Articulo
                        valor={modelo.sku}
                        nombre="sku"
                        soloPorLotes
                        onChange={(opcion) => set({
                            ...modelo,
                            sku: opcion?.valor ?? "",
                            porLotes: opcion ? opcion.datos?.porLotes ?? null : null,
                        })}
                    />
                    <CampoFecha label="Caducidad" {...uiProps("caducidad")} />
                    {conAlmacen && <Almacen {...uiProps("almacenId")} />}
                    {conAlmacen && <CampoFecha label="Fecha disponible" {...uiProps("fechaDisponible")} />}
                    {modelo.porLotes === false && (
                        <p className="aviso-lote" role="alert">El artículo no se gestiona por lotes</p>
                    )}
                </>
            )}
        />
    );
};
