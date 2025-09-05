// src/pages/LoginAdmin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Styles/LoginAdmin.css";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      // Usamos el login del contexto de autenticación
      const result = await login(email, password);
      
      setMessage("Login correcto. Redirigiendo...");
      setMessageType("success");
      
      setTimeout(() => {
        if (result.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (result.user.role === "logistica") {
          navigate("/logistica/dashboard");
        } else {
          navigate("/");
        }
      }, 700);
    } catch (error) {
      setMessage("✗ " + (error.message || "Credenciales inválidas"));
      setMessageType("error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="sidebar-logo">
    <img src="/logoalzVerde.jpg" alt="Logo ALZ" />
  </div> 
          <div className="welcome-message">
            <p>ALZ CONNECT</p>
          </div>
           <h1>BIENVENIDO</h1>
        </div>

        <div className="login-box">
          <h2 className="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                placeholder="tu@correo.com"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="login-buttonn">
              Acceder
            </button>
            
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
