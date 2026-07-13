import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
  ArbolCarpetasRespuesta,
  CarpetaEnArbol,
  CarpetasAPI,
  DocumentoEnArbol,
  SubCarpeta,
} from "@olula/lib/api/carpetas.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { ArbolCarpetas } from "./ArbolCarpetas.tsx";
import { BreadcrumbCarpetas } from "./BreadcrumbCarpetas.tsx";
import { GestorDocumentalProps } from "./diseño.ts";
import "./GestorDocumental.css";
import { getMaquinaGestorDocumental } from "./maquina.ts";

export const GestorDocumental = ({
  contenedor_id,
  contenedor_tipo,
  mostrarCarpetas = true,
  onCarpetaSeleccionada,
  onError,
}: GestorDocumentalProps) => {
  const { ctx, emitir } = useMaquina(getMaquinaGestorDocumental, {
    estado: "cargando_carpeta_raiz" as const,
    arbolCarpetas: null as ArbolCarpetasRespuesta | null,
    carpetaActual: null as CarpetaEnArbol | null,
    documentosSinCarpeta: [] as DocumentoEnArbol[],
    historialCarpetas: [] as CarpetaEnArbol[],
    nuevaCarpetaNombre: "",
    carpetaAEditar: null as CarpetaEnArbol | null,
    carpetaAEditarNombre: "",
    carpetaAEliminar: null as CarpetaEnArbol | null,
    error: null as Error | null,
  });

  const { intentar } = useContext(ContextoError);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Cargar árbol de carpetas al iniciar
  useEffect(() => {
    (async () => {
      try {
        // Obtener árbol completo de carpetas para este objeto
        const arbol = await CarpetasAPI.obtenerArbol(
          contenedor_tipo,
          contenedor_id
        );

        emitir("arbol_cargado", arbol);

        // Si hay carpetas raíz, seleccionar la primera; si no, mostrar vista vacía
        if (arbol.carpetas.length > 0) {
          const carpetaRaiz = arbol.carpetas[0];
          emitir("carpeta_seleccionada", carpetaRaiz);
        } else {
          // No hay carpetas - mostrar vista vacía
          emitir("carpeta_seleccionada", null);
        }
      } catch (error) {
        emitir(
          "error",
          error instanceof Error ? error : new Error("Error al cargar carpetas")
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedor_id, contenedor_tipo]);

  const handleCrearCarpeta = useCallback(
    async (nombre: string, padre_id?: string) => {
      try {
        await intentar(async () => {
          // Crear carpeta con padre_id si se proporciona
          const newId = await CarpetasAPI.crear(nombre, padre_id || null);
          const nuevaCarpeta: SubCarpeta = {
            id: newId,
            nombre,
            cantidad_subcarpetas: 0,
            cantidad_documentos: 0,
          };
          emitir("carpeta_creada", nuevaCarpeta);
          // Notificar al padre
          if (onCarpetaSeleccionada && ctx.carpetaActual) {
            onCarpetaSeleccionada(ctx.carpetaActual);
          }
        });
      } catch (error) {
        emitir(
          "error",
          error instanceof Error ? error : new Error("Error al crear carpeta")
        );
      }
    },
    [intentar, ctx.carpetaActual, onCarpetaSeleccionada, emitir]
  );

  const handleRenombrarCarpeta = useCallback(
    async (carpeta_id: string, nuevoNombre: string) => {
      try {
        await intentar(async () => {
          await CarpetasAPI.cambiarNombre(carpeta_id, nuevoNombre);
          emitir("carpeta_renombrada", null);
          // Recargar carpeta actual
          if (ctx.carpetaActual) {
            const carpetaActualizada = await CarpetasAPI.obtener(
              ctx.carpetaActual.id
            );
            emitir("navegar_carpeta", carpetaActualizada);
          }
          if (onCarpetaSeleccionada && ctx.carpetaActual) {
            onCarpetaSeleccionada(ctx.carpetaActual);
          }
        });
      } catch (error) {
        emitir(
          "error",
          error instanceof Error
            ? error
            : new Error("Error al renombrar carpeta")
        );
      }
    },
    [intentar, ctx.carpetaActual, onCarpetaSeleccionada, emitir]
  );

  const handleEliminarCarpeta = useCallback(
    async (carpeta_id: string) => {
      try {
        await intentar(async () => {
          await CarpetasAPI.borrar(carpeta_id);
          emitir("carpeta_eliminada", null);
          // Recargar carpeta actual
          if (ctx.carpetaActual) {
            const carpetaActualizada = await CarpetasAPI.obtener(
              ctx.carpetaActual.id
            );
            emitir("navegar_carpeta", carpetaActualizada);
          }
          if (onCarpetaSeleccionada && ctx.carpetaActual) {
            onCarpetaSeleccionada(ctx.carpetaActual);
          }
        });
      } catch (error) {
        emitir(
          "error",
          error instanceof Error
            ? error
            : new Error("Error al eliminar carpeta")
        );
      }
    },
    [intentar, ctx.carpetaActual, onCarpetaSeleccionada, emitir]
  );

  const handleNavegar = useCallback(
    async (carpeta: CarpetaEnArbol) => {
      emitir("navegar_carpeta", carpeta);
      setRefreshCounter((prev) => prev + 1);
      if (onCarpetaSeleccionada) {
        onCarpetaSeleccionada(carpeta);
      }
    },
    [emitir, onCarpetaSeleccionada]
  );

  const handleIrARaiz = useCallback(() => {
    emitir("ir_a_raiz");
    setRefreshCounter((prev) => prev + 1);
    const carpetaRaiz = ctx.arbolCarpetas?.carpetas[0] || null;
    if (onCarpetaSeleccionada) {
      onCarpetaSeleccionada(carpetaRaiz);
    }
  }, [ctx.arbolCarpetas, emitir, onCarpetaSeleccionada]);

  // Notificar error
  useEffect(() => {
    if (ctx.error && onError) {
      onError(ctx.error);
    }
  }, [ctx.error, onError]);

  return (
    <div className="GestorDocumental">
      {mostrarCarpetas && (
        <div className="GestorDocumental__sidebar">
          {ctx.carpetaActual && (
            <>
              <BreadcrumbCarpetas
                historialCarpetas={ctx.historialCarpetas}
                onNavegar={(carpeta) => {
                  emitir("navegar_carpeta", carpeta);
                  setRefreshCounter((prev) => prev + 1);
                }}
                onIrARaiz={handleIrARaiz}
              />
              <ArbolCarpetas
                carpetaActual={ctx.carpetaActual}
                documentosSinCarpeta={ctx.documentosSinCarpeta}
                onSeleccionar={handleNavegar}
                onCrearCarpeta={handleCrearCarpeta}
                onRenombrarCarpeta={handleRenombrarCarpeta}
                onEliminarCarpeta={handleEliminarCarpeta}
              />
            </>
          )}
        </div>
      )}

      {/* <div className="GestorDocumental__principal">
        <GestorDocumentos
          vinculo_tipo={contenedor_tipo}
          vinculo_id={contenedor_id}
          carpeta_id={
            ctx.carpetaActual?.id === ctx.carpetaRaiz?.id
              ? null
              : ctx.carpetaActual?.id
          }
          onDocumentoSubido={() => setRefreshCounter((prev) => prev + 1)}
          onError={onError}
        />

        <div className="GestorDocumental__separador" />

        <ListaDocumentos
          vinculo_tipo={contenedor_tipo}
          vinculo_id={contenedor_id}
          carpeta_id={
            ctx.carpetaActual?.id === ctx.carpetaRaiz?.id
              ? null
              : ctx.carpetaActual?.id
          }
          refreshCounter={refreshCounter}
          onError={onError}
        />
      </div> */}
    </div>
  );
};
