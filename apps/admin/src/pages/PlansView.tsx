import React, { useEffect, useState } from 'react';
import { SubscriptionPlan } from '@fontastic/shared-types';
import { Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../api';
import { PlanModal } from '../components/PlanModal';

export const PlansView: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await api.request('/plans/admin');
      setPlans(data.plans);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setModalOpen(true);
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) return;
    try {
      await api.request(`/plans/${plan._id}`, { method: 'DELETE' });
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Subscription Plans</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Configure pricing tiers in BDT (৳), adjust weekly search limits, and update member benefits
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus size={16} /> Create New Plan
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Loading subscription tiers...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {plans.map(plan => (
            <div
              key={plan._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 28,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {plan.searchesPerWeek === null && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Zap size={12} /> MOST POPULAR
                </div>
              )}

              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>৳ {plan.priceBDT}</span>
                  <span style={{ fontSize: 14, color: '#64748b' }}>TK / month</span>
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#2563eb'
                }}>
                  <ShieldCheck size={16} />
                  {plan.searchesPerWeek ? `${plan.searchesPerWeek} Visual Searches per week` : 'Unlimited Visual Searches'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => handleEdit(plan)}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '7px 12px' }}
                >
                  <Edit2 size={14} /> Edit Plan
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="btn-danger"
                  style={{ padding: '7px 12px' }}
                  title="Delete Plan"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      <PlanModal
        plan={editingPlan}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchPlans}
      />
    </div>
  );
};
