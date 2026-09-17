import React, { useEffect, useState } from 'react';
import { User, SubscriptionPlan } from '@fontastic/shared-types';
import { UserPlus, CreditCard, Ban, CheckCircle, Trash2, Search, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { UserModal } from '../../components/admin/UserModal';
import { AssignPlanModal } from '../../components/admin/AssignPlanModal';

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, plansRes] = await Promise.all([
        api.request(`/admin/users${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`),
        api.request('/plans/admin')
      ]);
      setUsers(usersRes.users);
      setPlans(plansRes.plans);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.request(`/admin/users/${user._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !user.isActive })
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      await api.request(`/admin/users/${user._id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={14} /> USER MANAGEMENT
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Subscribers & Team Accounts</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Manage user accounts, assign custom subscription tiers, and control access permissions
          </p>
        </div>
        <button onClick={() => setIsUserModalOpen(true)} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
          <UserPlus size={16} /> Add User Manually
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 360 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: 38 }}
        />
        <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Current Plan</th>
              <th>Usage (This Wk)</th>
              <th>Expires</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  Loading subscriber accounts...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  No users found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              users.map(user => {
                const plan = typeof user.planId === 'object' && user.planId ? (user.planId as any) : plans.find(p => p._id === user.planId);
                return (
                  <tr key={user._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-blue' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {plan ? (
                        <span className="badge badge-green">
                          {plan.name} (৳{plan.priceBDT})
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Free Guest</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {user.searchesThisWeek || 0}
                      </span>
                      {plan && plan.searchesPerWeek && (
                        <span style={{ fontSize: 12, color: '#64748b' }}> / {plan.searchesPerWeek}</span>
                      )}
                      {plan && plan.searchesPerWeek === null && (
                        <span style={{ fontSize: 12, color: '#10b981' }}> (∞)</span>
                      )}
                    </td>
                    <td>
                      {user.planExpiresAt ? (
                        <span style={{ fontSize: 12 }}>
                          {new Date(user.planExpiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Permanent</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-rose'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setAssignUser(user)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          title="Assign Subscription Plan"
                        >
                          <CreditCard size={14} /> Plan
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          title={user.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {user.isActive ? <Ban size={14} color="#f59e0b" /> : <CheckCircle size={14} color="#10b981" />}
                        </button>
                        {user.email !== 'admin@fontastic.io' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="btn-danger"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserModal
        plans={plans}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={fetchData}
      />

      <AssignPlanModal
        user={assignUser}
        plans={plans}
        isOpen={Boolean(assignUser)}
        onClose={() => setAssignUser(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};
