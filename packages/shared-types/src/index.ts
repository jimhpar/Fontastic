export type UserRole = 'admin' | 'user';

export type FontSource = 'google' | 'dafont' | 'adobe' | 'myfonts';
export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  priceBDT: number; // e.g. 30, 50, 300
  period: 'month';
  searchesPerWeek: number | null; // null represents unlimited
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  defaultPreviewText: string;
  defaultFontSize: number;
  autoCheckUpdates: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  planId?: string | SubscriptionPlan | null;
  planExpiresAt?: string | null;
  searchesThisWeek: number;
  weekResetAt?: string;
  wishlist: string[]; // array of font IDs or families
  settings?: UserSettings;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FontTypographicFeatures {
  serifType?: 'none' | 'bracketed' | 'unbracketed' | 'slab';
  xHeight?: 'low' | 'medium' | 'high';
  contrast?: 'low' | 'medium' | 'high';
  weight?: string | number;
  slant?: 'upright' | 'italic' | 'oblique';
  width?: 'condensed' | 'normal' | 'expanded';
  aperture?: 'open' | 'semi-closed' | 'closed';
}

export interface FontItem {
  _id: string;
  family: string;
  category: FontCategory;
  subsets?: string[];
  variants?: string[];
  files?: Record<string, string>; // e.g. { regular: "https://...", "700": "https://..." }
  previewUrl?: string;
  downloadUrl?: string;
  source: FontSource;
  license?: string;
  tags?: string[];
  features?: FontTypographicFeatures;
}

export interface VisualSearchQuery {
  imageBase64: string;
  device: 'desktop' | 'mobile';
  cropBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  correctedText?: string;
}

export interface VisualSearchMatch {
  font: FontItem;
  similarity: number; // 0 to 100%
  confidenceScore: number;
  matchedFeatures: string[];
  sourceUrl?: string;
  downloadDirectUrl?: string;
}

export interface SearchHistoryItem {
  _id: string;
  userId: string;
  sourceDevice: 'desktop' | 'mobile';
  detectedText?: string;
  previewImage?: string;
  matchedFonts: VisualSearchMatch[];
  createdAt: string;
}

export interface FontCollection {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  colorTag?: string;
  fontIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalSearchesThisMonth: number;
  searchesToday: number;
  desktopSearchesCount: number;
  mobileSearchesCount: number;
  popularFonts: { family: string; searches: number; source: FontSource }[];
}
