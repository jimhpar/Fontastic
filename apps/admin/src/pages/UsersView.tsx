import React, { useEffect, useState } from 'react';
import { User, SubscriptionPlan } from '@fontastic/shared-types';
import { UserPlus, CreditCard, Ban, CheckCircle, Trash2, Search } from 'lucide-react';
import { api } from '../api';
import { UserModal } from '../components/UserModal';
import { AssignPlanModal } from '../components/AssignPlanModal';

export const UsersView: React.FC = () => {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>User Management</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Manually create accounts, assign subscription tiers, and control access permissions
          </p>
        </div>
        <button onClick={() => setIsUserModalOpen(true)} className="btn-primary">
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
          style={{ width: '100%', paddingLeft: 36 }}
        />
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
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
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  Loading user directory...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(u => {
                const plan = (u as any).plan as SubscriptionPlan | null;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-amber'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {plan ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{plan.name}</div>
                          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>৳ {plan.priceBDT} TK/mo</div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>No active plan</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{u.searchesThisWeek}</span>
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>
                        {plan && plan.searchesPerWeek !== null ? ` / ${plan.searchesPerWeek}` : ' / ∞'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#64748b' }}>
                      {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-rose'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => setAssignUser(u)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          title="Manually Assign or Override Plan"
                        >
                          <CreditCard size={14} /> Assign Plan
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            padding: '6px 10px',
                            fontSize: 12,
                            borderRadius: 6,
                            background: u.isActive ? '#fffbeb' : '#ecfdf5',
                            color: u.isActive ? '#d97706' : '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title={u.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {u.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        {u.email !== 'admin@fontastic.io' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn-danger"
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
        isOpen={!!assignUser}
        onClose={() => setAssignUser(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};
