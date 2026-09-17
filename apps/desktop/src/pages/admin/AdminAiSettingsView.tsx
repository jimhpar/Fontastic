import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle, AlertCircle, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../api';

export const AdminAiSettingsView: React.FC = () => {
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          <Sparkles size={14} /> AI VISION ENGINE
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Google Gemini AI Configuration</h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Connect Google Gemini Multimodal Vision to enable universal typography identification across the entire platform
        </p>
      </div>

      {/* Notification Banner */}
      {message && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fca5a5'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: 14
        }}>
          {message.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Engine Status Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        padding: 28,
        boxShadow: 'var(--shadow-card)',
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isConfigured ? '#ecfdf5' : '#fffbeb',
              color: isConfigured ? '#10b981' : '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Google Gemini 3.6 Flash Engine</h3>
              <p style={{ fontSize: 13, color: '#64748b' }}>
                {isConfigured ? 'Active — Platform visual searches are powered by Google Multimodal Vision' : 'Inactive — Set an API key below to activate'}
              </p>
            </div>
          </div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            background: isConfigured ? '#ecfdf5' : '#fffbeb',
            color: isConfigured ? '#047857' : '#b45309',
            border: `1px solid ${isConfigured ? '#a7f3d0' : '#fde68a'}`
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isConfigured ? '#10b981' : '#f59e0b'
            }} />
            {isConfigured ? 'Engine Connected' : 'Key Required'}
          </span>
        </div>

        {isConfigured && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active System Key:</span>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#0f172a', fontWeight: 600, marginTop: 2 }}>{maskedKey}</div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary"
              style={{ fontSize: 13 }}
            >
              {testing ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        )}
      </div>

      {/* Set / Change API Key Form */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        padding: 28,
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={18} color="#2563eb" /> {isConfigured ? 'Update Gemini API Key' : 'Enter Gemini API Key'}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          The key will be stored securely in the system database and automatically used for all desktop and mobile font snips without user-facing key prompts.
        </p>

        <form onSubmit={handleSaveKey}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Gemini API Key (starts with AIzaSy...)
            </label>
            <input
              type="password"
              placeholder="Paste Google AI Studio API Key here"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
            >
              <ExternalLink size={14} /> Get a free key at Google AI Studio
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  {testing ? 'Testing...' : 'Test Key Before Saving'}
                </button>
              )}
              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="btn-primary"
                style={{ fontSize: 13 }}
              >
                {saving ? 'Saving...' : 'Save & Activate Key'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
