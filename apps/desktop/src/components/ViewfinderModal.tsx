import React, { useState, useRef, useEffect } from 'react';
import { Crop, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { api } from '../api';
import { VisualSearchMatch } from '@fontastic/shared-types';

interface ViewfinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchComplete: (matches: VisualSearchMatch[], detectedText: string) => void;
}

export const ViewfinderModal: React.FC<ViewfinderModalProps> = ({ isOpen, onClose, onSearchComplete }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const SAMPLE_TARGETS = [
    { title: 'Luxury Fashion Magazine', text: 'VOGUE EDITORIAL', font: 'Playfair Display', category: 'Serif' },
    { title: 'Tech Startup Hero Header', text: 'UNLEASH CREATIVITY', font: 'Inter', category: 'Sans-serif' },
    { title: 'Vintage Movie Poster', text: 'METROPOLIS 1984', font: 'Bebas Neue', category: 'Display' },
    { title: 'Handcrafted Bakery Sign', text: 'Sweet Artisan Delights', font: 'Dancing Script', category: 'Handwriting' }
  ];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.controls-bar')) return;
    setIsSelecting(true);
    setHasSelection(false);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCurrentPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    if (width > 30 && height > 20) {
      setHasSelection(true);
    }
  };

  const executeSearch = async () => {
    setLoading(true);
    try {
      const activeSample = SAMPLE_TARGETS[selectedSampleIndex];
      const res = await api.request('/vision/search', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          device: 'desktop',
          correctedText: activeSample.text
        })
      });

      onClose();
      onSearchComplete(res.matches, res.detectedText);
    } catch (err: any) {
      alert(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const selLeft = Math.min(startPos.x, currentPos.x);
  const selTop = Math.min(startPos.y, currentPos.y);
  const selWidth = Math.abs(currentPos.x - startPos.x);
  const selHeight = Math.abs(currentPos.y - startPos.y);

  return (
    <div
      ref={containerRef}
      className="viewfinder-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Instructions header */}
      <div className="viewfinder-instructions controls-bar">
        <Crop size={18} color="#2563eb" />
        <span>Click & drag marquee crosshair over any typography to snip & identify</span>
        <button
          onClick={onClose}
          style={{ marginLeft: 16, color: '#64748b', cursor: 'pointer', background: 'none' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Target Preview Screen */}
      <div
        className="controls-bar"
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '36px 48px',
          maxWidth: 780,
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid #cbd5e1',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 }}>
            TARGET SCREEN SIMULATION
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {SAMPLE_TARGETS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSampleIndex(idx)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: selectedSampleIndex === idx ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${selectedSampleIndex === idx ? '#3b82f6' : '#e2e8f0'}`,
                  color: selectedSampleIndex === idx ? '#2563eb' : '#64748b'
                }}
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Target Typography Content */}
        <div style={{
          padding: '48px 24px',
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px dashed #cbd5e1',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 48,
            fontFamily: SAMPLE_TARGETS[selectedSampleIndex].font,
            color: '#0f172a',
            lineHeight: 1.2,
            letterSpacing: '0.5px'
          }}>
            {SAMPLE_TARGETS[selectedSampleIndex].text}
          </h1>
          <p style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>
            Click and drag your mouse across this text to activate optical recognition
          </p>
        </div>

        {/* Selection Confirmation Bar */}
        {hasSelection && (
          <div style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '12px 18px',
            borderRadius: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
              <Check size={16} /> Area selected ({Math.round(selWidth)} × {Math.round(selHeight)} px)
            </div>
            <button
              onClick={executeSearch}
              disabled={loading}
              className="viewfinder-hero-btn"
              style={{ fontSize: 13 }}
            >
              <Sparkles size={16} /> {loading ? 'Analyzing Typography...' : 'Identify Visual Fonts'}
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Marquee Rectangle */}
      {(isSelecting || hasSelection) && (
        <div
          style={{
            position: 'absolute',
            left: selLeft,
            top: selTop,
            width: selWidth,
            height: selHeight,
            border: '2px dashed #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            pointerEvents: 'none',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: -24,
            left: 0,
            background: '#2563eb',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 4
          }}>
            {Math.round(selWidth)} × {Math.round(selHeight)}
          </div>
        </div>
      )}
    </div>
  );
};
