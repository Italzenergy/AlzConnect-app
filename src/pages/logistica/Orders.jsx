import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Select from "react-select";
import "./Orders.css";

export default function Pedidos() {
 const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [historialPedido, setHistorialPedido] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    tracking_code: "",
    description: "",
    state: "pending"
  });
  const [eventFormData, setEventFormData] = useState({
    event_type: "Alistando pedido",
    note: ""
  });

  // Opciones de eventos con colores personalizados
  const eventOptions = [
    { value: "Alistando pedido", label: "Alistando pedido", color: "#1976d2" },
    { value: "Se despacho el pedido", label: "Se despachó el pedido", color: "#2e7d32" },
    { value: "En transito", label: "En tránsito", color: "#ef6c00" },
    { value: "En transito con novedad", label: "En tránsito con novedad", color: "#d84315" },
    { value: "El vehículo llega a la ciudad de destino", label: "El vehículo llega a la ciudad de destino", color: "#6a1b9a" },
    { value: "En reparto", label: "En reparto", color: "#0288d1" },
    { value: "En reparto con novedad", label: "En reparto con novedad", color: "#c62828" },
    { value: "Entregado", label: "Entregado", color: "#388e3c" }
  ];

  const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === "development") {
      return "https://alzconnect-server.onrender.com";
    }
    return window.location.origin;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();


  // Cargar pedidos y clientes
  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al cargar pedidos");
      }
      
      setPedidos(data.orders || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo clientes activos
        const clientesActivos = data.filter(cliente => cliente.status === 'active');
        setClientes(clientesActivos);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchPedidoDetalles = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al cargar detalles del pedido");
      }
      
      setSelectedPedido(data.order);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order details:", err);
    }
  };

  const fetchHistorialPedido = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/events`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al cargar historial del pedido");
      }
      
      setHistorialPedido(data);
      setShowEventModal(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order history:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleEventInputChange = (option) => {
    setEventFormData((prev) => ({
      ...prev,
      event_type: option.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingPedido 
        ? `${API_BASE_URL}/api/orders/${editingPedido.id}`
        : `${API_BASE_URL}/api/orders`;
      
      const method = editingPedido ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al guardar pedido");
      }
      
      // Cerrar modal y recargar datos
      setShowModal(false);
      setEditingPedido(null);
      setFormData({
        customer_id: "",
        tracking_code: "",
        description: "",
        state: "pending"
      });
      fetchPedidos();
      
    } catch (err) {
      setError(err.message);
      console.error("Error saving order:", err);
    }
  };

 const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPedido || !selectedPedido.id) {
      setError("No se ha seleccionado ningún pedido");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedPedido.id}/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(eventFormData)
      });
      
      const responseText = await response.text();
      
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error("El servidor respondió con HTML en lugar de JSON. Verifica la configuración de la API.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("La respuesta del servidor no es JSON válido");
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Error al agregar evento");
      }
      
      // Cerrar modal y resetear formulario
      setShowEventModal(false);
      setEventFormData({
        event_type: "Alistando pedido",
        note: ""
      });
      
      // Recargar el historial para mostrar el nuevo evento
      fetchHistorialPedido(selectedPedido.id);
      
    } catch (err) {
      setError(err.message);
      console.error("Error adding event:", err);
    }
  };


  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setFormData({
      customer_id: pedido.customer_id || "",
      tracking_code: pedido.tracking_code || "",
      description: pedido.description || "",
      state: pedido.state || "pending"
    });
    setShowModal(true);
  };

  const handleViewDetails = (pedido) => {
    fetchPedidoDetalles(pedido.id);
  };

  const handleViewHistory = (pedido) => {
    fetchHistorialPedido(pedido.id);
  };

 const handleAddEvent = (pedido) => {
    setSelectedPedido(pedido);
    setEventFormData({
      event_type: "Alistando pedido",
      note: ""
    });
    
    // Limpiar historial previo antes de cargar el nuevo
    setHistorialPedido(null);
    
    // Cargar el historial del pedido seleccionado
    fetchHistorialPedido(pedido.id);
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPedido(null);
    setFormData({
      customer_id: "",
      tracking_code: "",
      description: "",
      state: "pending"
    });
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPedido(null);
  };

const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedPedido(null);
    setHistorialPedido(null);
    setEventFormData({
      event_type: "Alistando pedido",
      note: ""
    });
  };
const getEstadoBadgeClass = (state) => {
  switch (state) {
    case "pending":
      return "estado-badge pending";
    case "in_transit":
      return "estado-badge in-transit";
    case "delivered":
      return "estado-badge delivered";
    case "cancelled":
      return "estado-badge cancelled";
    default:
      return "estado-badge";
  }
};

const getEstadoTexto = (state) => {
  switch (state) {
    case "pending": return "Pendiente";
    case "in_transit": return "En tránsito";
    case "delivered": return "Entregado";
    case "cancelled": return "Cancelado";
    default: return state;
  }
};

const getEventTypeBadgeClass = (type) => {
  switch (type) {
    case "pickup":
      return "evento-badge pickup";
    case "delivery":
      return "evento-badge delivery";
    case "incident":
      return "evento-badge incident";
    default:
      return "evento-badge";
  }
};

  if (loading) return <div className="loading">Cargando pedidos...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchPedidos} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="page-header">
        <h2>Gestión de Pedidos</h2>
        {(user.role === "admin" || user.role === "logistica") && (
          <button   
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Nuevo Pedido
          </button>
        )}
      </div>

      <div className="pedidos-table-container">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Código de Seguimiento</th>
              <th>Descripción</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  {pedidos.length === 0 ? (
    <tr>
      <td colSpan="6" className="no-data">
        No hay pedidos registrados
      </td>
    </tr>
  ) : (
    pedidos.map(pedido => (
      <tr key={pedido.id}>
        <td data-label="Código">{pedido.tracking_code}</td>
        <td data-label="Descripción">{pedido.description}</td>
        <td data-label="Cliente">{pedido.customer_name}</td>
        <td data-label="Estado">
          <span className={getEstadoBadgeClass(pedido.state)}>
            {getEstadoTexto(pedido.state)}
          </span>
        </td>
        <td data-label="Creado el">
          {new Date(pedido.created_at).toLocaleDateString()}
        </td>
        <td data-label="Acciones">
          <div className="action-buttons">
            <button className="btn-view" onClick={() => handleViewDetails(pedido)}>Ver</button>
            {(user.role === "admin" || user.role === "logistica") && (
              <>
                <button className="btn-event" onClick={() => handleAddEvent(pedido)}>Evento</button>
                <button className="btn-edit" onClick={() => handleEdit(pedido)}>Editar</button>
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

      {/* Modal para crear/editar pedido */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingPedido ? "Editar Pedido" : "Nuevo Pedido"}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="pedido-form">
              <div className="form-group">
                <label htmlFor="customer_id">Cliente:</label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingPedido}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.name} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="tracking_code">Código de Seguimiento:</label>
                <input
                  type="text"
                  id="tracking_code"
                  name="tracking_code"
                  value={formData.tracking_code}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingPedido}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              {editingPedido && (
                <div className="form-group">
                  <label htmlFor="state">Estado:</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_transit">En tránsito</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingPedido ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del pedido */}
      {showDetailModal && selectedPedido && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Detalles del Pedido</h3>
              <button className="close-btn" onClick={handleCloseDetailModal}>×</button>
            </div>
            
            <div className="detail-content">
              <div className="detail-item">
                <label>Código de Seguimiento:</label>
                <span>{selectedPedido.tracking_code}</span>
              </div>
              
              <div className="detail-item">
                <label>Descripción:</label>
                <span>{selectedPedido.description}</span>
              </div>
              
              <div className="detail-item">
                <label>Cliente:</label>
                <span>{selectedPedido.customer_name}</span>
              </div>
              
              <div className="detail-item">
                <label>Usuario Responsable:</label>
                <span>{selectedPedido.user_name}</span>
              </div>
              
              <div className="detail-item">
                <label>Estado:</label>
                <span className={getEstadoBadgeClass(selectedPedido.state)}>
                  {getEstadoTexto(selectedPedido.state)}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Fecha de Creación:</label>
                <span>{new Date(selectedPedido.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>)}

         {showEventModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>
                {selectedPedido && `Historial y Eventos - ${selectedPedido.tracking_code}`}
              </h3>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
            </div>

            <div className="event-content">
              {!historialPedido ? (
                <div className="loading">Cargando historial...</div>
              ) : (
                <>
                  <div className="history-section">
                    <h4>Historial de Eventos</h4>
                   {historialPedido.events.map((evento) => {
  // Buscar la opción correspondiente al evento
  const option = eventOptions.find(opt => opt.value === evento.event_type);

  return (
    <div key={evento.id} className="event-item">
      <div className="event-state">
        <span
          style={{
            backgroundColor: option ? option.color + "20" : "#eee",
            color: option ? option.color : "#333",
            padding: "4px 10px",
            borderRadius: "12px",
            fontWeight: "600",
            display: "inline-block",
            minWidth: "120px",
            textAlign: "center"
          }}
        >
          {evento.event_type}
        </span>
      </div>
      <div className="event-note">{evento.note}</div>
    </div>
  );
})}

                  </div>

                  <div className="add-event-section">
                    <h4>Agregar Nuevo Evento</h4>
                    <form onSubmit={handleEventSubmit} className="event-form">
                      <div className="form-group">
                        <label htmlFor="event_type">Tipo de Evento:</label>
                        <Select
                          id="event_type"
                          name="event_type"
                          value={eventOptions.find(
                            (opt) => opt.value === eventFormData.event_type
                          )}
                          onChange={handleEventInputChange}
                          options={eventOptions}
                          getOptionLabel={(option) => (
                            <div
                              style={{
                                backgroundColor: option.color + "20",
                                color: option.color,
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontWeight: "600"
                              }}
                            >
                              {option.label}
                            </div>
                          )}
                          getOptionValue={(option) => option.value}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="event_note">Nota (opcional):</label>
                        <textarea
                          id="event_note"
                          name="note"
                          value={eventFormData.note}
                          onChange={(e) =>
                            setEventFormData((prev) => ({
                              ...prev,
                              note: e.target.value
                            }))
                          }
                          rows="3"
                          placeholder="Describe el evento o cambio de estado..."
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          Agregar Evento
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}