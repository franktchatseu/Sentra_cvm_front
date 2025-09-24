// Design System Tokens
// Central place to manage all colors, fonts, and design tokens

export const colors = {
  // Core Brand Palette 
  brand: {
    cream: '#DAD7CD',        // Light neutral background
    sage: '#A3B18A',         // Sage green - secondary actions
    medium: '#588157',       // Medium green - primary actions
    dark: '#3A5A40',         // Dark green - your logo color
    darkest: '#344E41',      // Darkest green - text/emphasis
  },

  // Sentra Brand Colors 
  sentra: {
    light: '#588157',        // Medium green for light variants
    main: '#3A5A40',         // Your logo color - ALL BUTTONS
    dark: '#344E41',         // Darkest green for emphasis
    hover: '#2f4a35',        // Slightly darker for hover states
  },

  // Entity-Specific Colors (
  entities: {
    products: '#FF4757',      // Bright Red
    offers: '#00D2D3',        // Bright Cyan
    campaigns: '#E91E63',      // Bright Magenta
    segments: '#3742FA',      // Bright Blue
    users: '#8B5CF6',         // Purple
    analytics: '#EC4899',      // Pink Rose
    configuration: '#747D8C',  // Medium Gray
  },

  // Status Colors 
  status: {
    success: {
      light: '#e8f1e8',
      main: '#588157',        // Our green
      dark: '#4a6d4a',
    },
    warning: {
      light: '#f5f1e8',
      main: '#C4A676',        // Warm golden-beige
      dark: '#a68d5f',
    },
    error: {
      light: '#f0ebe8',
      main: '#A67B5B',        // Muted terracotta
      dark: '#8f6a4e',
    },
    info: {
      light: '#eff1ef',
      main: '#8BA288',       
      dark: '#798b76',
    },
  },

  // UI Colors (grays and neutrals)
  ui: {
    background: '#FFFFFF',    
    surface: '#DAD7CD',       
    border: '#C5C2B7',        
    divider: '#B8B5AA',       
    text: {
      primary: '#344E41',     
      secondary: '#5A6B5D',   
      muted: '#8A9B8D',      
      inverse: '#FFFFFF',     
    },
    gray: {
      50: '#fafafa',
      100: '#f5f5f5', 
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },

  interactive: {
    hover: '#2f4a35',        
    active: '#253a28',        
    focus: '#588157',         
    disabled: '#C5C2B7',     
  },
};

export const fonts = {
  // Primary Font Family (for body text, forms, UI)
  primary: {
    name: 'Inter',
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Heading Font 
  heading: {
    name: 'Space Grotesk',
    fallback: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Semantic Font Sizes 
  sizes: {
    // Small text
    caption: '0.75rem',      // 12px - captions, labels
    small: '0.875rem',       // 14px - small text
    
    // Body text
    body: '1rem',            // 16px - main body text
    bodyLg: '1.125rem',      // 18px - large body text
    
    // Headings
    h6: '1rem',              // 16px - smallest heading
    h5: '1.125rem',          // 18px
    h4: '1.25rem',           // 20px
    h3: '1.5rem',            // 24px
    h2: '1.875rem',          // 30px
    h1: '2.25rem',           // 36px
    
    // Display (large headings)
    displaySm: '3rem',       // 48px
    displayMd: '3.75rem',    // 60px
    displayLg: '4.5rem',     // 72px
  },

  // Typography Scale (semantic usage)
  typography: {
    // Page titles
    pageTitle: {
      size: '1.875rem',      // 30px
      weight: 700,           // Bold
      family: 'heading',     // Space Grotesk
    },
    
    // Section headings
    sectionTitle: {
      size: '1.5rem',        // 24px
      weight: 600,           // Semibold
      family: 'heading',
    },
    
    // Card titles
    cardTitle: {
      size: '1.25rem',       // 20px
      weight: 600,           // Semibold
      family: 'heading',
    },
    
    // Body text
    body: {
      size: '1rem',          // 16px
      weight: 400,           // Normal
      family: 'primary',     // Inter
    },
    
    // Small text
    caption: {
      size: '0.875rem',      // 14px
      weight: 400,           // Normal
      family: 'primary',
    },
    
    // Buttons
    button: {
      size: '1rem',          // 16px
      weight: 500,           // Medium
      family: 'primary',
    },
    
    // Form labels
    label: {
      size: '0.875rem',      // 14px
      weight: 500,           // Medium
      family: 'primary',
    },
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export const cssVariables = {
  '--color-brand-cream': colors.brand.cream,
  '--color-brand-sage': colors.brand.sage,
  '--color-brand-medium': colors.brand.medium,
  '--color-brand-dark': colors.brand.dark,
  '--color-brand-darkest': colors.brand.darkest,
  
  '--color-sentra-light': colors.sentra.light,
  '--color-sentra-main': colors.sentra.main,
  '--color-sentra-dark': colors.sentra.dark,
  '--color-sentra-hover': colors.sentra.hover,
  
  '--color-ui-background': colors.ui.background,
  '--color-ui-surface': colors.ui.surface,
  '--color-ui-border': colors.ui.border,
  '--color-text-primary': colors.ui.text.primary,
  '--color-text-secondary': colors.ui.text.secondary,
  '--color-text-muted': colors.ui.text.muted,
  
  // Fonts
  '--font-primary': `"${fonts.primary.name}", ${fonts.primary.fallback}`,
  '--font-heading': `"${fonts.heading.name}", ${fonts.heading.fallback}`,
};

// Utility functions
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found`);
      return '#000000';
    }
  }
  
  return value as string;
};

export const getFont = (fontName: keyof typeof fonts) => {
  return fonts[fontName];
};

// Entity color helper
export const getEntityColor = (entity: 'products' | 'offers' | 'campaigns' | 'segments' | 'users' | 'analytics' | 'configuration') => {
  return colors.entities[entity];
};

// Status color helper
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info', variant: 'light' | 'main' | 'dark' = 'main') => {
  return colors.status[status][variant];
};

// Typography helper
export const getTypography = (type: keyof typeof fonts.typography) => {
  return fonts.typography[type];
};
