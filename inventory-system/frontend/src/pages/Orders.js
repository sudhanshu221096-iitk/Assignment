import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService, customerService, productService } from '../services/api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAll()
      .then(res => setOrders(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    customerService.getAll().then(r => setCustomers(r.data)).catch(() => {});
    productService.getAll().then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const openCreate = () => { setCustomerId(''); setItems([{ product_id: '', quantity: 1 }]); setErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const getEstimatedTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === Number(item.product_id));
      if (!product || !item.quantity) return sum;
      return sum + product.price * Number(item.quantity);
    }, 0);
  };

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Please select a customer';
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) e.items = 'At least one valid item required';
    items.forEach((item, idx) => {
      if (item.product_id) {
        const product = products.find(p => p.id === Number(item.product_id));
        if (product && Number(item.quantity) > product.quantity) {
          e[`item_${idx}`] = `Only ${product.quantity} units available`;
        }
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      customer_id: Number(customerId),
      items: items.filter(i => i.product_id && i.quantity > 0).map(i => ({
        product_id: Number(i.product_id),
        quantity: Number(i.quantity)
      }))
    };
    try {
      await orderService.create(payload);
      toast.success('Order created!');
      closeModal();
      fetchOrders();
      productService.getAll().then(r => setProducts(r.data));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel/Delete order #${id}?`)) return;
    try {
      await orderService.delete(id);
      toast.success('Order cancelled');
      fetchOrders();
      productService.getAll().then(r => setProducts(r.data));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🛒</div><p>No orders yet. Create your first order!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><Link to={`/orders/${o.id}`} style={{ color: '#1a1a2e', fontWeight: 600, textDecoration: 'none' }}>#{o.id}</Link></td>
                    <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td><span className={`badge ${o.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>{o.status}</span></td>
                    <td style={{ fontSize: '0.82rem', color: '#718096' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Create New Order</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select className="form-control" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                  </select>
                  {errors.customer && <div className="form-error">{errors.customer}</div>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Order Items</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                  </div>
                  {errors.items && <div className="form-error" style={{ marginBottom: '0.5rem' }}>{errors.items}</div>}
                  {items.map((item, idx) => (
                    <div key={idx} className="order-items-input">
                      <div className="order-item-row">
                        <div className="form-group" style={{ flex: 3 }}>
                          <label className="form-label">Product</label>
                          <select className="form-control" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} (${p.price.toFixed(2)}) — {p.quantity} left
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Qty</label>
                          <input className="form-control" type="number" min="1"
                            value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                        </div>
                        {items.length > 1 && (
                          <button type="button" className="btn btn-danger btn-sm" style={{ marginBottom: 0, height: 36, alignSelf: 'flex-end' }} onClick={() => removeItem(idx)}>✕</button>
                        )}
                      </div>
                      {errors[`item_${idx}`] && <div className="form-error">{errors[`item_${idx}`]}</div>}
                      {item.product_id && item.quantity && (
                        <div style={{ fontSize: '0.82rem', color: '#718096' }}>
                          Subtotal: ${(products.find(p => p.id === Number(item.product_id))?.price * Number(item.quantity) || 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Estimated Total:</span>
                    <span>${getEstimatedTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
