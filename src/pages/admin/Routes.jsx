import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Routes.css";

export default function Rutas() {
  const { user } = useAuth();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingRuta, setEditingRuta] = useState(null);
  const [rutaDetalles, setRutaDetalles] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    order_id: "",
    carrier_id: "",
    source_address: "",
    destination_address: "",
    departure_date: "",
    estimated_delivery_date: "",
    comment: "",
    cost: ""
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://alzconnect-server.onrender.com';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    fetchRutas();
    fetchOrdenes();
    fetchTransportistas();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchRutas = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/router`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRutas(data.routes || []);
    } catch (err) {
      setError("Error al cargar las rutas. Por favor, intenta más tarde.");
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdenes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrdenes(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchTransportistas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/carriers`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransportistas(data.carriers || []);
      }
    } catch (err) {
      console.error("Error fetching carriers:", err);
    }
  };

  const fetchRutaDetalles = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/router/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al cargar detalles de la ruta");
      }
      
      const data = await response.json();
      setRutaDetalles(data.route);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching route details:", err);
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
      const url = editingRuta 
        ? `${API_BASE_URL}/api/router/${editingRuta.id}`
        : `${API_BASE_URL}/api/router`;
      
      const method = editingRuta ? "PUT" : "POST";
      
      // Preparar datos para enviar, asegurando que cost sea un número
      const dataToSend = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null
      };
      
      // Si es edición, solo enviar los campos editables
      if (editingRuta) {
        delete dataToSend.order_id;
        delete dataToSend.carrier_id;
        delete dataToSend.source_address;
        delete dataToSend.departure_date;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || "Error al guardar ruta");
      }
      
      // Cerrar modal y recargar datos
      setShowModal(false);
      setEditingRuta(null);
      setFormData({
        order_id: "",
        carrier_id: "",
        source_address: "",
        destination_address: "",
        departure_date: "",
        estimated_delivery_date: "",
        comment: "",
        cost: ""
      });
      
      fetchRutas();
      
    } catch (err) {
      setError(err.message);
      console.error("Error saving route:", err);
    }
  };

  const handleEdit = (ruta) => {
    setEditingRuta(ruta);
    setFormData({
      order_id: ruta.order_id,
      carrier_id: ruta.carrier_id,
      source_address: ruta.source_address,
      destination_address: ruta.destination_address,
      departure_date: ruta.departure_date ? ruta.departure_date.split('T')[0] : "",
      estimated_delivery_date: ruta.estimated_delivery_date ? ruta.estimated_delivery_date.split('T')[0] : "",
      comment: ruta.comment || "",
      cost: ruta.cost || ""
    });
    setShowModal(true);
  };

  const handleViewDetails = (ruta) => {
    fetchRutaDetalles(ruta.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRuta(null);
    setFormData({
      order_id: "",
      carrier_id: "",
      source_address: "",
      destination_address: "",
      departure_date: "",
      estimated_delivery_date: "",
      comment: "",
      cost: ""
    });
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setRutaDetalles(null);
  };

  const getOrdenTracking = (orderId) => {
    const orden = ordenes.find(o => o.id === orderId);
    return orden ? orden.tracking_code : "N/A";
  };

  const getTransportistaNombre = (carrierId) => {
    const transportista = transportistas.find(t => t.id === carrierId);
    return transportista ? transportista.name : "N/A";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) return <div className="loading">Cargando rutas...</div>;
  
  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchRutas} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="rutas-container">
      <div className="page-header">
        <h2>Gestión de Rutas</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          {isMobile ? "+" : "+ Nueva Ruta"}
        </button>
      </div>

      <div className="rutas-table-container">
        {isMobile ? (
          // Vista móvil - Cards
          <div className="mobile-rutas-list">
            {rutas.length === 0 ? (
              <div className="no-data">No hay rutas registradas</div>
            ) : (
              rutas.map(ruta => (
                <div key={ruta.id} className="ruta-card">
                  <div className="ruta-card-header">
                    <h4>Pedido: {getOrdenTracking(ruta.order_id)}</h4>
                    <span className={`status-badge ${ruta.state}`}>
                      {ruta.state === 'pending' && 'Pendiente'}
                      {ruta.state === 'in_transit' && 'En tránsito'}
                      {ruta.state === 'delivered' && 'Entregado'}
                      {ruta.state === 'cancelled' && 'Cancelado'}
                    </span>
                  </div>
                  
                  <div className="ruta-card-details">
                    <div className="detail-row">
                      <span className="detail-label">Transportista:</span>
                      <span className="detail-value">{getTransportistaNombre(ruta.carrier_id)}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Origen:</span>
                      <span className="detail-value">{ruta.source_address}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Destino:</span>
                      <span className="detail-value">{ruta.destination_address}</span>
                    </div>
                    
                    {(user.role === "admin" || user.role === "logistica") && (
                      <div className="detail-row">
                        <span className="detail-label">Costo:</span>
                        <span className="detail-value">{formatCurrency(ruta.cost)}</span>
                      </div>
                    )}
                    
                    <div className="detail-row">
                      <span className="detail-label">Creación:</span>
                      <span className="detail-value">{new Date(ruta.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="ruta-card-actions">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(ruta)}
                    >
                      Ver
                    </button>
                    {user.role === "admin" && (
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(ruta)}
                        disabled={ruta.state === "cancelled"}
                        title={ruta.state === "cancelled" ? "No se puede editar una ruta cancelada" : ""}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Vista desktop - Tabla
          <table className="rutas-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Transportista</th>
                <th>Dirección Origen</th>
                <th>Dirección Destino</th>
                {(user.role === "admin" || user.role === "logistica") && <th>Costo</th>}
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rutas.length === 0 ? (
                <tr>
                  <td colSpan={(user.role === "admin" || user.role === "logistica") ? 7 : 6} className="no-data">
                    No hay rutas registradas
                  </td>
                </tr>
              ) : (
                rutas.map(ruta => (
                  <tr key={ruta.id}>
                    <td>{getOrdenTracking(ruta.order_id)}</td>
                    <td>{getTransportistaNombre(ruta.carrier_id)}</td>
                    <td>{ruta.source_address}</td>
                    <td>{ruta.destination_address}</td>
                    {(user.role === "admin" || user.role === "logistica") && (
                      <td>{formatCurrency(ruta.cost)}</td>
                    )}
                    <td>{new Date(ruta.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => handleViewDetails(ruta)}
                        >
                          Ver
                        </button>
                        {user.role === "admin" && (
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(ruta)}
                            disabled={ruta.state === "cancelled"}
                            title={ruta.state === "cancelled" ? "No se puede editar una ruta cancelada" : ""}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para crear/editar ruta */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal responsive-modal">
            <div className="modal-header">
              <h3>
                {editingRuta ? "Editar Ruta" : "Nueva Ruta"}
              </h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="ruta-form">
              {!editingRuta && (
                <>
                  <div className="form-group">
                    <label htmlFor="order_id">Pedido:</label>
                    <select
                      id="order_id"
                      name="order_id"
                      value={formData.order_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar pedido</option>
                      {ordenes.map(orden => (
                        <option key={orden.id} value={orden.id}>
                          {orden.tracking_code} - {orden.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="carrier_id">Transportista:</label>
                    <select
                      id="carrier_id"
                      name="carrier_id"
                      value={formData.carrier_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar transportista</option>
                      {transportistas
                        .filter(t => t.state === "available")
                        .map(transportista => (
                          <option key={transportista.id} value={transportista.id}>
                            {transportista.name} - {transportista.contact}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="source_address">Dirección de Origen:</label>
                    <input
                      type="text"
                      id="source_address"
                      name="source_address"
                      value={formData.source_address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="departure_date">Fecha de Salida:</label>
                    <input
                      type="date"
                      id="departure_date"
                      name="departure_date"
                      value={formData.departure_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label htmlFor="destination_address">Dirección de Destino:</label>
                <input
                  type="text"
                  id="destination_address"
                  name="destination_address"
                  value={formData.destination_address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="estimated_delivery_date">Fecha Estimada de Entrega:</label>
                <input
                  type="date"
                  id="estimated_delivery_date"
                  name="estimated_delivery_date"
                  value={formData.estimated_delivery_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Campo de costo solo para admin y logística */}
              {(user.role === "admin" || user.role === "logistica") && (
                <div className="form-group">
                  <label htmlFor="cost">Costo de la Ruta:</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="comment">Comentario:</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRuta ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalles de la ruta */}
      {showDetailModal && rutaDetalles && (
        <div className="modal-overlay">
          <div className="modal responsive-modal">
            <div className="modal-header">
              <h3>Detalles de la Ruta</h3>
              <button className="close-btn" onClick={handleCloseDetailModal}>×</button>
            </div>
            
            <div className="detail-content">
              <div className="detail-item">
                <label>Código de Seguimiento:</label>
                <span>{rutaDetalles.order_tracking}</span>
              </div>
              
              <div className="detail-item">
                <label>Transportista:</label>
                <span>{rutaDetalles.carrier_name}</span>
              </div>
              
              <div className="detail-item">
                <label>Contacto del Transportista:</label>
                <span>{rutaDetalles.carrier_phone}</span>
              </div>
              
              <div className="detail-item">
                <label>Dirección de Origen:</label>
                <span>{rutaDetalles.source_address}</span>
              </div>
              
              <div className="detail-item">
                <label>Dirección de Destino:</label>
                <span>{rutaDetalles.destination_address}</span>
              </div>

              {/* Mostrar costo solo para admin y logística */}
              {(user.role === "admin" || user.role === "logistica") && (
                <div className="detail-item">
                  <label>Costo de la Ruta:</label>
                  <span>{formatCurrency(rutaDetalles.cost)}</span>
                </div>
              )}
              
              <div className="detail-item">
                <label>Estado del Pedido:</label>
                <span className={`status-badge ${rutaDetalles.state}`}>
                  {rutaDetalles.state === 'pending' && 'Pendiente'}
                  {rutaDetalles.state === 'in_transit' && 'En tránsito'}
                  {rutaDetalles.state === 'delivered' && 'Entregado'}
                  {rutaDetalles.state === 'cancelled' && 'Cancelado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}