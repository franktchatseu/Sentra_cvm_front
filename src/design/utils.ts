

import { 
  colors, 
  fonts, 
  spacing, 
  borderRadius, 
  shadows, 
  getEntityColor, 
  getStatusColor, 
  getTypography 
} from './tokens';

export const color = {
  brand: colors.brand,
  
  // Sentra colors (all buttons use these)
  sentra: colors.sentra,
  
  entities: colors.entities,
  
  status: colors.status,
  
  // UI colors (text, backgrounds, etc.)
  ui: colors.ui,
  
  // Interactive states
  interactive: colors.interactive,
};

// Typography utilities
export const typography = {
  // Font families
  primary: fonts.primary.name,        // Inter
  heading: fonts.heading.name,        // Space Grotesk (fixed)
  
  // Font weights
  weights: fonts.weights,
  
  // Font sizes
  sizes: fonts.sizes,
  
  // Semantic typography
  semantic: fonts.typography,
};

// Spacing utilities
export const space = spacing;

// Border radius utilities
export const radius = borderRadius;

// Shadow utilities
export const shadow = shadows;

// Tailwind CSS class generators
export const tw = {
  // Brand Colors
  brandCream: `bg-[${colors.brand.cream}]`,
  brandSage: `bg-[${colors.brand.sage}]`,
  brandMedium: `bg-[${colors.brand.medium}]`,
  brandDark: `bg-[${colors.brand.dark}]`,
  brandDarkest: `bg-[${colors.brand.darkest}]`,
  
  // Sentra Button Styles (ALL BUTTONS USE THESE)
  primaryButton: `bg-[${colors.sentra.main}] hover:bg-[${colors.sentra.hover}] active:bg-[${colors.interactive.active}] text-white font-medium transition-colors`,
  secondaryButton: `bg-[${colors.brand.sage}] hover:bg-[${colors.brand.medium}] text-white font-medium transition-colors`,
  ghostButton: `bg-transparent hover:bg-[${colors.ui.surface}] text-[${colors.ui.text.primary}] border border-[${colors.ui.border}] font-medium transition-colors`,
  
  // Entity Colors (for icons, badges, etc.)
  products: `text-[${colors.entities.products}]`,
  offers: `text-[${colors.entities.offers}]`,
  campaigns: `text-[${colors.entities.campaigns}]`,
  segments: `text-[${colors.entities.segments}]`,
  users: `text-[${colors.entities.users}]`,
  analytics: `text-[${colors.entities.analytics}]`,
  configuration: `text-[${colors.entities.configuration}]`,
  
  // Status Colors
  success: `text-[${colors.status.success.main}]`,
  warning: `text-[${colors.status.warning.main}]`,
  error: `text-[${colors.status.error.main}]`,
  info: `text-[${colors.status.info.main}]`,
  
  // Text Colors
  textPrimary: `text-[${colors.ui.text.primary}]`,
  textSecondary: `text-[${colors.ui.text.secondary}]`,
  textMuted: `text-[${colors.ui.text.muted}]`,
  textInverse: `text-[${colors.ui.text.inverse}]`,
  
  // Background Colors
  surface: `bg-[${colors.ui.surface}]`,
  background: `bg-[${colors.ui.background}]`,
  
  // Typography
  fontPrimary: 'font-sans',           // Inter
  fontHeading: 'font-space-grotesk',  // Space Grotesk (will need CSS class)
};

// Component class generators
export const components = {
  // Card variants
  card: {
    default: `bg-white border border-[${colors.ui.border}] rounded-xl shadow-sm`,
    surface: `bg-[${colors.ui.surface}] border border-[${colors.ui.border}] rounded-xl`,
    elevated: `bg-white border border-[${colors.ui.border}] rounded-xl shadow-lg`,
  },
  
  // Input variants
  input: {
    default: `border border-[${colors.ui.border}] focus:border-[${colors.interactive.focus}] bg-white text-[${colors.ui.text.primary}] rounded-lg`,
    error: `border border-[${colors.status.error.main}] focus:border-[${colors.status.error.main}] bg-white text-[${colors.ui.text.primary}] rounded-lg`,
  },
  
  // Badge variants
  badge: (entity: keyof typeof colors.entities) => 
    `bg-[${colors.entities[entity]}]/10 text-[${colors.entities[entity]}] px-2 py-1 rounded-md text-sm font-medium`,
    
  // Status badge variants  
  statusBadge: (status: keyof typeof colors.status) =>
    `bg-[${colors.status[status].light}] text-[${colors.status[status].main}] px-2 py-1 rounded-md text-sm font-medium`,
};

// Helper functions
export const helpers = {
  // Get entity color by name
  entityColor: getEntityColor,
  
  // Get status color by name and variant
  statusColor: getStatusColor,
  
  // Get typography settings
  typography: getTypography,
  
  // Generate button classes
  button: (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
    switch (variant) {
      case 'primary':
        return tw.primaryButton;
      case 'secondary':
        return tw.secondaryButton;
      case 'ghost':
        return tw.ghostButton;
      default:
        return tw.primaryButton;
    }
  },
  
  // Generate entity icon classes
  entityIcon: (entity: keyof typeof colors.entities) => 
    `text-[${colors.entities[entity]}]`,
};

export default {
  color,
  typography,
  space,
  radius,
  shadow,
  tw,
  components,
  helpers,
};