import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, CreditCard, LogOut, Shield, Sparkles } from 'lucide-react';
import { User } from '@fontastic/shared-types';
import { api } from './api';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './pages/DashboardView';
import { UsersView } from './pages/UsersView';
import { PlansView } from './pages/PlansView';
import { AiSettingsView } from './pages/AiSettingsView';

type Tab = 'dashboard' | 'users' | 'plans' | 'ai-settings';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const res = await api.request('/auth/me');
        if (res.user && res.user.role === 'admin') {
          setCurrentUser(res.user);
        } else {
          api.clearToken();
        }
      } catch (err) {
        api.clearToken();
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Verifying administrator session...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">F</div>
          <div className="brand-text">
            <h1>Fontastic</h1>
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={18} />
            Users & Quotas
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`}
          >
            <CreditCard size={18} />
            Subscription Tiers
          </button>

          <button
            onClick={() => setActiveTab('ai-settings')}
            className={`nav-item ${activeTab === 'ai-settings' ? 'active' : ''}`}
            style={{
              color: activeTab === 'ai-settings' ? '#2563eb' : '#475569'
            }}
          >
            <Sparkles size={18} color={activeTab === 'ai-settings' ? '#2563eb' : '#8b5cf6'} />
            AI Vision Engine
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={12} color="#2563eb" /> Administrator
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: '#ef4444', padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {activeTab === 'dashboard' && 'Control Dashboard'}
            {activeTab === 'users' && 'User Directory & Subscriptions'}
            {activeTab === 'plans' && 'Subscription Plans (BDT)'}
            {activeTab === 'ai-settings' && 'AI Vision Engine Configuration'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="badge badge-green">API Connected</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>Port 4000</span>
          </div>
        </header>

        <main className="page-container">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'plans' && <PlansView />}
          {activeTab === 'ai-settings' && <AiSettingsView />}
        </main>
      </div>
    </div>
  );
};
