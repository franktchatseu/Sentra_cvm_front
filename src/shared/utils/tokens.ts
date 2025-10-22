
export const colors = {
  // Primary defines main brand colors and key UI elements
  primary: {
    action: '#252829',        // Main buttons, CTAs
    accent: '#4FDFF3',        // Interactive elements, highlights
    background: '#D1DCE1',    // Dashboard pages
  },
  
  // Surface defines background colors for containers and cards
  surface: {
    cards: '#F5FCFF',         // Cards and table headers
    background: '#FFFFFF',    
    tableHeader: 'linear-gradient(to bottom, #394247 0%, #1F2223 70%, #2A2F31 100%)',
    tableHeaderText: '#FFFFFF',
  },
  
  // Gradient colors for sidebar and header
        gradients: {
          sidebar: {
            top: '#2A2F31',        // Custom blend - Dark with subtle light hint (top)
            middle: '#1F2223',     // NEUTRAL 900 - Deep charcoal (middle)
            bottom: '#2A2F31',     // Custom blend - Dark with subtle light hint (bottom)
          },
          landing: {
            top: '#22282A',        // NEUTRAL 800 - Dark blue-gray (top)
            middleLight: '#394247', // NEUTRAL 700 - Dark blue-gray
            middle: '#5F6F77',     // NEUTRAL 600 - Medium-dark blue-gray
            middleDark: '#394247', // NEUTRAL 700 - Back to dark blue-gray
            bottom: '#22282A',     // NEUTRAL 800 - Dark blue-gray (bottom)
          },
        },
  
  // Status defines colors for different message types and states
  status: {
    success: '#94DF5A',       // Success messages (Green 500)
    danger: '#FC9C9C',        // Error messages (Coral 500)
    warning: '#F7B430',       // Warning messages (Yellow 500)
    info: '#C38BFB',          // Info messages (Purple 500)
  },
  
  // Configuration status colors
  configStatus: {
    active: '#C38BFB',        // Purple 500 - Active
    inactive: '#FC9C9C',       // Coral 500 - Inactive
    draft: '#F7B430',         // Yellow 500 - Draft
    default: '#94DF5A',       // Green 500 - Default
  },
  
  // Text defines all text color variations for different content types
  text: {
    primary: '#000000',       // Main headings, important text
    secondary: '#394247',     // Body text, descriptions
    muted: '#6B7280',         // Placeholders, disabled text
    inverse: '#FFFFFF',       // Text on dark buttons/backgrounds
  },
  
  // Interactive defines colors for user interaction states
  interactive: {
    hover: '#F3F4F6',         // Hover states
    active: '#E5E7EB',        // Active states
    focus: '#4FDFF3',         // Focus states
    disabled: '#D1D5DB',       // Disabled states
  },
  
  // Border defines colors for different border types and emphasis
  border: {
    default: '#E5E7EB',        // Default borders
    accent: '#4FDFF3',         // Accent borders
    muted: '#F3F4F6',          // Subtle borders
  },
};

export const fonts = {
  // Primary font for headlines and call-to-actions
  primary: {
    name: 'Satoshi',
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  
  // Secondary font for body text, captions, and supporting elements
  secondary: {
    name: 'PP Supply Mono',
    fallback: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  
  weights: {
    normal: 400,    
    medium: 500,  
    bold: 700,     
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
    // Headings use Satoshi Bold with tight letter spacing
    heading: {
      size: '1.875rem',
      weight: 400,    // Regular weight
      family: 'primary',
      lineHeight: '120%',
      letterSpacing: '-4%',
    },
    subtitle: {
      size: '1.25rem',
      weight: 500,    // Medium instead of 600
      family: 'primary',
      lineHeight: '120%',
      letterSpacing: '-8%',
    },
    cardTitle: {
      size: '1.25rem',
      weight: 500,    // Medium instead of 600
      family: 'primary',
      lineHeight: '120%',
      letterSpacing: '-4%',
    },
    // Body text uses PP Supply Mono with variable line heights
    body: {
      size: '1rem',
      weight: 400,
      family: 'secondary',
      lineHeight: '130%',
      letterSpacing: '0%',
    },
    bodyShort: {
      size: '1rem',
      weight: 400,
      family: 'secondary',
      lineHeight: '120%',
      letterSpacing: '0%',
    },
    bodyLong: {
      size: '1rem',
      weight: 400,
      family: 'secondary',
      lineHeight: '160%',
      letterSpacing: '0%',
    },
    caption: {
      size: '0.875rem',
      weight: 400,
      family: 'secondary',
      lineHeight: '130%',
      letterSpacing: '0%',
    },
    button: {
      size: '1rem',
      weight: 500,    // Medium for buttons
      family: 'primary',
      lineHeight: '130%',
      letterSpacing: '0%',
    },
    label: {
      size: '0.875rem',
      weight: 400,     // Normal for labels
      family: 'secondary',
      lineHeight: '120%',
      letterSpacing: '0%',
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

// Button defines consistent sizing, padding, and border radius for all buttons
export const buttons = {
    action: {
    background: colors.primary.action,  
    color: '#FFFFFF',                   // White text on dark buttons
    border: 'none',                     
    paddingY: '0.5rem',               
    paddingX: '1.5rem',               
    borderRadius: '0.5rem',          
    fontSize: '0.875rem',               // text-sm (14px)
  },

   secondaryAction: {
    background: '#00BBCC',  
    // color: '#000000',                   
    color: '#FFFFFF',                   
    border: 'none',                     
    paddingY: '0.75rem',               
    paddingX: '1.5rem',               
    borderRadius: '0.5rem',          
    fontSize: '0.875rem',               // text-sm (14px)
  },

};

// Cards defines consistent styling for all card components
export const cards = {
  default: {
    background: colors.surface.cards,    
    border: '1px solid',
    borderColor: '#374151',              
    borderRadius: '1rem',              
    padding: '1.5rem',            
  },
};
