// src/api/auth.js
import axios from "axios";

// cliente base de axios
const api = axios.create({
  baseURL: "https://alzconnect-server.onrender.com/api", 
  withCredentials: true,
});

// login
export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });
  // Guarda el token y el usuario en localStorage
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

// logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// obtener usuario
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// verificar autenticación
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
