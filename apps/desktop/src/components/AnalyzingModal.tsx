import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Search, CheckCircle2, X } from 'lucide-react';

interface AnalyzingModalProps {
  isOpen: boolean;
  imageThumbnail: string | null;
  onCancel?: () => void;
}

export const AnalyzingModal: React.FC<AnalyzingModalProps> = ({
  isOpen,
  imageThumbnail,
  onCancel
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'Extracting character contours & stroke weights', sub: 'Isolating typographic anatomy...' },
    { text: 'Analyzing glyph geometry with Google Gemini 3.6 Flash', sub: 'Cross-referencing serif, sans, script & display traits...' },
    { text: 'Scouring universal font libraries & ranking similarity', sub: 'Fetching exact typographic twins & download links...' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scanBeam {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 92%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
          50% { box-shadow: 0 0 28px rgba(37, 99, 235, 0.75); }
        }
        @keyframes rotateSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: '36px 40px',
        width: '90%',
        maxWidth: 520,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {onCancel && (
          <button
            onClick={onCancel}
            title="Cancel search"
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 99,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          color: '#1d4ed8',
          padding: '6px 16px',
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 20,
          border: '1px solid #bfdbfe'
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#2563eb',
            boxShadow: '0 0 8px #2563eb',
            display: 'inline-block'
          }} />
          <Sparkles size={14} /> AI Visual Vision Engine Active
        </div>

        {/* Thumbnail with Scanning Beam */}
        {imageThumbnail && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxHeight: 140,
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid #e2e8f0',
            background: '#0f172a',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <img
              src={imageThumbnail}
              alt="Captured Typography"
              style={{
                maxWidth: '100%',
                maxHeight: 140,
                objectFit: 'contain',
                display: 'block'
              }}
            />
            {/* Laser Scan Line */}
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, transparent 0%, #38bdf8 30%, #2563eb 50%, #38bdf8 70%, transparent 100%)',
              boxShadow: '0 0 12px #38bdf8, 0 0 20px #2563eb',
              animation: 'scanBeam 1.8s ease-in-out infinite',
              pointerEvents: 'none'
            }} />
          </div>
        )}

        {/* Headline */}
        <h3 style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: 8,
          letterSpacing: '-0.02em'
        }}>
          Identifying Font & Typography...
        </h3>

        {/* Subtitle / Description */}
        <p style={{
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.5,
          marginBottom: 24,
          maxWidth: 400
        }}>
          Analyzing stroke weight, apertures, and x-height against millions of typeface weights.
        </p>

        {/* Dynamic Progress Pipeline */}
        <div style={{
          width: '100%',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textAlign: 'left'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #bfdbfe',
            borderTopColor: '#2563eb',
            animation: 'rotateSpinner 0.9s linear infinite',
            flexShrink: 0
          }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {steps[stepIndex].text}
            </div>
            <div style={{
              fontSize: 12,
              color: '#64748b',
              marginTop: 2
            }}>
              {steps[stepIndex].sub}
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div style={{
          marginTop: 18,
          fontSize: 12,
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Cpu size={14} /> Powered by Google Gemini 3.6 Flash & Fontastic Typographic Index
        </div>
      </div>
    </div>
  );
};
