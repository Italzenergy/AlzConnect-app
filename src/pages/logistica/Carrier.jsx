import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Carrier.css";

export default function Transportistas() {
  const { user } = useAuth();
  const [transportistas, setTransportistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transportistaToDelete, setTransportistaToDelete] = useState(null);
  const [editingTransportista, setEditingTransportista] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    state: "available"
  });

  // Cargar transportistas
  useEffect(() => {
    fetchTransportistas();
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://alzconnect-server.onrender.com';

  const fetchTransportistas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/carriers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Verificar si la respuesta es HTML en lugar de JSON
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al cargar transportistas");
      }
      
      setTransportistas(data.carriers || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching carriers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingTransportista 
        ? `${API_BASE_URL}/api/carriers/${editingTransportista.id}`
        : `${API_BASE_URL}/api/carriers`;
      
      const method = editingTransportista ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      
      // Verificar si la respuesta es HTML en lugar de JSON
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al guardar transportista");
      }
      
      // Cerrar modal y recargar datos
      setShowModal(false);
      setEditingTransportista(null);
      setFormData({ name: "", contact: "", state: "available" });
      fetchTransportistas();
      
    } catch (err) {
      setError(err.message);
      console.error("Error saving carrier:", err);
    }
  };

  const handleEdit = (transportista) => {
    setEditingTransportista(transportista);
    setFormData({
      name: transportista.name,
      contact: transportista.contact,
      state: transportista.state
    });
    setShowModal(true);
  };

  const handleDeleteClick = (transportista) => {
    setTransportistaToDelete(transportista);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carriers/${transportistaToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Verificar si la respuesta es HTML en lugar de JSON
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar transportista");
      }
      
      // Cerrar modal y recargar datos
      setShowDeleteModal(false);
      setTransportistaToDelete(null);
      fetchTransportistas();
      
    } catch (err) {
      setError(err.message);
      console.error("Error deleting carrier:", err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTransportistaToDelete(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransportista(null);
    setFormData({ name: "", contact: "", state: "available" });
  };

  const getStateBadgeClass = (state) => {
    switch (state) {
      case "available": return "state-badge available";
      case "on trip": return "state-badge on-trip";
      case "not available": return "state-badge not-available";
      default: return "state-badge";
    }
  };

  const getStateText = (state) => {
    switch (state) {
      case "available": return "Disponible";
      case "on trip": return "En viaje";
      case "not available": return "No disponible";
      default: return state;
    }
  };

  if (loading) return <div className="loading">Cargando transportistas...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchTransportistas} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="transportistas-container">
      <div className="page-header">
        <h2>Gestión de Transportistas</h2>
        {user.role === "admin" && (
          <button 
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Nuevo Transportista
          </button>
        )}
      </div>

      {/* Vista de tabla para escritorio */}
      <div className="transportistas-table-container">
        <table className="transportistas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Fecha de creación</th>
              {user.role === "admin" && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {transportistas.length === 0 ? (
              <tr>
                <td colSpan={user.role === "admin" ? 5 : 4} className="no-data">
                  No hay transportistas registrados
                </td>
              </tr>
            ) : (
              transportistas.map(transportista => (
                <tr key={transportista.id}>
                  <td>{transportista.name}</td>
                  <td>{transportista.contact}</td>
                  <td>
                    <span className={getStateBadgeClass(transportista.state)}>
                      {getStateText(transportista.state)}
                    </span>
                  </td>
                  <td>{new Date(transportista.created_at).toLocaleDateString()}</td>
                  {user.role === "admin" && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEdit(transportista)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteClick(transportista)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para móviles */}
      <div className="transportistas-cards">
        {transportistas.length === 0 ? (
          <div className="no-data">No hay transportistas registrados</div>
        ) : (
          transportistas.map(transportista => (
            <div key={transportista.id} className="transportista-card">
              <div className="card-row">
                <span className="card-label">Nombre:</span>
                <span>{transportista.name}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Contacto:</span>
                <span>{transportista.contact}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Estado:</span>
                <span className={getStateBadgeClass(transportista.state)}>
                  {getStateText(transportista.state)}
                </span>
              </div>
              <div className="card-row">
                <span className="card-label">Fecha creación:</span>
                <span>{new Date(transportista.created_at).toLocaleDateString()}</span>
              </div>
              {user.role === "admin" && (
                <div className="card-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(transportista)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteClick(transportista)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar transportista */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingTransportista ? "Editar Transportista" : "Nuevo Transportista"}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="transportista-form">
              <div className="form-group">
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contact">Contacto:</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">Estado:</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="on trip">En viaje</option>
                  <option value="not available">No disponible</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingTransportista ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button className="close-btn" onClick={handleDeleteCancel}>×</button>
            </div>
            
            <div className="delete-confirmation">
              <p>¿Estás seguro de que deseas eliminar al transportista <strong>{transportistaToDelete?.name}</strong>?</p>
              <p>Esta acción no se puede deshacer.</p>
              
              <div className="form-actions">
                <button type="button" onClick={handleDeleteCancel}>
                  Cancelar
                </button>
                <button type="button" className="btn-delete" onClick={handleDeleteConfirm}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}