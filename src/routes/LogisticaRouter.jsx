// src/routes/LogisticaRouter.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LogisticaLayout from "../components/LogisticaLayout"; // Asegúrate de importar bien
import DashboardAdmin from "../pages/DashboardAdmin";
import Customers from "../pages/logistica/Customers";
import Carrier from"../pages/logistica/Carrier";
import Rutas from "../pages/logistica/Routes";
import Orders from "../pages/logistica/Orders";
import Sheet from "../pages/logistica/Sheet";
export default function LogisticaRouter() {
  return (
    <Routes>
          <Route element={<LogisticaLayout/>}>
            <Route path="dashboard" element={<DashboardAdmin/>} />
            {/* Aquí más rutas internas */}
            <Route path="clientes" element={<Customers/>} />
            <Route path="transportistas" element={<Carrier/>} />
            <Route path="rutas" element={<Rutas/>} />
            <Route path="ordenes" element={<Orders/>} />
            <Route path="fichas" element={<Sheet/>} />
          </Route>
        </Routes>
  );
}
