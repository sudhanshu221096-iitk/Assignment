import React, { useEffect, useState } from 'react';
import { customerService } from '../services/api';
import toast from 'react-hot-toast';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    customerService.getAll()
      .then(res => setCustomers(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await customerService.create(form);
      toast.success('Customer added!');
      closeModal();
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      await customerService.delete(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const change = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Customer</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><p>No customers yet. Add your first customer!</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: '#718096', fontSize: '0.8rem' }}>#{c.id}</td>
                    <td><strong>{c.full_name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td style={{ fontSize: '0.82rem', color: '#718096' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.full_name)}>Delete</button>
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
              <span className="modal-title">Add Customer</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {[
                  { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Email Address', field: 'email', type: 'email', placeholder: 'john@example.com' },
                  { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '+1 234 567 8900' },
                ].map(({ label, field, type, placeholder }) => (
                  <div className="form-group" key={field}>
                    <label className="form-label">{label}</label>
                    <input className="form-control" type={type} placeholder={placeholder}
                      value={form[field]} onChange={e => change(field, e.target.value)} />
                    {errors[field] && <div className="form-error">{errors[field]}</div>}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
