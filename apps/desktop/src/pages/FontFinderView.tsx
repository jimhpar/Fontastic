import React, { useState } from 'react';
import { Crop, Upload, Sparkles, Zap, Globe, Layers } from 'lucide-react';
import { VisualSearchMatch } from '@fontastic/shared-types';
import { api } from '../api';

interface FontFinderViewProps {
  onOpenViewfinder: () => void;
  onSearchComplete: (matches: VisualSearchMatch[], text: string) => void;
  onStartSearch?: (imageBase64: string, nameHint?: string) => void;
}

export const FontFinderView: React.FC<FontFinderViewProps> = ({
  onOpenViewfinder,
  onSearchComplete,
  onStartSearch
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const hint = file.name.replace(/\.[^/.]+$/, '');
      if (onStartSearch) {
        onStartSearch(base64, hint);
      } else {
        setUploading(true);
        try {
          const res = await api.request('/vision/search', {
            method: 'POST',
            body: JSON.stringify({
              imageBase64: base64,
              device: 'desktop',
              correctedText: hint
            })
          });
          onSearchComplete(res.matches, res.detectedText);
        } catch (err: any) {
          alert(err.message || 'Recognition failed');
        } finally {
          setUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: 24,
        padding: '40px 48px',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32
      }}>
        <div style={{ maxWidth: 540 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <Sparkles size={14} /> AI-POWERED VISUAL TYPOGRAPHY FINDER
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 12 }}>
            Find visually matching fonts from any screen or photo
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
            Activate the transparent viewfinder, select any area on your screen, and let Fontastic scour
            Google Fonts, DaFont, Adobe Fonts, and MyFonts for exact typographic twins with similarity confidence scores.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <button
              onClick={onOpenViewfinder}
              className="viewfinder-hero-btn"
              style={{ fontSize: 15, padding: '13px 26px', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              <Crop size={20} /> Snip Screen Area (F9 or Ctrl+Shift+F)
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
              <span>Global Shortcut:</span>
              <kbd style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#1e293b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>F9</kbd>
              <span>or</span>
              <kbd style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#1e293b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Ctrl + Shift + F</kbd>
              <span>(Works anywhere across Windows)</span>
            </div>
          </div>
        </div>

        {/* Visual Graphic */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--shadow-hover)',
          textAlign: 'center',
          minWidth: 220
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>SEARCHING LIBRARIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: '#0284c7', background: '#e0f2fe', padding: '6px 12px', borderRadius: 8 }}>Google Fonts (Free)</span>
            <span style={{ color: '#d97706', background: '#fef3c7', padding: '6px 12px', borderRadius: 8 }}>DaFont Library</span>
            <span style={{ color: '#dc2626', background: '#fee2e2', padding: '6px 12px', borderRadius: 8 }}>Adobe Fonts CC</span>
            <span style={{ color: '#7c3aed', background: '#f3e8ff', padding: '6px 12px', borderRadius: 8 }}>MyFonts Commercial</span>
          </div>
        </div>
      </div>

      {/* Alternative: Upload Image Crop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#2563eb' : '#cbd5e1'}`,
          borderRadius: 20,
          background: dragOver ? '#eff6ff' : '#ffffff',
          padding: 40,
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Upload size={24} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          Or upload an existing typography image / screenshot
        </h3>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          PNG, JPG, or WEBP up to 25MB. Real-world mobile photos supported!
        </p>

        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          padding: '10px 20px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          color: '#334155',
          cursor: 'pointer'
        }}>
          <Upload size={16} />
          {uploading ? 'Analyzing Image...' : 'Choose Image File'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
};
