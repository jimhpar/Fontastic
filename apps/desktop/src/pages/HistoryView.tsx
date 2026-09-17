import React, { useState, useEffect } from 'react';
import { SearchHistoryItem } from '@fontastic/shared-types';
import { History, Sparkles, Monitor, Smartphone, ArrowRight } from 'lucide-react';
import { api } from '../api';

interface HistoryViewProps {
  onSelectSearch: (item: SearchHistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectSearch }) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.request('/user/history');
        setHistory(data.history || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Visual Search History</h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Past screen snips and mobile camera captures with their identified font matches
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Loading your visual search logs...
        </div>
      ) : history.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px dashed #cbd5e1',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: 480,
          margin: '40px auto'
        }}>
          <div style={{ background: '#f8fafc', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
            <History size={24} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No searches yet</h3>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            When you use the screen viewfinder or upload images, your recognized fonts will be archived here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map(item => {
            const topMatch = item.matchedFonts?.[0];

            return (
              <div
                key={item._id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: item.sourceDevice === 'mobile' ? '#ecfdf5' : '#eff6ff',
                    color: item.sourceDevice === 'mobile' ? '#10b981' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.sourceDevice === 'mobile' ? <Smartphone size={22} /> : <Monitor size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        "{item.detectedText || 'Sample Snip'}"
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>
                        {item.sourceDevice.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Top match: <strong style={{ color: '#0f172a' }}>{topMatch?.font.family || 'Unknown'}</strong> ({topMatch?.similarity || 0}% match)
                      {' · '}
                      <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectSearch(item)}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '8px 14px' }}
                >
                  View Matches <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
