import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { User } from '@fontastic/shared-types';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@fontastic.io');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.user.role !== 'admin') {
        throw new Error('Access denied: Administrator privileges required');
      }

      api.setToken(data.token);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          color: 'white',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
        }}>
          <Lock size={24} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Admin Sign In</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          Access the Fontastic control center & subscriber management
        </p>

        {error && (
          <div style={{ padding: 10, background: '#fef2f2', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                style={{ width: '100%', paddingLeft: 36 }}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                style={{ width: '100%', paddingLeft: 36 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
            Pre-filled with root master credentials (<code>admin@fontastic.io</code> / <code>Admin123!</code>)
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
