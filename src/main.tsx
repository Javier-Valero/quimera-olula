import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { MaestroConDetalleEvento } from "./apps/almaeventos/contextos/eventos/evento/vistas/MaestroConDetalleEvento.tsx";
import { Historias } from "./componentes/historias/historias.tsx";
import { Vista } from "./componentes/vista/Vista.tsx";
import "./contextos/comun/comun.css";
import { Indice } from "./contextos/comun/Indice.tsx";
import { MaestroConDetalleAccion } from "./contextos/crm/accion/vistas/MaestroConDetalleAccion.tsx";
import { MaestroConDetalleClienteCRM } from "./contextos/crm/cliente/vistas/MaestroConDetalleCliente.tsx";
import { MaestroConDetalleContacto } from "./contextos/crm/contacto/vistas/MaestroConDetalleContacto.tsx";
import { MaestroConDetalleEstadoOportunidad } from "./contextos/crm/estadoOportunidadVenta/vistas/MaestroConDetalleEstadoOportunidad.tsx";
import { MaestroConDetalleLead } from "./contextos/crm/lead/vistas/MaestroConDetalleLead.tsx";
import { MaestroConDetalleOportunidadVenta } from "./contextos/crm/oportunidadventa/vistas/MaestroConDetalleOportunidadVenta.tsx";
import { Login } from "./contextos/usuarios/login/vistas/Login.tsx";
import { Logout } from "./contextos/usuarios/usuario/vistas/Logout.tsx";
import Perfil from "./contextos/usuarios/usuario/vistas/Perfil.tsx";
import { MaestroConDetalleAlbaran } from "./contextos/ventas/albaran/vistas/MaestroConDetalleAlbaran.tsx";
import { DetalleCliente } from "./contextos/ventas/cliente/vistas/DetalleCliente/DetalleCliente.tsx";
import { MaestroConDetalleCliente } from "./contextos/ventas/cliente/vistas/MaestroConDetalleCliente.tsx";
import { MaestroConDetalleFactura } from "./contextos/ventas/factura/vistas/MaestroConDetalleFactura.tsx";
import { MaestroConDetallePedido } from "./contextos/ventas/pedido/vistas/MaestroConDetallePedido.tsx";
import { MaestroConDetallePresupuesto } from "./contextos/ventas/presupuesto/vistas/MaestroConDetallePresupuesto.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <Vista>
              <Indice />
            </Vista>
          }
        />
        <Route path="ventas">
          <Route path="cliente">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleCliente />
                </Vista>
              }
            />
            <Route
              path=":id"
              element={
                <Vista>
                  <DetalleCliente />
                </Vista>
              }
            />
          </Route>
          <Route path="pedido">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetallePedido />
                </Vista>
              }
            />
          </Route>
          <Route path="presupuesto">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetallePresupuesto />
                </Vista>
              }
            />
          </Route>
          <Route path="albaran">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleAlbaran />
                </Vista>
              }
            />
          </Route>
          <Route path="factura">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleFactura />
                </Vista>
              }
            />
          </Route>
        </Route>
        <Route path="crm">
          <Route path="oportunidadventa">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleOportunidadVenta />
                </Vista>
              }
            />
          </Route>
          <Route path="estadooportunidadventa">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleEstadoOportunidad />
                </Vista>
              }
            />
          </Route>
          <Route path="cliente">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleClienteCRM />
                </Vista>
              }
            />
          </Route>
          <Route path="contacto">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleContacto />
                </Vista>
              }
            />
          </Route>
          <Route path="accion">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleAccion />
                </Vista>
              }
            />
          </Route>
          <Route path="lead">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleLead />
                </Vista>
              }
            />
          </Route>
        </Route>
        <Route path="login">
          <Route
            index
            element={
              <Vista>
                <Login />
              </Vista>
            }
          />
        </Route>
        <Route path="logout">
          <Route
            index
            element={
              <Vista>
                <Logout />
              </Vista>
            }
          />
        </Route>
        <Route path="usuario">
          <Route path="perfil">
            <Route
              index
              element={
                <Vista>
                  <Perfil />
                </Vista>
              }
            />
          </Route>
        </Route>
        <Route path="docs/componentes" element={<Historias />} />
        <Route path="eventos">
          <Route path="evento">
            <Route
              index
              element={
                <Vista>
                  <MaestroConDetalleEvento />
                </Vista>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
