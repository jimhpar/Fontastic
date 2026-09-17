import React, { useState } from 'react';
import { SubscriptionPlan } from '@fontastic/shared-types';
import { X, UserPlus } from 'lucide-react';
import { api } from '../api';

interface UserModalProps {
  plans: SubscriptionPlan[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ plans, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [planId, setPlanId] = useState(plans[0]?._id || '');
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.request('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          planId: planId || null,
          durationDays
        })
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#eff6ff', padding: 8, borderRadius: 8, color: '#2563eb' }}>
              <UserPlus size={20} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manual User Creation</h2>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: 10, background: '#fef2f2', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              required
              style={{ width: '100%' }}
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              style={{ width: '100%' }}
              placeholder="sarah@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Initial Password
            </label>
            <input
              type="password"
              required
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Account Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                style={{ width: '100%' }}
              >
                <option value="user">Normal User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Assign Subscription Plan
            </label>
            <select
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">No Plan (Inactive)</option>
              {plans.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.priceBDT} TK/mo - {p.searchesPerWeek ? `${p.searchesPerWeek} searches/wk` : 'Unlimited'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
