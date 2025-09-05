// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, logout as logoutService, getCurrentUser, isAuthenticated } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser(); // Obtén el usuario guardado
    if (isAuthenticated() && storedUser) {
      setUser(storedUser); // Si hay un token y un usuario, lo seteamos en el contexto
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginService(email, password);
    setUser(data.user); // Guardamos el usuario en contexto
    return data;
  };

  const logout = () => {
    logoutService();
    setUser(null); // Eliminar el usuario del contexto
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
