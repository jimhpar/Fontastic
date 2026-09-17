import React, { useState, useEffect } from 'react';
import { FontItem, FontCategory, FontSource } from '@fontastic/shared-types';
import { Download, Heart, HardDrive, Check, Sliders, Type } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

interface FontManagerViewProps {
  userWishlist: string[];
  onToggleWishlist: (fontId: string) => void;
}

export const FontManagerView: React.FC<FontManagerViewProps> = ({ userWishlist, onToggleWishlist }) => {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(32);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [installedFonts, setInstalledFonts] = useState<Record<string, boolean>>({});
  const [installingId, setInstallingId] = useState<string | null>(null);

  const fetchFonts = async () => {
    try {
      setLoading(true);
      let query = '';
      const params: string[] = [];
      if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
      if (selectedSource !== 'all') params.push(`source=${selectedSource}`);
      if (params.length > 0) query = '?' + params.join('&');

      const data = await api.request(`/fonts${query}`);
      setFonts(data.fonts);
    } catch (err) {
      console.error('Failed to load fonts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, [selectedCategory, selectedSource]);

  const handleInstallFont = (font: FontItem) => {
    setInstallingId(font._id);
    setTimeout(() => {
      setInstalledFonts(prev => ({ ...prev, [font._id]: true }));
      setInstallingId(null);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 700);
  };

  const categories = [
    { id: 'all', label: 'All Styles' },
    { id: 'sans-serif', label: 'Sans-Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'display', label: 'Display' },
    { id: 'monospace', label: 'Monospace' },
    { id: 'handwriting', label: 'Script' }
  ];

  const sources = [
    { id: 'all', label: 'All Libraries' },
    { id: 'google', label: 'Google Fonts' },
    { id: 'dafont', label: 'DaFont' },
    { id: 'adobe', label: 'Adobe Fonts' },
    { id: 'myfonts', label: 'MyFonts' }
  ];

  return (
    <div>
      {/* Playground Controls Bar */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              placeholder="Type custom text to preview typography..."
              style={{ width: '100%', paddingLeft: 38, fontSize: 15 }}
            />
            <Type size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
            <Sliders size={16} color="#64748b" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', width: 42 }}>{fontSize}px</span>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          {/* Category Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: selectedCategory === cat.id ? '#2563eb' : '#f8fafc',
                  color: selectedCategory === cat.id ? 'white' : '#475569',
                  border: `1px solid ${selectedCategory === cat.id ? '#2563eb' : '#e2e8f0'}`
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Source Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {sources.map(src => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.id)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: selectedSource === src.id ? '#eff6ff' : '#ffffff',
                  color: selectedSource === src.id ? '#2563eb' : '#64748b',
                  border: `1px solid ${selectedSource === src.id ? '#bfdbfe' : '#e2e8f0'}`
                }}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Cards Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          Loading font catalog...
        </div>
      ) : fonts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          No fonts found matching the selected filters.
        </div>
      ) : (
        <div className="font-grid">
          {fonts.map(font => {
            const isFav = userWishlist.includes(font._id) || userWishlist.includes(font.family);
            const isInstalled = !!installedFonts[font._id];
            const isInstalling = installingId === font._id;

            return (
              <div key={font._id} className="font-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{font.family}</h3>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                        {font.category} · {font.license || 'Open Font'}
                      </span>
                    </div>

                    <span className={`badge-source source-${font.source}`}>
                      {font.source.toUpperCase()}
                    </span>
                  </div>

                  {/* Render Font Typography */}
                  <div
                    className="font-preview-area"
                    style={{
                      fontFamily: font.family,
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.2
                    }}
                  >
                    {previewText}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => onToggleWishlist(font._id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isFav ? '#ef4444' : '#64748b'
                    }}
                  >
                    <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#64748b'} />
                    {isFav ? 'Favorited' : 'Favorite'}
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {font.downloadUrl && (
                      <a
                        href={font.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={13} />
                        {font.source === 'google' || font.source === 'dafont' ? 'Download' : 'License'}
                      </a>
                    )}

                    <button
                      onClick={() => handleInstallFont(font)}
                      disabled={isInstalled || isInstalling}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: isInstalled ? '#10b981' : '#2563eb',
                        color: 'white'
                      }}
                    >
                      {isInstalled ? (
                        <>
                          <Check size={13} /> Installed
                        </>
                      ) : isInstalling ? (
                        'Installing...'
                      ) : (
                        <>
                          <HardDrive size={13} /> 1-Click Install
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
