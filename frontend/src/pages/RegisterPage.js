import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Furnishly.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--clr-cream)' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '48px 40px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 15 }}>Join the Furnishly family</p>
          </div>
          <form onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
            ].map(({ name, label, type, placeholder }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={placeholder} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} required />
              </div>
            ))}
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--clr-text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--clr-gold)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
