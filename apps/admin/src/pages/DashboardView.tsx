import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@fontastic/shared-types';
import { Users, CreditCard, Search, Monitor, Smartphone, Flame, Sparkles } from 'lucide-react';
import { api } from '../api';

export const DashboardView: React.FC = () => {
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
        Loading dashboard metrics...
      </div>
    );
  }

  const totalDeviceSearches = (stats.desktopSearchesCount + stats.mobileSearchesCount) || 1;
  const desktopRatio = Math.round((stats.desktopSearchesCount / totalDeviceSearches) * 100);
  const mobileRatio = 100 - desktopRatio;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Platform Overview</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Live system usage, subscriber counts, and visual search volume</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary" style={{ fontSize: 13 }}>
          Refresh Stats
        </button>
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
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Search size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Searches Today</h3>
            <div className="stat-value">{stats.searchesToday}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Grid: Device Breakdown & Popular Fonts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Device Breakdown */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={18} color="#2563eb" /> Search Platform Distribution
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
            Comparison of searches originating from Desktop Viewfinder vs Mobile Camera
          </p>

          <div style={{ height: 12, width: '100%', background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
            <div style={{ width: `${desktopRatio}%`, background: '#2563eb' }} />
            <div style={{ width: `${mobileRatio}%`, background: '#10b981' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#2563eb' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Desktop Viewfinder</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.desktopSearchesCount} searches ({desktopRatio}%)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Mobile Camera / Upload</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.mobileSearchesCount} searches ({mobileRatio}%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Fonts */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} color="#f59e0b" /> Most Identified Fonts
          </h3>

          {stats.popularFonts.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No searches recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.popularFonts.map((font, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>#{idx + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{font.family}</span>
                    <span className="badge badge-blue" style={{ fontSize: 11, textTransform: 'capitalize' }}>
                      {font.source}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {font.searches} matches
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
