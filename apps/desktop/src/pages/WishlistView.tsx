import React, { useState, useEffect } from 'react';
import { FontItem } from '@fontastic/shared-types';
import { Download, Heart, HardDrive, Check, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

interface WishlistViewProps {
  userWishlist: string[];
  onToggleWishlist: (fontId: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ userWishlist, onToggleWishlist }) => {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [installedFonts, setInstalledFonts] = useState<Record<string, boolean>>({});

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await api.request('/user/wishlist');
      setFonts(data.wishlist || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userWishlist]);

  const handleInstallFont = (font: FontItem) => {
    setInstalledFonts(prev => ({ ...prev, [font._id]: true }));
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Saved Fonts & Wishlist</h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Your bookmarked typographic treasures synced across desktop & mobile
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Loading saved wishlist...
        </div>
      ) : fonts.length === 0 ? (
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
            <Bookmark size={24} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No saved fonts yet</h3>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            When you find fonts via the screen viewfinder or mobile camera, tap the heart icon to save them here.
          </p>
        </div>
      ) : (
        <div className="font-grid">
          {fonts.map(font => {
            const isInstalled = !!installedFonts[font._id];

            return (
              <div key={font._id} className="font-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{font.family}</h3>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                        {font.category}
                      </span>
                    </div>
                    <span className={`badge-source source-${font.source}`}>
                      {font.source.toUpperCase()}
                    </span>
                  </div>

                  <div
                    className="font-preview-area"
                    style={{
                      fontFamily: font.family,
                      fontSize: '28px',
                      lineHeight: 1.2
                    }}
                  >
                    Sphinx of black quartz, judge my vow.
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
                      color: '#ef4444'
                    }}
                  >
                    <Heart size={16} fill="#ef4444" color="#ef4444" /> Remove
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
                        <Download size={13} /> Download
                      </a>
                    )}

                    <button
                      onClick={() => handleInstallFont(font)}
                      disabled={isInstalled}
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
