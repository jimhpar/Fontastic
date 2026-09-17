import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@fontastic/shared-types';
import { X, Layers, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';

interface PlanModalProps {
  plan: SubscriptionPlan | null; // null for new plan
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ plan, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [priceBDT, setPriceBDT] = useState(30);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [searchesPerWeek, setSearchesPerWeek] = useState(10);
  const [features, setFeatures] = useState<string[]>(['Desktop & Mobile Viewfinder']);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPriceBDT(plan.priceBDT);
      setIsUnlimited(plan.searchesPerWeek === null);
      setSearchesPerWeek(plan.searchesPerWeek || 10);
      setFeatures(plan.features || []);
    } else {
      setName('');
      setPriceBDT(30);
      setIsUnlimited(false);
      setSearchesPerWeek(10);
      setFeatures(['Desktop & Mobile Viewfinder', 'Local Font Previews']);
    }
    setError('');
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name,
        priceBDT: Number(priceBDT),
        searchesPerWeek: isUnlimited ? null : Number(searchesPerWeek),
        features
      };

      if (plan) {
        // Edit existing plan
        await api.request(`/plans/${plan._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // Create new plan
        await api.request('/plans', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#eff6ff', padding: 8, borderRadius: 8, color: '#2563eb' }}>
              <Layers size={20} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>
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
              Plan Name
            </label>
            <input
              type="text"
              required
              style={{ width: '100%' }}
              placeholder="e.g. Creator Weekly"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Price (BDT ৳ / month)
              </label>
              <input
                type="number"
                min="0"
                required
                style={{ width: '100%' }}
                value={priceBDT}
                onChange={e => setPriceBDT(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Weekly Searches
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  disabled={isUnlimited}
                  style={{ width: '100%', opacity: isUnlimited ? 0.5 : 1 }}
                  value={searchesPerWeek}
                  onChange={e => setSearchesPerWeek(Number(e.target.value))}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginTop: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={e => setIsUnlimited(e.target.checked)}
                />
                Unlimited Searches
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Plan Features & Inclusions
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Add a feature (e.g. Priority AI Recognition)"
                value={newFeatureText}
                onChange={e => setNewFeatureText(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
              />
              <button type="button" onClick={handleAddFeature} className="btn-secondary" style={{ padding: '8px 12px' }}>
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <span>{feat}</span>
                  <button type="button" onClick={() => handleRemoveFeature(idx)} style={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
