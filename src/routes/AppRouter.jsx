// src/routes/AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginAdmin from "../pages/LoginAdmin";
import AdminRouter from "./AdminRouter";
import LogisticaRouter from "./LogisticaRouter";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginAdmin />} />

        {/* Rutas protegidas por rol */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<AdminRouter />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={["logistica"]} />}>
          <Route path="/logistica/*" element={<LogisticaRouter />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
