import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import {
  CarpetaContenido,
  CarpetasAPI,
  SubCarpeta,
} from "@olula/lib/api/carpetas.ts";
import { ContextoError } from "@olula/lib/contexto.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { GestorDocumentos } from "../gestor_documentos/GestorDocumentos.tsx";
import { ListaDocumentos } from "../lista_documentos/ListaDocumentos.tsx";
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
    carpetaActual: null,
    carpetaRaiz: null,
    historialCarpetas: [],
    nuevaCarpetaNombre: "",
    carpetaAEditar: null,
    error: null,
  });

  const { intentar } = useContext(ContextoError);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Cargar carpetas raíz al iniciar
  useEffect(() => {
    (async () => {
      try {
        // Obtener carpetas raíz disponibles (sin crear nada automáticamente)
        const respuesta = await CarpetasAPI.listar([]);
        const carpetas = respuesta.datos || [];

        // Emitir evento con las carpetas raíz encontradas
        emitir("carpetas_cargadas", carpetas);

        // Si hay carpetas, cargar la primera; si no, simplemente continuar
        if (carpetas.length > 0) {
          const carpetaRaiz = carpetas[0];
          const carpetaContenido = await CarpetasAPI.obtener(carpetaRaiz.id);
          emitir("carpeta_seleccionada", carpetaContenido);
        } else {
          // No hay carpetas - mostrar vista vacía pero no crear nada
          emitir("carpeta_seleccionada", null);
        }
      } catch (error) {
        emitir(
          "error",
          error instanceof Error ? error : new Error("Error desconocido")
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

  const handleNavegar = useCallback(
    async (carpeta: CarpetaContenido) => {
      // Ya tenemos los detalles de la carpeta, navegamos directamente
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
    if (onCarpetaSeleccionada) {
      onCarpetaSeleccionada(ctx.carpetaRaiz);
    }
  }, [ctx.carpetaRaiz, emitir, onCarpetaSeleccionada]);

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
                onSeleccionar={handleNavegar}
                onCrearCarpeta={handleCrearCarpeta}
              />
            </>
          )}
        </div>
      )}

      <div className="GestorDocumental__principal">
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
      </div>
    </div>
  );
};
