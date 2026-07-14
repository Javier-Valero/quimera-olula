import { descargarDocumento } from "@olula/componentes/index.js";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { DocumentoArbol, DocumentosAPI } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { NodoArbolItem } from "./NodoArbolItem.tsx";
import { ConfiguracionArbolDocumentos } from "./diseño.ts";
import { getMaquinaArbolDocumentos } from "./maquina.ts";
import "./QArbolDocumentos.css";

export interface QArbolDocumentosProps {
    tipoObjeto: string;
    objetoId: string;
    onDescargar?: (documento: DocumentoArbol) => void;
    onError?: (error: Error) => void;
}

export const QArbolDocumentos = ({ tipoObjeto, objetoId, onDescargar, onError }: QArbolDocumentosProps) => {
    const handleError = useCallback(onError || (() => {}), [onError]);

    const configuracion: ConfiguracionArbolDocumentos = { tipoObjeto, objetoId };

    const { ctx, emitir } = useMaquina(getMaquinaArbolDocumentos, {
        estado: "cargando" as const,
        nodos: [],
        configuracion,
    });
    const { intentar } = useContext(ContextoError);
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

    useEffect(() => {
        emitir("cargar_arbol");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoObjeto, objetoId]);

    const handleToggle = useCallback((id: string) => {
        setExpandidos((actual) => {
            const nuevo = new Set(actual);
            if (nuevo.has(id)) {
                nuevo.delete(id);
            } else {
                nuevo.add(id);
            }
            return nuevo;
        });
    }, []);

    const handleDescargar = useCallback(
        async (documento: DocumentoArbol) => {
            if (onDescargar) {
                onDescargar(documento);
                return;
            }
            try {
                await intentar(async () => {
                    const blob = await DocumentosAPI.descargar(documento.id);
                    await descargarDocumento(blob, documento.nombre);
                });
            } catch (error) {
                handleError(error instanceof Error ? error : new Error("Error desconocido"));
            }
        },
        [intentar, onDescargar, handleError]
    );

    return (
        <div className="QArbolDocumentos">
            {ctx.estado === "cargando" && (
                <div className="QArbolDocumentos-cargando">
                    <p>Cargando árbol de documentos...</p>
                </div>
            )}
            {ctx.estado === "cargado" && ctx.nodos.length === 0 && (
                <div className="QArbolDocumentos-vacio">
                    <p>No hay documentos</p>
                </div>
            )}
            {ctx.estado === "cargado" && ctx.nodos.length > 0 && (
                <div className="QArbolDocumentos-arbol">
                    {ctx.nodos.map((nodo) => (
                        <NodoArbolItem
                            key={nodo.id}
                            nodo={nodo}
                            nivel={0}
                            expandidos={expandidos}
                            onToggle={handleToggle}
                            onDescargar={handleDescargar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
