import { Paginacion } from "@olula/lib/diseño.ts";

export interface ListaDocumentosProps {
    vinculo_tipo: string;
    vinculo_id: string;
    paginacion?: Paginacion;
    refreshCounter?: number;
    carpeta_id?: string | null;
    onError?: (error: Error) => void;
}
