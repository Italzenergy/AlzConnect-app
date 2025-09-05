import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
useEffect(() => {
  console.log(user); // Aquí verás si user tiene los datos correctos
}, [user]);
  useEffect(() => {
    
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) && // clic fuera del sidebar
        sidebarOpen // y sidebar está abierto
      ) {
        setSidebarOpen(false); // cerrar sidebar
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);
 
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${sidebarOpen ? "active" : ""}`}
        id="sidebar"
      ><div className="sidebar-logo">
    <img src="/logoalzVerde.jpg" alt="Logo ALZ" />
  </div>
        <h2>Panel Admin</h2>
        <nav>
          <nav>
  <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>🏠 Dashboard</Link>
  <Link to="/admin/usuarios" onClick={() => setSidebarOpen(false)}>👤 Usuarios</Link>
  <Link to="/admin/clientes" onClick={() => setSidebarOpen(false)}>📋 Clientes</Link>
  <Link to="/admin/transportistas" onClick={() => setSidebarOpen(false)}>🚛 Transportistas</Link>
  <Link to="/admin/rutas" onClick={() => setSidebarOpen(false)}>📍 Rutas</Link>
  <Link to="/admin/ordenes" onClick={() => setSidebarOpen(false)}>📮​ Ordenes</Link>
  <Link to="/admin/fichas" onClick={() => setSidebarOpen(false)}>📑​​ Documentos</Link>
</nav>

        </nav>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </aside>

      {/* Contenido */}
      <main className="admin-content">
       <header className="admin-header">
  <button className="hamburger" onClick={toggleSidebar}>
    ☰
  </button>
  <h1>Bienvenido {user?.name}</h1>
  <img src="/ALZ.png" alt="Logo ALZ" className="header-logo" />
</header>

        <Outlet />
      </main>
    </div>
  );
}
