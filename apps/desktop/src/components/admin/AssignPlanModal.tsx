import React, { useState } from 'react';
import { SubscriptionPlan, User } from '@fontastic/shared-types';
import { X, CreditCard } from 'lucide-react';
import { api } from '../../api';

interface AssignPlanModalProps {
  user: User | null;
  plans: SubscriptionPlan[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignPlanModal: React.FC<AssignPlanModalProps> = ({ user, plans, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !user) return null;

  const currentPlanId = typeof user.planId === 'object' && user.planId ? (user.planId as any)._id : user.planId || '';
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId);
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.request(`/admin/users/${user._id}/plan`, {
        method: 'PUT',
        body: JSON.stringify({
          planId: selectedPlanId || null,
          durationDays
        })
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 8, color: '#10b981' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Assign Subscription Plan</h2>
              <p style={{ fontSize: 13, color: '#64748b' }}>For {user.name} ({user.email})</p>
            </div>
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
              Select Subscription Tier
            </label>
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Revoke Access / Set to Free Guest</option>
              {plans.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} — ৳{p.priceBDT}/{p.period} ({p.searchesPerWeek ? `${p.searchesPerWeek} searches/wk` : 'Unlimited'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Duration (Days from Today)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              style={{ width: '100%' }}
              value={durationDays}
              onChange={e => setDurationDays(parseInt(e.target.value, 10) || 30)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
