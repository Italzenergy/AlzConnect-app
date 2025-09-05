import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Sheet.css";

export default function TechnicalSheets() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: ""
  });
  const [assignFormData, setAssignFormData] = useState({
    customer_id: ""
  });

  // 🔎 Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Determinar la URL base de la API
  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === "development") {
      return "https://alzconnect-server.onrender.com";
    }
    return window.location.origin;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

  // Cargar fichas técnicas y clientes
  useEffect(() => {
    fetchSheets();
    if (user.role === "admin" || user.role === "logistica") {
      fetchClientes();
    }
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/sheets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error(
          "El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API."
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar fichas técnicas");
      }

      setSheets(data.sheets || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const clientesActivos = data.filter(
          (cliente) => cliente.status === "active"
        );
        setClientes(clientesActivos);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchAssignments = async (sheetId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customersheets/sheet/${sheetId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error("El servidor respondió con HTML en lugar de JSON.");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar asignaciones");
      }

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching assignments:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingSheet
        ? `${API_BASE_URL}/api/sheets/${editingSheet.id}`
        : `${API_BASE_URL}/api/sheets`;

      const method = editingSheet ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error(
          "El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API."
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar ficha técnica");
      }

      setShowModal(false);
      setEditingSheet(null);
      setFormData({
        name: "",
        url: "",
      });
      fetchSheets();
    } catch (err) {
      setError(err.message);
      console.error("Error saving sheet:", err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSheet || !assignFormData.customer_id) {
      setError("Selecciona una ficha y un cliente");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customersheets/${assignFormData.customer_id}/sheets/${selectedSheet.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error(
          "El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API."
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al asignar ficha técnica");
      }

      setShowAssignModal(false);
      setAssignFormData({
        customer_id: "",
      });
      setSelectedSheet(null);

      alert("Ficha técnica asignada correctamente");
    } catch (err) {
      setError(err.message);
      console.error("Error assigning sheet:", err);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta ficha técnica? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error(
          "El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API."
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar ficha técnica");
      }

      fetchSheets();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting sheet:", err);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta asignación?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customersheets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseText = await response.text();

      if (
        responseText.startsWith("<!DOCTYPE") ||
        responseText.startsWith("<html")
      ) {
        throw new Error("El servidor respondió con HTML en lugar de JSON.");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar asignación");
      }

      fetchAssignments(selectedSheet.id);
    } catch (err) {
      setError(err.message);
      console.error("Error deleting assignment:", err);
    }
  };

  const handleEdit = (sheet) => {
    setEditingSheet(sheet);
    setFormData({
      name: sheet.name || "",
      url: sheet.url || "",
    });
    setShowModal(true);
  };

  const handleAssign = (sheet) => {
    setSelectedSheet(sheet);
    setShowAssignModal(true);
  };

  const handleViewAssignments = (sheet) => {
    setSelectedSheet(sheet);
    fetchAssignments(sheet.id);
    setShowAssignmentsModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSheet(null);
    setFormData({
      name: "",
      url: "",
    });
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedSheet(null);
    setAssignFormData({
      customer_id: "",
    });
  };

  const handleCloseAssignmentsModal = () => {
    setShowAssignmentsModal(false);
    setSelectedSheet(null);
    setAssignments([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Cargando fichas técnicas...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchSheets} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  // 📌 Aplicar filtro de búsqueda
  const filteredSheets = sheets.filter((sheet) =>
    sheet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sheets-container">
      <div className="page-header">
        <h2>Gestión de Documentos</h2>
        {(user.role === "admin" || user.role === "logistica") && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nuevo documento
          </button>
        )}
      </div>

      {/* 🔎 Input de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar ficha técnica por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="sheets-table-container">
        <table className="sheets-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>URL/Enlace</th>
              <th>Subido por</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  {filteredSheets.length === 0 ? (
    <tr>
      <td colSpan="5" className="no-data">
        No hay Documentos que coincidan con la búsqueda
      </td>
    </tr>
  ) : (
    filteredSheets.map((sheet) => (
      <tr key={sheet.id}>
        <td data-label="Nombre">{sheet.name}</td>
        <td data-label="URL/Enlace">
          <a
            href={sheet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sheet-link"
          >
            {sheet.url.length > 40
              ? `${sheet.url.substring(0, 40)}...`
              : sheet.url}
          </a>
        </td>
        <td data-label="Subido por">{sheet.uploaded_by_name}</td>
        <td data-label="Fecha de Creación">{formatDate(sheet.created_at)}</td>
        <td data-label="Acciones">
          <div className="action-buttons">
            <a
              href={sheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view"
            >
              Ver
            </a>
            {(user.role === "admin" || user.role === "logistica") && (
              <>
                <button
                  className="btn-assign"
                  onClick={() => handleAssign(sheet)}
                >
                  Asignar
                </button>
                <button
                  className="btn-assignments"
                  onClick={() => handleViewAssignments(sheet)}
                >
                  Asignaciones
                </button>
              </>
            )}
            {user.role === "admin" && (
              <>
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(sheet)}
                >
                  Editar
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(sheet.id)}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

   {/* Modal para crear/editar ficha técnica */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingSheet ? "Editar Ficha Técnica" : "Nueva Ficha Técnica"}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="sheet-form">
              <div className="form-group">
                <label htmlFor="name">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nombre de la ficha técnica"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="url">URL/Enlace:</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  placeholder="https://ejemplo.com/ficha.pdf"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingSheet ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar ficha a cliente */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                Asignar Documentos a un Cliente
              </h3>
              <button className="close-btn" onClick={handleCloseAssignModal}>×</button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="sheet-form">
              <div className="form-group">
                <label htmlFor="customer_id">Cliente:</label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={assignFormData.customer_id}
                  onChange={handleAssignInputChange}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseAssignModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver asignaciones de ficha */}
      {showAssignmentsModal && selectedSheet && (
  <div className="modal-overlay">
    <div className="modal large-modal">
      <div className="modal-header">
        <h3>
          Asignaciones de Documentos
        </h3>
        <button className="close-btn" onClick={handleCloseAssignmentsModal}>×</button>
      </div>
      
      <div className="assignments-content">
        {assignments.length === 0 ? (
          <p>No hay asignaciones de documentos.</p>
        ) : (
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Fecha de Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>{assignment.customer_name}</td>
                  <td>{assignment.email}</td>
                  <td>{assignment.phone}</td>
                  <td>{formatDate(assignment.assigned_at)}</td>
                  <td>
                    {user.role === "admin" && (
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
