import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Styles/Dashboard.css";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://alzconnect-server.onrender.com/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else if (res.data.orders) {
          setOrders(res.data.orders);
        } else {
          setOrders([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  );

  const totalOrders = orders.length;
  const cancelledOrders = orders.filter(o => o.state === "cancelled").length;
  const inTransitOrders = orders.filter(o => o.state === "in_transit").length;
  const pendingOrders = orders.filter(o => o.state === "pending").length;

  // Calcular porcentajes
  const calcPercent = (value) => totalOrders ? (value / totalOrders) * 100 : 0;

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header">
        <h2>Estadísticas de Órdenes</h2>
        <p>Resumen del estado actual de las órdenes</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <h3>Total</h3>
            <span className="stat-number">{totalOrders}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cancelled">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Canceladas</h3>
            <span className="stat-number">{cancelledOrders}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Pendientes</h3>
            <span className="stat-number">{pendingOrders}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon transit">
            <i className="fas fa-shipping-fast"></i>
          </div>
          <div className="stat-info">
            <h3>En tránsito</h3>
            <span className="stat-number">{inTransitOrders}</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Distribución de Órdenes</h3>
        <div className="bar-chart-modern">
          <div className="bar">
            <div className="bar-label">Total</div>
            <div className="bar-track">
              <div 
                className="bar-fill total" 
                style={{ width: `${calcPercent(totalOrders)}%` }}
              ></div>
            </div>
            <div className="bar-value">{totalOrders}</div>
          </div>
          
          <div className="bar">
            <div className="bar-label">Canceladas</div>
            <div className="bar-track">
              <div 
                className="bar-fill cancelled" 
                style={{ width: `${calcPercent(cancelledOrders)}%` }}
              ></div>
            </div>
            <div className="bar-value">{cancelledOrders}</div>
          </div>
          
          <div className="bar">
            <div className="bar-label">Pendientes</div>
            <div className="bar-track">
              <div 
                className="bar-fill pending" 
                style={{ width: `${calcPercent(pendingOrders)}%` }}
              ></div>
            </div>
            <div className="bar-value">{pendingOrders}</div>
          </div>
          
          <div className="bar">
            <div className="bar-label">En tránsito</div>
            <div className="bar-track">
              <div 
                className="bar-fill transit" 
                style={{ width: `${calcPercent(inTransitOrders)}%` }}
              ></div>
            </div>
            <div className="bar-value">{inTransitOrders}</div>
          </div>
        </div>
      </div>
    </div>
  );
}