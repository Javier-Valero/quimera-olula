import { setLineasCarrito } from "@olula/lib/carritoLineas.ts";
import Quimera, { useAppValue } from "quimera";
import { useEffect } from "react";

function Container() {
    const [{ carrito }] = useAppValue();

    console.log('mimensaje_carrito?.lineas', carrito?.lineas);

    useEffect(() => {
        setLineasCarrito(carrito?.lineas ?? []);
    }, [carrito?.lineas]);

    // Quimera.Reference is needed so Template delegates rendering to the parent (core Container).
    // Without at least one Reference child, Template renders children directly (nothing).
    return (
        <Quimera.Template id="Container">
            <Quimera.Reference id="containerBlock" type="append" />
        </Quimera.Template>
    );
}

export default Container;
