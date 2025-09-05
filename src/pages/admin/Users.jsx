import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";  // Cambié la importación aquí
import axios from "axios";
import "./Users.css";

export default function Users() {
  const [successMessage, setSuccessMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
  });
  const [editing, setEditing] = useState(null);

  const API_URL = "https://alzconnect-server.onrender.com/api/users";

  // Obtener token desde localStorage
  const token = localStorage.getItem("token");

  // Decodificar el token para obtener el ID del usuario autenticado
  let authenticatedUserId = null;
  if (token) {
    const decodedToken = jwtDecode(token);  // Decodificando el token con jwtDecode
    authenticatedUserId = decodedToken.id; // Asume que el token tiene el ID del usuario como `id`
  }

  // Validar que el token exista
  useEffect(() => {
    if (!token) {
      alert("Sesión expirada o no autenticada. Por favor, inicia sesión.");
      window.location.href = "/login"; // redirige al login si no hay token
    }
  }, [token]);

  // Configuración de Axios con token
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Obtener usuarios desde el backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, axiosConfig);
      console.log("Respuesta de la API:", res.data);

      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        setUsers([res.data]);
      } else {
        console.error("La respuesta no es ni un arreglo ni un objeto de usuario:", res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err.response?.data || err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Sesión no autorizada. Vuelve a iniciar sesión.");
        window.location.href = "/login";
      } else {
        alert("Error desconocido al cargar los usuarios.");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crear o actualizar usuario
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const userData = { ...form };

    if (editing && !form.password) {
      // Elimina la contraseña si no fue cambiada
      delete userData.password;
    }

    if (editing) {
  await axios.put(`${API_URL}/${editing}`, userData, axiosConfig);
  setSuccessMessage(` El usuario "${form.name}" fue actualizado de manera correcta.`);
  setTimeout(() => setSuccessMessage(""), 4000); // Ocultar después de 4 segundos
} else {
  await axios.post(API_URL, userData, axiosConfig);
}


    setForm({ name: "", email: "", phone: "", role: "user", password: "" });
    setEditing(null);
    fetchUsers();
  } catch (err) {
    console.error("Error guardando usuario:", err.response?.data || err);
    alert("Error guardando usuario. Verifica permisos o datos duplicados.");
  }
};


  // Eliminar usuario
  const handleDelete = async (id) => {
    // Verifica que el usuario no intente eliminarse a sí mismo
    if (id === authenticatedUserId) {
      alert("No puedes eliminar tu propio usuario.");
      return;
    }

    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, axiosConfig);
      fetchUsers();
    } catch (err) {
      console.error("Error eliminando usuario:", err.response?.data || err);
      alert("No se pudo eliminar el usuario. Verifica permisos.");
    }
  };

  return (
    <div className="users-page">
      <h2>👤 Gestión de Usuarios</h2>
      {successMessage && (
  <div className="success-alert">
    {successMessage}
  </div>
)}
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">Logística</option>
          <option value="admin">Admin</option>
        </select>
      
          <input
           type="password"
           placeholder={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
           value={form.password}
           onChange={(e) => setForm({ ...form, password: e.target.value })}
           required
          />
     
        <button type="submit">
          {editing ? "Actualizar" : "Crear"} usuario
        </button>
      </form>

      {/* Tabla */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
               <td>
  <button
    onClick={() => {
      setForm({ ...u, password: "" });
      setEditing(u.id);
    }}
  >
    ✏️ Editar
  </button>

  {u.id !== authenticatedUserId && (
    <button onClick={() => handleDelete(u.id)}>
      🗑️ Eliminar
    </button>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
