import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); 
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
  });
  const [editing, setEditing] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Obtener clientes desde el backend
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("https://alzconnect-server.onrender.com/api/customers/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      alert("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = editing
      ? `https://alzconnect-server.onrender.com/api/customers/profile/${editing}`
      : "https://alzconnect-server.onrender.com/api/customers/profile";

    try {
      if (editing) {
        await axios.put(endpoint, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Cliente actualizado correctamente");
      } else {
        await axios.post(endpoint, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Cliente creado correctamente");
      }
      fetchCustomers();
      setForm({
        name: "",
        email: "",
        phone: "",
        status: "active",
        password: "",
      });
      setEditing(null);
    } catch (err) {
      console.error("Error guardando cliente:", err);
      alert("Error guardando cliente");
    }
  };

  // Eliminar cliente
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente?")) return;

    try {
      await axios.delete(`https://alzconnect-server.onrender.com/api/customers/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchCustomers();
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      alert("Error eliminando cliente");
    }
  };

  // Editar cliente
  const handleEdit = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      password: "", // ⚡ ahora puedes escribir nueva contraseña si quieres cambiarla
    });
    setEditing(customer.id);
  };

  // Expandir/contraer detalles del cliente
  const toggleCustomerDetails = (customerId) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerId);
    }
  };

  // Obtener los clientes cuando el componente se monta
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtrar clientes por nombre o correo
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="customers-page">
      <h2>📦 Gestión de Clientes</h2>

      {/* 🔍 Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre o correo..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Formulario para Crear o Editar Clientes */}
      <form onSubmit={handleSubmit} className="customer-form">
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
        {/* 🔑 Ahora la contraseña también se puede editar */}
        <input
          type="password"
          placeholder="Contraseña (dejar vacío para no cambiar)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        <button type="submit">
          {editing ? "Actualizar Cliente" : "Crear Cliente"}
        </button>
        {editing && (
          <button type="button" onClick={() => setEditing(null)}>
            Cancelar Edición
          </button>
        )}
      </form>

      {/* Mostrar los clientes */}
      {loading ? (
        <p>Cargando clientes...</p>
      ) : filteredCustomers.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <div className="customers-list">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div
                className="customer-summary"
                onClick={() => toggleCustomerDetails(customer.id)}
              >
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <p>📧 {customer.email}</p>
                  <p>📞 {customer.phone}</p>
                  <p>
                    Estado:{" "}
                    {customer.status === "active" ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <div className="customer-actionss">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(customer);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(customer.id);
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                  <span className="toggle-icon">
                    {expandedCustomer === customer.id ? "▼" : "►"}
                  </span>
                </div>
              </div>

              {expandedCustomer === customer.id && (
                <div className="customer-details">
                  {/* Pedidos del cliente */}
                  <div className="details-section">
                    <h4>
                      📦 Pedidos ({customer.orders ? customer.orders.length : 0})
                    </h4>
                    {customer.orders && customer.orders.length > 0 ? (
                      <div className="orders-list">
                        {customer.orders.map((order) => (
                          <div key={order.id} className="order-item">
                            <p>
                              <strong>Código de seguimiento:</strong>{" "}
                              {order.tracking_code}
                            </p>
                            <p>
                              <strong>Descripción:</strong> {order.description}
                            </p>
                            <p>
                              <strong>Estado:</strong> {order.state}
                            </p>
                            <p>
                              <strong>Fecha creación:</strong>{" "}
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>

                            {/* Eventos del pedido */}
                            {order.order_events &&
                              order.order_events.length > 0 && (
                                <div className="order-events">
                                  <h5>Historial de Eventos:</h5>
                                  {order.order_events.map((event) => (
                                    <div key={event.id} className="event-item">
                                      <p>
                                        <strong>Estado:</strong> {event.state} -{" "}
                                        <strong>Nota:</strong> {event.note}
                                      </p>
                                      <p>
                                        <small>
                                          {new Date(
                                            event.date
                                          ).toLocaleString()}
                                        </small>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Rutas del pedido */}
                            {order.routes && order.routes.length > 0 && (
                              <div className="order-routes">
                                <h5>Rutas:</h5>
                                {order.routes.map((route) => (
                                  <div key={route.id} className="route-item">
                                    <p>
                                      <strong>De:</strong> {route.source_address}{" "}
                                      <strong>A:</strong>{" "}
                                      {route.destination_address}
                                    </p>
                                    <p>
                                      <strong>Transportista:</strong>{" "}
                                      {route.carrier_name}
                                    </p>
                                    <p>
                                      <strong>Salida:</strong>{" "}
                                      {new Date(
                                        route.departure_date
                                      ).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Entrega estimada:</strong>{" "}
                                      {new Date(
                                        route.estimated_delivery_date
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Este cliente no tiene pedidos.</p>
                    )}
                  </div>

                  {/* Fichas técnicas del cliente */}
                  <div className="details-section">
                    <h4>
                      📄 Documentos(
                      {customer.technical_sheets
                        ? customer.technical_sheets.length
                        : 0}
                      )
                    </h4>
                    {customer.technical_sheets &&
                    customer.technical_sheets.length > 0 ? (
                      <div className="sheets-list">
                        {customer.technical_sheets.map((sheet) => (
                          <div key={sheet.id} className="sheet-item">
                            <p>
                              <strong>Nombre:</strong> {sheet.name}
                            </p>
                            <p>
                              <strong>URL:</strong>{" "}
                              <a
                                href={sheet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {sheet.url}
                              </a>
                            </p>
                            <p>
                              <strong>Asignada el:</strong>{" "}
                              {new Date(sheet.assigned_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Este cliente no tiene fichas técnicas asignadas.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
