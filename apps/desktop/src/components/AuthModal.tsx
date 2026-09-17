import React, { useState } from 'react';
import { User } from '@fontastic/shared-types';
import { X, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const res = await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      api.setToken(res.token);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.70)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isRegister ? 'Create Fontastic Account' : 'Sign In to Fontastic'}
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: '#475569', marginBottom: 24, lineHeight: 1.5 }}>
          {isRegister
            ? 'Sync your wishlist, collections, and custom font previews across all devices.'
            : 'Access your cloud font collections and visual search quotas.'}
        </p>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: 8,
            marginBottom: 18,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <UserIcon size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="alex@designer.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Free Account' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#64748b' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              color: '#2563eb',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
};
