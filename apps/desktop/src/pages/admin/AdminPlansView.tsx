import React, { useEffect, useState } from 'react';
import { SubscriptionPlan } from '@fontastic/shared-types';
import { Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { PlanModal } from '../../components/admin/PlanModal';

export const AdminPlansView: React.FC = () => {
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
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={14} /> MONETIZATION & BILLING
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Subscription Plans & Quotas</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Configure pricing tiers in BDT (৳), adjust weekly search limits, and update member benefits
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
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
                borderRadius: 18,
                padding: 28,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{plan.name}</h3>
                    <div style={{ fontSize: 12, color: '#64748b' }}>ID: {plan._id}</div>
                  </div>
                  <span className={`badge ${plan.isActive ? 'badge-green' : 'badge-amber'}`}>
                    {plan.isActive ? 'Active Plan' : 'Archived'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>৳{plan.priceBDT}</span>
                  <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>/{plan.period}</span>
                </div>

                {/* Quota badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
                  <Zap size={15} />
                  {plan.searchesPerWeek === null ? 'Unlimited Searches / Week' : `${plan.searchesPerWeek} Searches / Week`}
                </div>

                {/* Features list */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                    Plan Perks & Inclusions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(plan.features || []).map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155' }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 'auto' }}>
                <button
                  onClick={() => handleEdit(plan)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
                >
                  <Edit2 size={14} /> Edit Plan Details
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="btn-danger"
                  style={{ padding: '8px 12px' }}
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
