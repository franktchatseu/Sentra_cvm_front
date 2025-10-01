export const colors = {
  brand: {
    cream: '#DAD7CD',
    sage: '#A3B18A',
    medium: '#588157',
    dark: '#3A5A40',
    darkest: '#344E41',
  },

  sentra: {
    light: '#588157',
    main: '#3A5A40',
    dark: '#344E41',
    hover: '#2f4a35',
  },

  entities: {
    products: '#DC2626',
    offers: '#059669',
    campaigns: '#8B5CF6',
    segments: '#0D9488',
    users: '#3B82F6',
    analytics: '#DB2777',
    configuration: '#747D8C',
  },

  status: {
    success: {
      light: '#e8f1e8',
      main: '#588157',
      dark: '#4a6d4a',
    },
    warning: {
      light: '#f5f1e8',
      main: '#C4A676',
      dark: '#a68d5f',
    },
    error: {
      light: '#f0ebe8',
      main: '#A67B5B',
      dark: '#8f6a4e',
    },
    info: {
      light: '#eff1ef',
      main: '#8BA288',       
      dark: '#798b76',
    },
  },
  ui: {
    background: '#FFFFFF',    
   // surface: '#DAD7CD',       
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
  primary: {
    name: 'Inter',
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  heading: {
    name: 'Space Grotesk',
    fallback: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  sizes: {
    caption: '0.75rem',
    small: '0.875rem',
    body: '1rem',
    bodyLg: '1.125rem',
    h6: '1rem',
    h5: '1.125rem',
    h4: '1.25rem',
    h3: '1.5rem',
    h2: '1.875rem',
    h1: '2.25rem',
    displaySm: '3rem',
    displayMd: '3.75rem',
    displayLg: '4.5rem',
  },

  typography: {
    pageTitle: {
      size: '1.875rem',
      weight: 700,
      family: 'heading',
    },
    sectionTitle: {
      size: '1.5rem',
      weight: 600,
      family: 'heading',
    },
    cardTitle: {
      size: '1.25rem',
      weight: 600,
      family: 'heading',
    },
    body: {
      size: '1rem',
      weight: 400,
      family: 'primary',
    },
    caption: {
      size: '0.875rem',
      weight: 400,
      family: 'primary',
    },
    button: {
      size: '1rem',
      weight: 500,
      family: 'primary',
    },
    label: {
      size: '0.875rem',
      weight: 500,
      family: 'primary',
    },
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
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
  
  '--font-primary': `"${fonts.primary.name}", ${fonts.primary.fallback}`,
  '--font-heading': `"${fonts.heading.name}", ${fonts.heading.fallback}`,
};

export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
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

export const getEntityColor = (entity: 'products' | 'offers' | 'campaigns' | 'segments' | 'users' | 'analytics' | 'configuration') => {
  return colors.entities[entity];
};

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info', variant: 'light' | 'main' | 'dark' = 'main') => {
  return colors.status[status][variant];
};

export const getTypography = (type: keyof typeof fonts.typography) => {
  return fonts.typography[type];
};
