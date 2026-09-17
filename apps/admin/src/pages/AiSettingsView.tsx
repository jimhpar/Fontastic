import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle, AlertCircle, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export const AiSettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.request('/admin/ai-settings');
      setIsConfigured(res.isConfigured);
      setMaskedKey(res.maskedKey || '');
    } catch (err: any) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.request('/admin/ai-settings', {
        method: 'POST',
        body: JSON.stringify({ apiKey })
      });
      setMessage({ type: 'success', text: res.message || 'Settings saved successfully' });
      setApiKey('');
      fetchSettings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update API key' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const res = await api.request('/admin/ai-settings/test', {
        method: 'POST',
        body: JSON.stringify({ apiKey: apiKey || undefined })
      });
      setMessage({ type: 'success', text: res.message || 'Connection verified successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Connection test failed. Please verify the API key.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10, color: '#2563eb' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              AI Vision Engine Configuration
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Manage global Google Gemini 3.6 Flash Multimodal Vision settings for all Fontastic desktop & mobile users.
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div style={{
        background: isConfigured ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${isConfigured ? '#bbf7d0' : '#fde68a'}`,
        borderRadius: 14,
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConfigured ? (
            <CheckCircle size={24} color="#16a34a" />
          ) : (
            <AlertCircle size={24} color="#d97706" />
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: isConfigured ? '#166534' : '#92400e' }}>
              {isConfigured ? 'Global AI Engine Active & Connected' : 'AI Engine Not Configured (Using Local Fallback)'}
            </div>
            <div style={{ fontSize: 13, color: isConfigured ? '#15803d' : '#b45309', marginTop: 2 }}>
              {isConfigured
                ? `System key: ${maskedKey} — All desktop & mobile visual font searches automatically use Gemini 3.6 Flash Vision.`
                : 'Users are currently relying on local heuristic image analysis. Configure an API key below to unlock internet-wide recognition.'}
            </div>
          </div>
        </div>

        {isConfigured && (
          <button
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#ffffff',
              border: '1px solid #86efac',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              color: '#166534',
              cursor: testing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>
        )}
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#b91c1c',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Configuration Form Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: 28,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          Set Server Google Gemini API Key
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          You can obtain a 100% free API key from Google AI Studio without credit card or billing. Once saved, this key powers the entire platform. Users will not need to enter any API keys.
        </p>

        <form onSubmit={handleSaveKey}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Gemini API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={isConfigured ? 'Paste new key to replace existing...' : 'AIzaSy... (Paste Google AI Studio API Key)'}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
              <Key size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <span>Get Free API Key on Google AI Studio</span>
              <ExternalLink size={13} />
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              {isConfigured && (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Clear the stored Gemini API key? The system will revert to local heuristic vision.')) {
                      await api.request('/admin/ai-settings', { method: 'POST', body: JSON.stringify({ apiKey: '' }) });
                      fetchSettings();
                    }
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#dc2626',
                    cursor: 'pointer'
                  }}
                >
                  Clear Key
                </button>
              )}

              <button
                type="submit"
                disabled={saving || !apiKey}
                style={{
                  padding: '10px 20px',
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: saving || !apiKey ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save & Activate Global AI'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
