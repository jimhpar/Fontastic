import React, { useState, useEffect } from 'react';
import {
  Crop,
  Layers,
  Heart,
  History,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Sliders,
  LayoutDashboard,
  Users,
  CreditCard,
  Key,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { User, VisualSearchMatch, SubscriptionPlan, SearchHistoryItem } from '@fontastic/shared-types';
import { api } from './api';
import { FontFinderView } from './pages/FontFinderView';
import { FontManagerView } from './pages/FontManagerView';
import { WishlistView } from './pages/WishlistView';
import { HistoryView } from './pages/HistoryView';
import { AdminOverviewView } from './pages/admin/AdminOverviewView';
import { AdminUsersView } from './pages/admin/AdminUsersView';
import { AdminPlansView } from './pages/admin/AdminPlansView';
import { AdminAiSettingsView } from './pages/admin/AdminAiSettingsView';
import { AdminProfileView } from './pages/admin/AdminProfileView';
import { ViewfinderModal } from './components/ViewfinderModal';
import { FontResultModal } from './components/FontResultModal';
import { AuthModal } from './components/AuthModal';
import { AnalyzingModal } from './components/AnalyzingModal';

type Tab =
  | 'finder'
  | 'manager'
  | 'wishlist'
  | 'history'
  | 'admin-overview'
  | 'admin-users'
  | 'admin-plans'
  | 'admin-ai'
  | 'admin-profile';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('finder');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [userWishlist, setUserWishlist] = useState<string[]>([]);

  // Modals & Analyzing State
  const [viewfinderOpen, setViewfinderOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);

  // Search Results
  const [currentMatches, setCurrentMatches] = useState<VisualSearchMatch[]>([]);
  const [detectedText, setDetectedText] = useState<string>('');
  const [currentCroppedImage, setCurrentCroppedImage] = useState<string | null>(null);
  const [currentEngine, setCurrentEngine] = useState<string>('deep-typographic-vision');
  const [currentEngineName, setCurrentEngineName] = useState<string>('Typographic Contrast & Geometry Analyzer');
  const [currentTypographicAnalysis, setCurrentTypographicAnalysis] = useState<any>(null);

  const loadUser = async () => {
    const token = api.getToken();
    if (!token) {
      setCurrentUser(null);
      setCurrentPlan(null);
      return;
    }

    try {
      const res = await api.request('/auth/me');
      setCurrentUser(res.user);
      setCurrentPlan(res.plan);
      setUserWishlist(res.user.wishlist || []);
      if (res.user?.role === 'admin') {
        setActiveTab((prev: Tab) => (prev === 'finder' ? 'admin-overview' : prev));
      }
    } catch (err) {
      api.clearToken();
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const startVisualSearch = async (imageBase64: string, correctedText?: string) => {
    setIsAnalyzing(true);
    setAnalyzingImage(imageBase64);
    setResultsModalOpen(false);
    setViewfinderOpen(false);

    try {
      const res = await api.request('/vision/search', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64,
          correctedText,
          device: 'desktop'
        })
      });

      handleSearchComplete(
        res.matches,
        res.detectedText,
        imageBase64,
        res.engine,
        res.engineName,
        res.typographicAnalysis
      );
    } catch (err: any) {
      alert(err.message || 'Font recognition failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Connect native Electron screen snip listener
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onFontSnipReceived) {
      electronAPI.onFontSnipReceived(async (imageBase64: string) => {
        await startVisualSearch(imageBase64);
      });
    }
  }, []);

  const handleTriggerSnip = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.triggerNativeSnip) {
      electronAPI.triggerNativeSnip();
    } else {
      setViewfinderOpen(true);
    }
  };

  const handleSearchComplete = (
    matches: VisualSearchMatch[],
    text: string,
    cropped?: string,
    engine?: string,
    engineName?: string,
    typographicAnalysis?: any
  ) => {
    setCurrentMatches(matches);
    setDetectedText(text);
    if (cropped) setCurrentCroppedImage(cropped);
    if (engine) setCurrentEngine(engine);
    if (engineName) setCurrentEngineName(engineName);
    if (typographicAnalysis) setCurrentTypographicAnalysis(typographicAnalysis);
    setResultsModalOpen(true);
    loadUser();
  };

  const handleRematch = async (newText: string) => {
    if (currentCroppedImage) {
      await startVisualSearch(currentCroppedImage, newText);
    }
  };

  const handleToggleWishlist = async (fontId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.request('/user/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ fontId })
      });
      setUserWishlist(res.wishlist || []);
    } catch (err: any) {
      alert(err.message || 'Failed to update wishlist');
    }
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setCurrentMatches(item.matchedFonts || []);
    setDetectedText(item.detectedText || '');
    setResultsModalOpen(true);
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setCurrentPlan(null);
    setUserWishlist([]);
  };

  return (
    <div className="desktop-window">
      {/* Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="logo-container">F</div>
          <div className="brand-meta">
            <h1>Fontastic</h1>
            <p>Visual Font Suite</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-category-title">Typography Tools</div>

          <button
            onClick={() => setActiveTab('finder')}
            className={`sidebar-btn ${activeTab === 'finder' ? 'active' : ''}`}
          >
            <Crop size={18} />
            Visual Font Finder
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`sidebar-btn ${activeTab === 'manager' ? 'active' : ''}`}
          >
            <Layers size={18} />
            Font Manager & Library
          </button>

          <div className="menu-category-title">Workspace & Cloud</div>

          <button
            onClick={() => {
              if (!currentUser) setAuthModalOpen(true);
              else setActiveTab('wishlist');
            }}
            className={`sidebar-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          >
            <Heart size={18} />
            Wishlist & Favorites
            {userWishlist.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#e2e8f0', color: '#475569', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>
                {userWishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!currentUser) setAuthModalOpen(true);
              else setActiveTab('history');
            }}
            className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <History size={18} />
            Search History
          </button>

          {/* Admin Dedicated Section (Visible ONLY for Administrators) */}
          {currentUser?.role === 'admin' && (
            <>
              <div className="menu-category-title" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                <ShieldCheck size={14} /> Admin Control Panel
              </div>

              <button
                onClick={() => setActiveTab('admin-overview')}
                className={`sidebar-btn ${activeTab === 'admin-overview' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Overview & Metrics
              </button>

              <button
                onClick={() => setActiveTab('admin-users')}
                className={`sidebar-btn ${activeTab === 'admin-users' ? 'active' : ''}`}
              >
                <Users size={18} />
                Subscribers & Users
              </button>

              <button
                onClick={() => setActiveTab('admin-plans')}
                className={`sidebar-btn ${activeTab === 'admin-plans' ? 'active' : ''}`}
              >
                <CreditCard size={18} />
                Plans & Quotas
              </button>

              <button
                onClick={() => setActiveTab('admin-ai')}
                className={`sidebar-btn ${activeTab === 'admin-ai' ? 'active' : ''}`}
              >
                <Sparkles size={18} />
                AI Vision Engine
              </button>

              <button
                onClick={() => setActiveTab('admin-profile')}
                className={`sidebar-btn ${activeTab === 'admin-profile' ? 'active' : ''}`}
              >
                <Key size={18} />
                Profile & Password
              </button>
            </>
          )}
        </nav>

        {/* User Account & Subscription Status Card */}
        <div className="user-card">
          {currentUser ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {currentUser.name}
                    {currentUser.role === 'admin' && (
                      <span style={{ fontSize: 10, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: 4, fontWeight: 800 }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{currentUser.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ color: '#ef4444', padding: 4 }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>

              {currentUser.role === 'admin' ? (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => setActiveTab(activeTab.startsWith('admin-') ? 'finder' : 'admin-overview')}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 8,
                      background: activeTab.startsWith('admin-') ? '#f1f5f9' : '#2563eb',
                      color: activeTab.startsWith('admin-') ? '#334155' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <ArrowRightLeft size={13} />
                    {activeTab.startsWith('admin-') ? 'Switch to Font Finder' : 'Open Admin Console'}
                  </button>
                </div>
              ) : currentPlan && (
                <div style={{ marginTop: 10, background: '#eff6ff', padding: '8px 10px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                      {currentPlan.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                      ৳ {currentPlan.priceBDT} TK/mo
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: '#475569' }}>
                    Quota: <strong>{currentUser.searchesThisWeek}</strong>
                    {currentPlan.searchesPerWeek !== null ? ` / ${currentPlan.searchesPerWeek} searches this week` : ' / ∞ Unlimited'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Personalize & Sync
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                Sign in to save search history, custom collections, and sync with mobile.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="viewfinder-hero-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 12 }}
              >
                <UserIcon size={14} /> Sign In / Sign Up
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Body */}
      <main className="desktop-body">
        {/* Top Header */}
        <header className="header-bar">
          <div className="header-title">
            {activeTab === 'finder' && 'Visual Font Finder'}
            {activeTab === 'manager' && 'Font Manager & Live Playground'}
            {activeTab === 'wishlist' && 'Your Font Wishlist'}
            {activeTab === 'history' && 'Visual Recognition Archive'}
            {activeTab === 'admin-overview' && 'Platform Overview & System Analytics'}
            {activeTab === 'admin-users' && 'Subscriber Accounts & Permissions'}
            {activeTab === 'admin-plans' && 'Subscription Tiers & Monetization'}
            {activeTab === 'admin-ai' && 'Google Gemini Multimodal AI Engine'}
            {activeTab === 'admin-profile' && 'Administrator Profile & Security'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={handleTriggerSnip}
              className="viewfinder-hero-btn"
              title="Shortcut: F9 or Ctrl+Shift+F"
            >
              <Crop size={16} /> Snip Screen Area <span style={{ opacity: 0.75, fontSize: 11 }}>F9 / Ctrl+Shift+F</span>
            </button>

            {!currentUser && (
              <button
                onClick={() => setAuthModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '8px 14px',
                  borderRadius: 8
                }}
              >
                <UserIcon size={16} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Tab Content */}
        <div className="content-scroll">
          {activeTab === 'finder' && (
            <FontFinderView
              onOpenViewfinder={handleTriggerSnip}
              onSearchComplete={handleSearchComplete}
              onStartSearch={startVisualSearch}
            />
          )}

          {activeTab === 'manager' && (
            <FontManagerView
              userWishlist={userWishlist}
              onToggleWishlist={handleToggleWishlist}
            />
          )}

          {activeTab === 'wishlist' && (
            <WishlistView
              userWishlist={userWishlist}
              onToggleWishlist={handleToggleWishlist}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              onSelectSearch={handleSelectHistoryItem}
            />
          )}

          {/* Admin Views */}
          {activeTab === 'admin-overview' && <AdminOverviewView />}
          {activeTab === 'admin-users' && <AdminUsersView />}
          {activeTab === 'admin-plans' && <AdminPlansView />}
          {activeTab === 'admin-ai' && <AdminAiSettingsView />}
          {activeTab === 'admin-profile' && currentUser && (
            <AdminProfileView
              currentUser={currentUser}
              onUserUpdated={(updated) => {
                setCurrentUser(updated);
                loadUser();
              }}
            />
          )}
        </div>
      </main>

      {/* Interactive Screen Viewfinder Overlay */}
      <ViewfinderModal
        isOpen={viewfinderOpen}
        onClose={() => setViewfinderOpen(false)}
        onSearchComplete={handleSearchComplete}
      />

      {/* Visual Match Results Modal */}
      <FontResultModal
        isOpen={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        matches={currentMatches}
        detectedText={detectedText}
        croppedImage={currentCroppedImage || undefined}
        userWishlist={userWishlist}
        onToggleWishlist={handleToggleWishlist}
        engine={currentEngine}
        engineName={currentEngineName}
        typographicAnalysis={currentTypographicAnalysis}
        onRematch={handleRematch}
      />

      {/* Live AI Vision Analyzing Progress Modal */}
      <AnalyzingModal
        isOpen={isAnalyzing}
        imageThumbnail={analyzingImage}
        onCancel={() => setIsAnalyzing(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={async () => {
          await loadUser();
          const userRes = await api.request('/auth/me').catch(() => null);
          if (userRes?.user?.role === 'admin') {
            setActiveTab('admin-overview');
          }
        }}
      />
    </div>
  );
};
