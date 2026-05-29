import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.get()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading dashboard...</div>;
  if (error) return <div className="loading" style={{ color: '#e53e3e' }}>⚠ {error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div>
            <div className="stat-value">{data.total_products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div>
            <div className="stat-value">{data.total_customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛒</div>
          <div>
            <div className="stat-value">{data.total_orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div>
            <div className="stat-value">{data.low_stock_products.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      {data.low_stock_products.length > 0 && (
        <div className="card low-stock-section">
          <div className="card-header">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e53e3e' }}>⚠ Low Stock Products (≤10 units)</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.low_stock_products.length === 0 && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>All products have sufficient stock</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
