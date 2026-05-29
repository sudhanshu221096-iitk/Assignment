import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id)
      .then(res => setOrder(res.data))
      .catch(err => { toast.error(err.message); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Cancel/Delete order #${id}?`)) return;
    try {
      await orderService.delete(id);
      toast.success('Order cancelled');
      navigate('/orders');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" />Loading order...</div>;
  if (!order) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/orders" style={{ color: '#718096', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Orders</Link>
          <h1 className="page-title" style={{ marginTop: '0.25rem' }}>Order #{order.id}</h1>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}>Cancel Order</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><strong>Order Info</strong></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Order ID', value: `#${order.id}` },
                { label: 'Status', value: <span className={`badge ${order.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>{order.status}</span> },
                { label: 'Total Amount', value: <strong>${order.total_amount.toFixed(2)}</strong> },
                { label: 'Created', value: new Date(order.created_at).toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ marginTop: '0.25rem' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><strong>Customer Info</strong></div>
          <div className="card-body">
            {order.customer ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {[
                  { label: 'Name', value: order.customer.full_name },
                  { label: 'Email', value: order.customer.email },
                  { label: 'Phone', value: order.customer.phone },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#718096', minWidth: 50 }}>{label}:</span>
                    <span style={{ fontSize: '0.9rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#718096' }}>Customer ID: {order.customer_id}</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>Order Items</strong></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.product?.name || `Product #${item.product_id}`}</td>
                  <td>{item.product?.sku && <code style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: 4 }}>{item.product.sku}</code>}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td><strong>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, padding: '1rem 1.25rem', borderTop: '2px solid #e2e8f0' }}>Total:</td>
                <td style={{ fontWeight: 700, fontSize: '1.1rem', padding: '1rem 1.25rem', borderTop: '2px solid #e2e8f0' }}>${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
