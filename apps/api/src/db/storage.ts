import fs from 'fs';
import path from 'path';
import {
  User,
  SubscriptionPlan,
  FontItem,
  SearchHistoryItem,
  FontCollection
} from '@fontastic/shared-types';
import { config } from '../config';

interface DatabaseSchema {
  users: User[];
  plans: SubscriptionPlan[];
  fonts: FontItem[];
  searchHistory: SearchHistoryItem[];
  collections: FontCollection[];
  systemSettings?: Record<string, any>;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    _id: 'plan_basic_30',
    name: 'Basic Starter',
    priceBDT: 30,
    period: 'month',
    searchesPerWeek: 10,
    features: [
      '10 Visual Font Searches / week',
      'Desktop & Mobile Viewfinder',
      'Local Font Preview & Testing',
      'Standard font comparisons',
      'Direct free font downloads'
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'plan_standard_50',
    name: 'Standard Pro',
    priceBDT: 50,
    period: 'month',
    searchesPerWeek: 20,
    features: [
      '20 Visual Font Searches / week',
      'Desktop & Mobile Viewfinder',
      'Wishlist & Cloud Library Sync',
      'Custom Collections & Tagging',
      'Side-by-side font comparison (up to 4 fonts)',
      'Direct free font downloads'
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'plan_unlimited_300',
    name: 'Pro Unlimited',
    priceBDT: 300,
    period: 'month',
    searchesPerWeek: null, // Unlimited searches
    features: [
      'Unlimited Visual Font Searches',
      'High-Priority AI Typography Matching',
      '1-Click Direct OS Font Installation (.ttf/.otf)',
      'Unlimited Cloud Library Sync (Desktop + Mobile)',
      'Export Font Packs for Client Projects',
      'VIP Support'
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_FONTS: FontItem[] = [
  {
    _id: 'font_roboto',
    family: 'Roboto',
    category: 'sans-serif',
    subsets: ['latin', 'cyrillic'],
    variants: ['100', '300', 'regular', '500', '700', '900'],
    files: {
      regular: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
      '700': 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2'
    },
    downloadUrl: 'https://fonts.google.com/download?family=Roboto',
    source: 'google',
    license: 'Apache License 2.0',
    tags: ['clean', 'modern', 'ui', 'workhorse', 'neutral'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_inter',
    family: 'Inter',
    category: 'sans-serif',
    subsets: ['latin'],
    variants: ['300', 'regular', '600', '700', '800'],
    files: {
      regular: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2'
    },
    downloadUrl: 'https://fonts.google.com/download?family=Inter',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['interface', 'tech', 'crisp', 'apple', 'minimal'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_playfair',
    family: 'Playfair Display',
    category: 'serif',
    subsets: ['latin'],
    variants: ['regular', 'italic', '700', '900'],
    files: {
      regular: 'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2'
    },
    downloadUrl: 'https://fonts.google.com/download?family=Playfair+Display',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['editorial', 'luxury', 'fashion', 'magazine', 'high-contrast'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'normal',
      aperture: 'semi-closed'
    }
  },
  {
    _id: 'font_montserrat',
    family: 'Montserrat',
    category: 'sans-serif',
    subsets: ['latin'],
    variants: ['regular', '500', '700', '800'],
    files: {
      regular: 'https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX8.woff2'
    },
    downloadUrl: 'https://fonts.google.com/download?family=Montserrat',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['geometric', 'poster', 'heading', 'modern', 'urban'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'expanded',
      aperture: 'open'
    }
  },
  {
    _id: 'font_bebas_neue',
    family: 'Bebas Neue',
    category: 'display',
    subsets: ['latin'],
    variants: ['regular'],
    files: {
      regular: 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9WlhyyTh89Y.woff2'
    },
    downloadUrl: 'https://fonts.google.com/download?family=Bebas+Neue',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['tall', 'condensed', 'headline', 'caps', 'bold', 'punchy'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_merriweather',
    family: 'Merriweather',
    category: 'serif',
    subsets: ['latin'],
    variants: ['300', 'regular', '700', '900'],
    downloadUrl: 'https://fonts.google.com/download?family=Merriweather',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['editorial', 'book', 'readable', 'warm', 'editorial'],
    features: {
      serifType: 'bracketed',
      xHeight: 'medium',
      contrast: 'medium',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_dancing_script',
    family: 'Dancing Script',
    category: 'handwriting',
    subsets: ['latin'],
    variants: ['regular', '700'],
    downloadUrl: 'https://fonts.google.com/download?family=Dancing+Script',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['cursive', 'calligraphy', 'casual', 'friendly', 'script'],
    features: {
      serifType: 'none',
      xHeight: 'low',
      contrast: 'medium',
      weight: 'regular',
      slant: 'italic',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_fira_code',
    family: 'Fira Code',
    category: 'monospace',
    subsets: ['latin'],
    variants: ['regular', '500', '700'],
    downloadUrl: 'https://fonts.google.com/download?family=Fira+Code',
    source: 'google',
    license: 'SIL Open Font License',
    tags: ['code', 'developer', 'ligatures', 'terminal', 'monospace'],
    features: {
      serifType: 'slab',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_lemon_milk',
    family: 'Lemon Milk',
    category: 'display',
    source: 'dafont',
    license: 'Free for personal use',
    downloadUrl: 'https://www.dafont.com/lemon-milk.font',
    tags: ['geometric', 'uppercase', 'branding', 'logo', 'clean'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '700',
      slant: 'upright',
      width: 'expanded',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_helvetica_now',
    family: 'Helvetica Now',
    category: 'sans-serif',
    source: 'myfonts',
    license: 'Commercial',
    downloadUrl: 'https://www.myfonts.com/collections/helvetica-now-font-monotype-imaging',
    tags: ['corporate', 'swiss', 'timeless', 'commercial', 'neutral'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'semi-closed'
    }
  },
  {
    _id: 'font_futura_pt',
    family: 'Futura PT',
    category: 'sans-serif',
    source: 'adobe',
    license: 'Adobe Fonts Subscription',
    downloadUrl: 'https://fonts.adobe.com/fonts/futura-pt',
    tags: ['geometric', 'bauhaus', 'avant-garde', 'classic'],
    features: {
      serifType: 'none',
      xHeight: 'low',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_bodoni_urw',
    family: 'Bodoni URW',
    category: 'serif',
    source: 'adobe',
    license: 'Adobe Fonts Subscription',
    downloadUrl: 'https://fonts.adobe.com/fonts/bodoni-urw',
    tags: ['didone', 'vogue', 'extreme-contrast', 'luxury'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'normal',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_akira_expanded',
    family: 'Akira Expanded',
    category: 'display',
    source: 'dafont',
    license: 'Free for personal use (Commercial license available)',
    downloadUrl: 'https://www.dafont.com/akira-expanded.font',
    tags: ['extended', 'ultra-wide', 'bold', 'futuristic', 'heavy', 'display', 'super-bold', 'caps'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '900',
      slant: 'upright',
      width: 'expanded',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_monument_extended',
    family: 'Monument Extended',
    category: 'display',
    source: 'dafont',
    license: 'Free for personal use',
    downloadUrl: 'https://www.dafont.com/monument-extended.font',
    tags: ['extended', 'wide', 'brutalist', 'bold', 'display'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '800',
      slant: 'upright',
      width: 'expanded',
      aperture: 'open'
    }
  },
  {
    _id: 'font_syncopate',
    family: 'Syncopate',
    category: 'sans-serif',
    source: 'google',
    license: 'Apache License 2.0',
    downloadUrl: 'https://fonts.google.com/specimen/Syncopate',
    tags: ['extended', 'wide', 'geometric', 'minimal', 'all-caps'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: '700',
      slant: 'upright',
      width: 'expanded',
      aperture: 'open'
    }
  },
  {
    _id: 'font_syne',
    family: 'Syne',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Syne',
    tags: ['extended', 'wide', 'fashion', 'brutalist', 'headline'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '800',
      slant: 'upright',
      width: 'expanded',
      aperture: 'open'
    }
  },
  {
    _id: 'font_michroma',
    family: 'Michroma',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Michroma',
    tags: ['extended', 'wide', 'microgramma', 'retro-futuristic'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'expanded',
      aperture: 'semi-closed'
    }
  },
  {
    _id: 'font_orbitron',
    family: 'Orbitron',
    category: 'display',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Orbitron',
    tags: ['extended', 'wide', 'scifi', 'display', 'caps'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: '700',
      slant: 'upright',
      width: 'expanded',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_russo_one',
    family: 'Russo One',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Russo+One',
    tags: ['heavy', 'wide', 'block', 'poster'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '800',
      slant: 'upright',
      width: 'expanded',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_druk_wide',
    family: 'Druk Wide',
    category: 'display',
    source: 'myfonts',
    license: 'Commercial',
    downloadUrl: 'https://www.myfonts.com/collections/druk-wide-font-commercial-type',
    tags: ['ultra-wide', 'heavy', 'headline', 'editorial', 'super-extended'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '900',
      slant: 'upright',
      width: 'expanded',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_krona_one',
    family: 'Krona One',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Krona+One',
    tags: ['extended', 'wide', 'display', 'clean'],
    features: {
      serifType: 'none',
      xHeight: 'medium',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'expanded',
      aperture: 'open'
    }
  },
  {
    _id: 'font_cinzel',
    family: 'Cinzel',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Cinzel',
    tags: ['roman', 'trajan', 'classical', 'caps', 'luxury'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_anton',
    family: 'Anton',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Anton',
    tags: ['condensed', 'headline', 'heavy', 'impact', 'poster'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '800',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_bodoni_moda',
    family: 'Bodoni Moda',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Bodoni+Moda',
    tags: ['didone', 'luxury', 'fashion', 'high-contrast', 'editorial', 'condensed'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_bodoni_poster_compressed',
    family: 'Bodoni Poster Compressed',
    category: 'serif',
    source: 'myfonts',
    license: 'Commercial',
    downloadUrl: 'https://www.myfonts.com/collections/bodoni-font-linotype',
    tags: ['didone', 'ultra-condensed', 'extreme-contrast', 'luxury', 'fashion', 'dreamcore', 'headline'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'high',
      contrast: 'high',
      weight: '900',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_playfair_display_sc',
    family: 'Playfair Display SC',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Playfair+Display+SC',
    tags: ['editorial', 'luxury', 'caps', 'high-contrast', 'didone', 'fashion'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_prata',
    family: 'Prata',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Prata',
    tags: ['didone', 'teardrop', 'luxury', 'high-contrast', 'editorial'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'medium',
      contrast: 'high',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_cormorant_garamond',
    family: 'Cormorant Garamond',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Cormorant+Garamond',
    tags: ['classical', 'elegant', 'tall', 'delicate', 'luxury', 'high-contrast'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'open'
    }
  },
  {
    _id: 'font_cinzel_decorative',
    family: 'Cinzel Decorative',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Cinzel+Decorative',
    tags: ['swash', 'luxury', 'classical', 'roman', 'display'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_bellefair',
    family: 'Bellefair',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Bellefair',
    tags: ['tall', 'condensed', 'delicate', 'high-contrast', 'luxury'],
    features: {
      serifType: 'bracketed',
      xHeight: 'high',
      contrast: 'high',
      weight: 'regular',
      slant: 'upright',
      width: 'condensed',
      aperture: 'open'
    }
  },
  {
    _id: 'font_abril_fatface',
    family: 'Abril Fatface',
    category: 'display',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Abril+Fatface',
    tags: ['didone', 'poster', 'heavy', 'high-contrast', 'vintage'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'medium',
      contrast: 'high',
      weight: '900',
      slant: 'upright',
      width: 'normal',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_italiana',
    family: 'Italiana',
    category: 'serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Italiana',
    tags: ['italian', 'magazine', 'vogue', 'luxury', 'editorial'],
    features: {
      serifType: 'bracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: 'regular',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_didot',
    family: 'Didot',
    category: 'serif',
    source: 'adobe',
    license: 'Adobe Fonts Subscription',
    downloadUrl: 'https://fonts.adobe.com/fonts/didot',
    tags: ['didone', 'parisian', 'vogue', 'luxury', 'high-contrast', 'fashion'],
    features: {
      serifType: 'unbracketed',
      xHeight: 'low',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_ogg',
    family: 'Ogg',
    category: 'serif',
    source: 'myfonts',
    license: 'Commercial',
    downloadUrl: 'https://www.myfonts.com/collections/ogg-font-lucas-sharp',
    tags: ['calligraphic', 'luxury', 'editorial', 'condensed', 'fashion', 'vogue'],
    features: {
      serifType: 'bracketed',
      xHeight: 'high',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'open'
    }
  },
  {
    _id: 'font_editorial_new',
    family: 'Editorial New',
    category: 'serif',
    source: 'dafont',
    license: 'Free for personal use',
    downloadUrl: 'https://pangrampangram.com/products/editorial-new',
    tags: ['editorial', 'luxury', 'retro', '90s', 'fashion', 'condensed'],
    features: {
      serifType: 'bracketed',
      xHeight: 'medium',
      contrast: 'high',
      weight: '800',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_glamour',
    family: 'Glamour Absolute',
    category: 'serif',
    source: 'dafont',
    license: 'Free for personal use',
    downloadUrl: 'https://www.dafont.com/search.php?q=Glamour',
    tags: ['chic', 'luxury', 'condensed', 'headline', 'dreamcore'],
    features: {
      serifType: 'bracketed',
      xHeight: 'high',
      contrast: 'high',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'closed'
    }
  },
  {
    _id: 'font_barlow_condensed',
    family: 'Barlow Condensed',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Barlow+Condensed',
    tags: ['condensed', 'tall', 'modern', 'clean', 'grotesque'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: '700',
      slant: 'upright',
      width: 'condensed',
      aperture: 'open'
    }
  },
  {
    _id: 'font_plus_jakarta_sans',
    family: 'Plus Jakarta Sans',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Plus+Jakarta+Sans',
    tags: ['geometric', 'modern', 'clean', 'contemporary', 'branding', 'fashion', 'harshiya', 'grotesque', 'tech'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_outfit',
    family: 'Outfit',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Outfit',
    tags: ['geometric', 'display', 'clean', 'branding', 'fashion', 'logo'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_poppins',
    family: 'Poppins',
    category: 'sans-serif',
    source: 'google',
    license: 'SIL Open Font License',
    downloadUrl: 'https://fonts.google.com/specimen/Poppins',
    tags: ['geometric', 'circular', 'friendly', 'branding', 'clean'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_gilroy',
    family: 'Gilroy',
    category: 'sans-serif',
    source: 'dafont',
    license: 'Free for personal use',
    downloadUrl: 'https://www.dafont.com/search.php?q=Gilroy',
    tags: ['geometric', 'clean', 'fashion', 'modern', 'branding', 'luxurious'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  },
  {
    _id: 'font_avenir_next',
    family: 'Avenir Next',
    category: 'sans-serif',
    source: 'adobe',
    license: 'Adobe Fonts Subscription',
    downloadUrl: 'https://fonts.adobe.com/fonts/avenir-next',
    tags: ['geometric', 'classic', 'timeless', 'modern', 'fashion', 'clean'],
    features: {
      serifType: 'none',
      xHeight: 'high',
      contrast: 'low',
      weight: 'regular',
      slant: 'upright',
      width: 'normal',
      aperture: 'open'
    }
  }
];

class DatabaseStore {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = config.dataPath;
    this.data = {
      users: [],
      plans: DEFAULT_PLANS,
      fonts: INITIAL_FONTS,
      searchHistory: [],
      collections: [],
      systemSettings: {}
    };
    this.load();
  }

  private load() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Merge initial fonts to ensure new catalog fonts are always available
        const existingFontIds = new Set((parsed.fonts || []).map((f: any) => f._id));
        const mergedFonts = [...(parsed.fonts || [])];
        INITIAL_FONTS.forEach(font => {
          if (!existingFontIds.has(font._id)) {
            mergedFonts.push(font);
          }
        });

        this.data = {
          users: parsed.users || [],
          plans: (parsed.plans && parsed.plans.length > 0) ? parsed.plans : DEFAULT_PLANS,
          fonts: mergedFonts,
          searchHistory: parsed.searchHistory || [],
          collections: parsed.collections || [],
          systemSettings: parsed.systemSettings || {}
        };
        this.save();
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database store, using defaults:', err);
    }
  }

  public save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database store:', err);
    }
  }

  private listeners: ((entity: string, action: string, data: any) => void)[] = [];

  public onDbChange(fn: (entity: string, action: string, data: any) => void) {
    this.listeners.push(fn);
  }

  private notify(entity: string, action: string, data: any) {
    for (const fn of this.listeners) {
      try {
        fn(entity, action, data);
      } catch (err) {
        // ignore
      }
    }
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u._id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    this.notify('user', 'create', user);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u._id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    this.notify('user', 'update', this.data.users[idx]);
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u._id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.save();
    this.notify('user', 'delete', { id });
    return true;
  }

  // Plans
  public getPlans(): SubscriptionPlan[] {
    return this.data.plans;
  }

  public getPlanById(id: string): SubscriptionPlan | undefined {
    return this.data.plans.find(p => p._id === id);
  }

  public addPlan(plan: SubscriptionPlan): SubscriptionPlan {
    this.data.plans.push(plan);
    this.save();
    this.notify('plan', 'create', plan);
    return plan;
  }

  public updatePlan(id: string, updates: Partial<SubscriptionPlan>): SubscriptionPlan | undefined {
    const idx = this.data.plans.findIndex(p => p._id === id);
    if (idx === -1) return undefined;
    this.data.plans[idx] = { ...this.data.plans[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    this.notify('plan', 'update', this.data.plans[idx]);
    return this.data.plans[idx];
  }

  public deletePlan(id: string): boolean {
    const idx = this.data.plans.findIndex(p => p._id === id);
    if (idx === -1) return false;
    this.data.plans.splice(idx, 1);
    this.save();
    this.notify('plan', 'delete', { id });
    return true;
  }

  // Fonts
  public getFonts(): FontItem[] {
    return this.data.fonts;
  }

  public getFontById(id: string): FontItem | undefined {
    return this.data.fonts.find(f => f._id === id);
  }

  public addFont(font: FontItem): FontItem {
    this.data.fonts.push(font);
    this.save();
    return font;
  }

  // Search History
  public addSearchHistory(item: SearchHistoryItem): SearchHistoryItem {
    this.data.searchHistory.unshift(item);
    if (this.data.searchHistory.length > 500) {
      this.data.searchHistory.pop();
    }
    this.save();
    this.notify('history', 'create', item);
    return item;
  }

  public getUserSearchHistory(userId: string): SearchHistoryItem[] {
    return this.data.searchHistory.filter(h => h.userId === userId);
  }

  public getAllSearchHistory(): SearchHistoryItem[] {
    return this.data.searchHistory;
  }

  // Collections
  public getUserCollections(userId: string): FontCollection[] {
    return this.data.collections.filter(c => c.userId === userId);
  }

  public addCollection(collection: FontCollection): FontCollection {
    this.data.collections.push(collection);
    this.save();
    return collection;
  }

  public updateCollection(id: string, updates: Partial<FontCollection>): FontCollection | undefined {
    const idx = this.data.collections.findIndex(c => c._id === id);
    if (idx === -1) return undefined;
    this.data.collections[idx] = { ...this.data.collections[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.collections[idx];
  }

  public deleteCollection(id: string): boolean {
    const idx = this.data.collections.findIndex(c => c._id === id);
    if (idx === -1) return false;
    this.data.collections.splice(idx, 1);
    this.save();
    return true;
  }

  // System Settings
  public getSystemSetting(key: string): any {
    return this.data.systemSettings ? this.data.systemSettings[key] : undefined;
  }

  public setSystemSetting(key: string, value: any): void {
    if (!this.data.systemSettings) this.data.systemSettings = {};
    this.data.systemSettings[key] = value;
    this.save();
    this.notify('systemSetting', 'update', { key, value });
  }
}

export const db = new DatabaseStore();
