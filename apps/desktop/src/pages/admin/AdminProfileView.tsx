import React, { useState } from 'react';
import { User } from '@fontastic/shared-types';
import { ShieldCheck, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, Database, Key } from 'lucide-react';
import { api } from '../../api';

interface AdminProfileViewProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ currentUser, onUserUpdated }) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await api.request('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      setSuccessMessage(res.message || 'Profile updated successfully and synced to MongoDB Atlas!');
      if (res.user) {
        onUserUpdated(res.user);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          <ShieldCheck size={14} /> SECURITY & CREDENTIALS
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Administrator Profile & Password</h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Manage root administrator credentials, update email address, and change system access password
        </p>
      </div>

      {/* Cloud Status Banner */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#10b981', color: 'white', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>MongoDB Atlas Cloud Storage Active</div>
            <div style={{ fontSize: 12, color: '#047857' }}>All credential updates sync instantly to your online cloud database.</div>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: 99 }}>
          Live Online
        </span>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '14px 18px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '14px 18px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile & Password Form */}
      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 18, padding: 32, boxShadow: 'var(--shadow-card)' }}>
        {/* Section 1: Basic Info */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserIcon size={18} color="#2563eb" /> Administrator Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Admin Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Fontastic Administrator"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@fontastic.io"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

        {/* Section 2: Password Change */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={18} color="#2563eb" /> Change Password
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Leave blank if you only want to update your name or email. To change your password, enter your current and new password.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Current Password (required only if setting a new password)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current admin password"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                New Password (minimum 6 characters)
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="showPasswordsToggle"
              checked={showPasswords}
              onChange={e => setShowPasswords(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="showPasswordsToggle" style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
              Show passwords in plain text
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            {loading ? 'Saving to Cloud...' : 'Save & Sync Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
