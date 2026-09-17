import React, { useState, useEffect } from 'react';
import { VisualSearchMatch, FontItem } from '@fontastic/shared-types';
import { X, Download, Heart, Check, Sparkles, ExternalLink, Edit3, Cpu, RefreshCw, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

interface FontResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: VisualSearchMatch[];
  detectedText?: string;
  croppedImage?: string;
  userWishlist: string[];
  onToggleWishlist: (fontId: string) => void;
  engine?: string;
  engineName?: string;
  typographicAnalysis?: {
    category?: string;
    width?: string;
    weight?: string;
    contrast?: string;
    serifType?: string;
    description?: string;
  };
  onRematch?: (text: string) => void;
}

export const FontResultModal: React.FC<FontResultModalProps> = ({
  isOpen,
  onClose,
  matches,
  detectedText,
  croppedImage,
  userWishlist,
  onToggleWishlist,
  engine = 'deep-typographic-vision',
  engineName = 'Typographic Contrast & Geometry Analyzer',
  typographicAnalysis,
  onRematch
}) => {
  const [installedFonts, setInstalledFonts] = useState<Record<string, boolean>>({});
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string>('DREAMCORE');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    if (detectedText && detectedText !== 'SCREEN CAPTURE' && detectedText !== 'FONT SAMPLE') {
      setTextPreview(detectedText);
    }
  }, [detectedText, isOpen]);

  // Dynamically load Google WebFonts so the typography renders authentically
  useEffect(() => {
    matches.forEach(item => {
      const family = item.font.family;
      const id = 'webfont-' + family.replace(/\s+/g, '-');
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [matches]);

  if (!isOpen) return null;

  const handleInstallFont = async (font: FontItem) => {
    setInstallingId(font._id);
    try {
      if ((window as any).electronAPI?.installFont) {
        const res = await (window as any).electronAPI.installFont(font);
        if (res?.success) {
          setInstalledFonts(prev => ({ ...prev, [font._id]: true }));
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        // Fallback when previewing in regular browser
        if (font.downloadUrl) {
          window.open(font.downloadUrl, '_blank');
        }
        setInstalledFonts(prev => ({ ...prev, [font._id]: true }));
      }
    } catch (err) {
      console.error('Failed to install font:', err);
    } finally {
      setInstallingId(null);
    }
  };

  const handleDirectDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if ((window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleTriggerRematch = async () => {
    if (!onRematch) return;
    setIsReanalyzing(true);
    try {
      await onRematch(textPreview);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case 'google': return 'source-google';
      case 'dafont': return 'source-dafont';
      case 'adobe': return 'source-adobe';
      case 'myfonts': return 'source-myfonts';
      default: return 'source-google';
    }
  };

  return (
    <div className="results-modal">
      <div className="results-modal-box" style={{ maxWidth: 900, maxHeight: '92vh' }}>
        {/* Header */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafbfc'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#eff6ff', padding: 6, borderRadius: 8, color: '#2563eb' }}>
                <Sparkles size={18} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Visual Font Matches
              </h2>

              {/* Engine Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: engine === 'gemini-ai' ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${engine === 'gemini-ai' ? '#86efac' : '#cbd5e1'}`,
                color: engine === 'gemini-ai' ? '#15803d' : '#475569',
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700
              }}>
                {engine === 'gemini-ai' ? <Sparkles size={11} /> : <Cpu size={11} />}
                <span>{engineName}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              Ranked visual typographic similarity across Google Fonts, DaFont, Adobe Fonts & MyFonts
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ color: '#94a3b8', padding: 6, borderRadius: 8, cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Captured Snip Image + Detected Text Bar */}
        <div style={{
          padding: '12px 28px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          {croppedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your Snip:
              </span>
              <img
                src={croppedImage}
                alt="Captured typography"
                style={{
                  maxHeight: 42,
                  maxWidth: 220,
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#0f172a',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Detected Text:
            </span>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={textPreview}
                onChange={e => setTextPreview(e.target.value)}
                placeholder="Edit or correct detected text..."
                style={{
                  width: '100%',
                  fontWeight: 800,
                  fontSize: 14,
                  padding: '6px 10px 6px 28px',
                  background: 'white',
                  borderColor: '#cbd5e1',
                  borderRadius: 6
                }}
              />
              <Edit3 size={13} style={{ position: 'absolute', left: 9, top: 10, color: '#94a3b8' }} />
            </div>

            {onRematch && (
              <button
                onClick={handleTriggerRematch}
                disabled={isReanalyzing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isReanalyzing ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={12} className={isReanalyzing ? 'animate-spin' : ''} />
                <span>{isReanalyzing ? 'Matching...' : 'Re-match'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Typographic Breakdown Pills */}
        {typographicAnalysis && (
          <div style={{
            padding: '10px 28px',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Anatomy:
            </span>
            {typographicAnalysis.category && (
              <span style={{ fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                Category: <strong>{typographicAnalysis.category}</strong>
              </span>
            )}
            {typographicAnalysis.width && (
              <span style={{ fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                Proportion: <strong>{typographicAnalysis.width}</strong>
              </span>
            )}
            {typographicAnalysis.contrast && (
              <span style={{ fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                Contrast: <strong>{typographicAnalysis.contrast}</strong>
              </span>
            )}
            {typographicAnalysis.description && (
              <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginLeft: 6 }}>
                "{typographicAnalysis.description}"
              </span>
            )}
          </div>
        )}

        {/* Results List */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              No visual matches found. Try editing the detected text or connecting Gemini AI.
            </div>
          ) : (
            matches.map((item, index) => {
              const font = item.font;
              const isFav = userWishlist.includes(font._id) || userWishlist.includes(font.family);
              const isInstalled = !!installedFonts[font._id];
              const isInstalling = installingId === font._id;

              const fallbackFamily = font.category === 'serif'
                ? 'Georgia, serif'
                : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

              return (
                <div
                  key={font._id || index}
                  style={{
                    border: index === 0 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 20,
                    background: index === 0 ? '#fbfcfe' : '#ffffff',
                    position: 'relative',
                    boxShadow: index === 0 ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none'
                  }}
                >
                  {/* Top Bar: Family, Source, Similarity Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                          {font.family}
                        </h3>
                        <span className={`badge-source ${getSourceBadgeClass(font.source)}`}>
                          {font.source.toUpperCase()}
                        </span>
                        {index === 0 && (
                          <span style={{ background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                            TOP MATCH
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                        {font.category} · {font.license || 'Commercial / Free'}
                      </span>
                    </div>

                    {/* Similarity Badge */}
                    <div style={{
                      background: item.similarity >= 90 ? '#ecfdf5' : '#eff6ff',
                      color: item.similarity >= 90 ? '#059669' : '#2563eb',
                      border: `1px solid ${item.similarity >= 90 ? '#a7f3d0' : '#bfdbfe'}`,
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 14,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Sparkles size={14} />
                      <span>{item.similarity}% SIMILAR</span>
                    </div>
                  </div>

                  {/* Rendered Typography Preview in the candidate font */}
                  <div style={{
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 8,
                    marginBottom: 12,
                    overflowX: 'auto'
                  }}>
                    <p style={{
                      fontFamily: `"${font.family}", ${fallbackFamily}`,
                      fontSize: 32,
                      fontWeight: font.tags?.includes('bold') || font.tags?.includes('ultra-wide') ? 800 : 700,
                      lineHeight: 1.15,
                      color: '#0f172a',
                      margin: 0,
                      letterSpacing: font.tags?.includes('extended') ? '0.06em' : 'normal',
                      whiteSpace: 'nowrap'
                    }}>
                      {textPreview || 'DREAMCORE'}
                    </p>
                  </div>

                  {/* Visual Analysis Traits */}
                  {item.matchedFeatures && item.matchedFeatures.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {item.matchedFeatures.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '3px 8px',
                            borderRadius: 4
                          }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Actions: Wishlist, Download, Install */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => onToggleWishlist(font._id || font.family)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        color: isFav ? '#ef4444' : '#64748b',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
                      <span>{isFav ? 'In Wishlist' : 'Add to Wishlist'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {font.downloadUrl && (
                        <button
                          onClick={e => font.downloadUrl && handleDirectDownload(e, font.downloadUrl)}
                          className="btn-secondary"
                          style={{
                            fontSize: 13,
                            padding: '7px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <Download size={14} />
                          <span>Direct Download</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleInstallFont(font)}
                        disabled={isInstalled || isInstalling}
                        className={isInstalled ? 'btn-secondary' : 'btn-primary'}
                        style={{
                          fontSize: 13,
                          padding: '7px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: isInstalled ? '#f0fdf4' : undefined,
                          borderColor: isInstalled ? '#86efac' : undefined,
                          color: isInstalled ? '#16a34a' : undefined
                        }}
                      >
                        {isInstalled ? (
                          <>
                            <Check size={14} />
                            <span>Installed to OS</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            <span>{isInstalling ? 'Installing...' : 'Install Locally'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
