import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import DashboardAdmin from "../pages/DashboardAdmin";
import Users from "../pages/admin/Users";
import Customers from "../pages/admin/Customers";
import Carrier from"../pages/admin/Carrier";
import Rutas from "../pages/admin/Routes";
import Orders from "../pages/admin/Orders";
import Sheet from "../pages/admin/Sheet";
export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardAdmin />} />
        {/* Aquí más rutas internas */}
        <Route path="usuarios" element={<Users/>} />
        <Route path="clientes" element={<Customers/>} />
        <Route path="transportistas" element={<Carrier/>} />
        <Route path="rutas" element={<Rutas/>} />
        <Route path="ordenes" element={<Orders/>} />
        <Route path="fichas" element={<Sheet/>} />
      </Route>
    </Routes>
  );
}
