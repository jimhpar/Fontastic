import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@fontastic/shared-types';
import { Users, CreditCard, Search, Monitor, Smartphone, Flame, Sparkles, Database } from 'lucide-react';
import { api } from '../../api';

export const AdminOverviewView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.request('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
        Loading platform metrics...
      </div>
    );
  }

  const totalDeviceSearches = (stats.desktopSearchesCount + stats.mobileSearchesCount) || 1;
  const desktopRatio = Math.round((stats.desktopSearchesCount / totalDeviceSearches) * 100);
  const mobileRatio = 100 - desktopRatio;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Sparkles size={14} /> SYSTEM CONTROL CENTER
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Platform Overview & Analytics</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Live system usage, subscriber counts, and cloud database activity</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
            <Database size={14} /> MongoDB Atlas Connected
          </div>
          <button onClick={fetchStats} className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Subscribers</h3>
            <div className="stat-value">{stats.activeSubscribers}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CreditCard size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Searches This Month</h3>
            <div className="stat-value">{stats.totalSearchesThisMonth}</div>
          </div>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Search size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Searches Today</h3>
            <div className="stat-value">{stats.searchesToday}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Flame size={24} />
          </div>
        </div>
      </div>

      {/* Charts & Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Device Distribution */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>Device Traffic Breakdown</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Visual font searches by platform</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                  <Monitor size={16} color="#2563eb" /> Desktop App (Electron)
                </span>
                <span>{stats.desktopSearchesCount} ({desktopRatio}%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${desktopRatio}%`, height: '100%', background: '#2563eb', borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                  <Smartphone size={16} color="#10b981" /> Mobile Companion (Expo)
                </span>
                <span>{stats.mobileSearchesCount} ({mobileRatio}%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${mobileRatio}%`, height: '100%', background: '#10b981', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Most Matched Fonts */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>Most Identified Font Twins</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Top typography matches recognized by the engine</p>

          {stats.popularFonts && stats.popularFonts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.popularFonts.map((font, idx) => (
                <div key={font.family} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', width: 16 }}>#{idx + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{font.family}</span>
                    <span style={{ fontSize: 11, background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize' }}>{font.source}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{font.searches} matches</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No search history recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
