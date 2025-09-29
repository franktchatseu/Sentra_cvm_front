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
  sentra: colors.sentra,
  entities: colors.entities,
  status: colors.status,
  ui: colors.ui,
  interactive: colors.interactive,
};

export const typography = {
  primary: fonts.primary.name,
  heading: fonts.heading.name,
  weights: fonts.weights,
  sizes: fonts.sizes,
  semantic: fonts.typography,
};

export const space = spacing;
export const radius = borderRadius;
export const shadow = shadows;

export const tw = {
  brandCream: `bg-[${colors.brand.cream}]`,
  brandSage: `bg-[${colors.brand.sage}]`,
  brandMedium: `bg-[${colors.brand.medium}]`,
  brandDark: `bg-[${colors.brand.dark}]`,
  brandDarkest: `bg-[${colors.brand.darkest}]`,
  
  primaryButton: `bg-[${colors.sentra.main}] hover:bg-[${colors.sentra.hover}] active:bg-[${colors.interactive.active}] text-white font-medium transition-colors`,
  secondaryButton: `bg-[${colors.brand.sage}] hover:bg-[${colors.brand.medium}] text-white font-medium transition-colors`,
  ghostButton: `bg-transparent hover:bg-[${colors.ui.surface}] text-[${colors.ui.text.primary}] border border-[${colors.ui.border}] font-medium transition-colors`,
  
  products: `text-[${colors.entities.products}]`,
  offers: `text-[${colors.entities.offers}]`,
  campaigns: `text-[${colors.entities.campaigns}]`,
  segments: `text-[${colors.entities.segments}]`,
  users: `text-[${colors.entities.users}]`,
  analytics: `text-[${colors.entities.analytics}]`,
  configuration: `text-[${colors.entities.configuration}]`,
  
  success: `text-[${colors.status.success.main}]`,
  warning: `text-[${colors.status.warning.main}]`,
  error: `text-[${colors.status.error.main}]`,
  info: `text-[${colors.status.info.main}]`,
  
  textPrimary: `text-[${colors.ui.text.primary}]`,
  textSecondary: `text-[${colors.ui.text.secondary}]`,
  textMuted: `text-[${colors.ui.text.muted}]`,
  textInverse: `text-[${colors.ui.text.inverse}]`,
  
  surface: `bg-[${colors.ui.surface}]`,
  background: `bg-[${colors.ui.background}]`,
  
  fontPrimary: 'font-sans',
  fontHeading: 'font-space-grotesk',
  
  button: {
    primary: `bg-[${colors.sentra.main}] hover:bg-[${colors.sentra.hover}] active:bg-[${colors.interactive.active}] text-white font-medium transition-colors`,
    secondary: `bg-white hover:bg-[${colors.ui.surface}] text-[${colors.ui.text.primary}] border border-[${colors.ui.border}] font-medium transition-colors`,
    danger: `bg-[${colors.status.error.main}] hover:bg-[${colors.status.error.dark}] text-white font-medium transition-colors`,
    ghost: `bg-transparent hover:bg-[${colors.ui.surface}] text-[${colors.ui.text.primary}] border border-[${colors.ui.border}] font-medium transition-colors`,
  },
};

export const components = {
  card: {
    default: `bg-white border border-[${colors.ui.border}] rounded-xl shadow-sm`,
    surface: `bg-[${colors.ui.surface}] border border-[${colors.ui.border}] rounded-xl`,
    elevated: `bg-white border border-[${colors.ui.border}] rounded-xl shadow-lg`,
  },
  
  input: {
    default: `border border-[${colors.ui.border}] focus:border-[${colors.interactive.focus}] bg-white text-[${colors.ui.text.primary}] rounded-lg`,
    error: `border border-[${colors.status.error.main}] focus:border-[${colors.status.error.main}] bg-white text-[${colors.ui.text.primary}] rounded-lg`,
  },
  
  badge: (entity: keyof typeof colors.entities) => 
    `bg-[${colors.entities[entity]}]/10 text-[${colors.entities[entity]}] px-2 py-1 rounded-md text-sm font-medium`,
    
  statusBadge: (status: keyof typeof colors.status) =>
    `bg-[${colors.status[status].light}] text-[${colors.status[status].main}] px-2 py-1 rounded-md text-sm font-medium`,
};

export const helpers = {
  entityColor: getEntityColor,
  statusColor: getStatusColor,
  typography: getTypography,
  
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