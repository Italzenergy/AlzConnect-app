// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // Si no hay usuario, redirige a login
  if (!user) return <Navigate to="/login" replace />;

  // Si el rol del usuario está permitido, deja pasar
  if (allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  // Si está logueado pero no tiene permiso => acceso denegado
  return <Navigate to="/login" replace />;
}
