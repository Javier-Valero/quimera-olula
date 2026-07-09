import { Paginacion } from "@olula/lib/diseño.ts";

export interface QListaDocumentosProps {
    vinculo_tipo: string;
    vinculo_id: string;
    paginacion?: Paginacion;
    refreshCounter?: number;
    onError?: (error: Error) => void;
}
