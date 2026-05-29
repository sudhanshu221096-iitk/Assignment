import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    productService.getAll()
      .then(res => setProducts(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setEditProduct(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' }); setErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Quantity must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editProduct) {
        await productService.update(editProduct.id, payload);
        toast.success('Product updated!');
      } else {
        await productService.create(payload);
        toast.success('Product created!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const change = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📦</div><p>No products yet. Add your first product!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong>{p.description && <div style={{ fontSize: '0.78rem', color: '#718096' }}>{p.description}</div>}</td>
                    <td><code style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>
                      {p.quantity === 0 ? <span className="badge badge-danger">Out of Stock</span>
                        : p.quantity <= 10 ? <span className="badge badge-warning">Low Stock</span>
                        : <span className="badge badge-success">In Stock</span>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
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
              <span className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {[
                  { label: 'Product Name', field: 'name', type: 'text', placeholder: 'e.g. Widget Pro' },
                  { label: 'SKU / Code', field: 'sku', type: 'text', placeholder: 'e.g. WGT-001' },
                  { label: 'Price ($)', field: 'price', type: 'number', placeholder: '0.00', step: '0.01' },
                  { label: 'Quantity in Stock', field: 'quantity', type: 'number', placeholder: '0' },
                ].map(({ label, field, type, placeholder, step }) => (
                  <div className="form-group" key={field}>
                    <label className="form-label">{label}</label>
                    <input className="form-control" type={type} placeholder={placeholder} step={step}
                      value={form[field]} onChange={e => change(field, e.target.value)} />
                    {errors[field] && <div className="form-error">{errors[field]}</div>}
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea className="form-control" rows={2} placeholder="Brief description..."
                    value={form.description} onChange={e => change('description', e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
