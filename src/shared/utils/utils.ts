//converts the tokens into usable tailwind classes
import { 
  colors, 
  fonts, 
  spacing, 
  borderRadius, 
  buttons
} from './tokens';

// Direct access to color values from tokens.ts - use these for custom styling
export const color = {
  primary: colors.primary,
  surface: colors.surface,
  status: colors.status,
  configStatus: colors.configStatus,
  text: colors.text,
  interactive: colors.interactive,
  border: colors.border,
};

// Font system with Satoshi and PP Supply Mono - includes weights, sizes, and pre-defined typography styles
export const typography = {
  primary: fonts.primary.name,
  secondary: fonts.secondary.name,
  weights: fonts.weights,
  sizes: fonts.sizes,
  semantic: fonts.typography,
};

// Spacing and border radius values for consistent layout and rounded corners
export const space = spacing;
export const radius = borderRadius;
export const button = buttons;

// Ready-to-use Tailwind CSS classes - copy and paste these directly into your className props
export const tw = {
  primaryAction: `bg-[${colors.primary.action}] text-white`,
  primaryAccent: `bg-[${colors.primary.accent}] text-black`,
  primaryBackground: `bg-[${colors.primary.background}]`,
  
  // Accent color with opacity variants
  accent10: `bg-[${colors.primary.accent}]/10`,
  accent20: `bg-[${colors.primary.accent}]/20`,
  accent30: `bg-[${colors.primary.accent}]/30`,
  accent50: `bg-[${colors.primary.accent}]/50`,
  
  surfaceCards: `bg-[${colors.surface.cards}]`,
  surfaceBackground: `bg-[${colors.surface.background}]`,
  tableHeader: `bg-[${colors.surface.tableHeader}]`,
  
  success: `text-[${colors.status.success}]`,
  danger: `text-[${colors.status.danger}]`,
  warning: `text-[${colors.status.warning}]`,
  info: `text-[${colors.status.info}]`,
  
  // Status background colors with opacity variants
  statusSuccess: `bg-[${colors.status.success}]`,
  statusDanger: `bg-[${colors.status.danger}]`,
  statusWarning: `bg-[${colors.status.warning}]`,
  statusInfo: `bg-[${colors.status.info}]`,
  
  statusSuccess10: `bg-[${colors.status.success}]/10`,
  statusDanger10: `bg-[${colors.status.danger}]/10`,
  statusWarning10: `bg-[${colors.status.warning}]/10`,
  statusInfo10: `bg-[${colors.status.info}]/10`,
  
  textPrimary: `text-[${colors.text.primary}]`,
  textSecondary: `text-[${colors.text.secondary}]`,
  textMuted: `text-[${colors.text.muted}]`,
  textInverse: `text-[${colors.text.inverse}]`,
  
  hover: `hover:bg-[${colors.interactive.hover}]`,
  active: `active:bg-[${colors.interactive.active}]`,
  focus: `focus:ring-[${colors.interactive.focus}]`,
  disabled: `disabled:bg-[${colors.interactive.disabled}]`,
  
  borderDefault: `border-[${colors.border.default}]`,
  borderAccent: `border-[${colors.border.accent}]`,
  borderMuted: `border-[${colors.border.muted}]`,
  
  fontPrimary: 'font-sans',
  fontSecondary: 'font-mono',
  
  // Typography classes using system fonts with proper line heights
  heading: 'text-3xl font-bold leading-[120%] tracking-[-0.04em]',
  subtitle: 'text-xl font-medium leading-[120%] tracking-[-0.08em]',
  cardTitle: 'text-lg font-medium leading-[120%] tracking-[-0.02em]',
  body: 'text-base font-normal leading-[130%] tracking-[0.01em]',
  bodyLong: 'text-base font-normal leading-[160%] tracking-[0.01em]',
  bodyShort: 'text-base font-normal leading-[120%] tracking-[0.01em]',
  caption: 'text-sm font-normal leading-[130%] tracking-[0.02em]',
  buttonText: 'text-sm font-medium leading-[130%] tracking-[0.02em]',
  label: 'text-xs font-medium leading-[120%] tracking-[0.05em] uppercase',
  
  button: `bg-[#252829] hover:bg-[#252829]/90 active:bg-[#252829]/80 text-white text-sm font-medium transition-colors px-6 py-2 rounded-lg`,
};

// Complete component styles - pre-built styles for common UI elements that you can use directly
export const components = {
  card: {
    default: `bg-neutral-100 border border-[#E5E7EB] rounded-2xl p-6`,
    surface: `bg-white border border-[#E5E7EB] rounded-2xl p-6`,
    elevated: `bg-neutral-100 border border-[#E5E7EB] rounded-2xl p-6`,
  },
  
  input: {
    default: `border border-[${colors.border.default}] focus:border-[${colors.interactive.focus}] bg-white text-[${colors.text.primary}] rounded-lg`,
    error: `border border-[${colors.status.danger}] focus:border-[${colors.status.danger}] bg-white text-[${colors.text.primary}] rounded-lg`,
    accent: `border border-[${colors.border.accent}] focus:border-[${colors.border.accent}] bg-white text-[${colors.text.primary}] rounded-lg`,
  },
  
  badge: {
    success: `bg-[${colors.status.success}]/10 text-[${colors.status.success}] px-2 py-1 rounded-md text-sm font-medium`,
    danger: `bg-[${colors.status.danger}]/10 text-[${colors.status.danger}] px-2 py-1 rounded-md text-sm font-medium`,
    warning: `bg-[${colors.status.warning}]/10 text-[${colors.status.warning}] px-2 py-1 rounded-md text-sm font-medium`,
    info: `bg-[${colors.status.info}]/10 text-[${colors.status.info}] px-2 py-1 rounded-md text-sm font-medium`,
    accent: `bg-[${colors.primary.accent}]/10 text-[${colors.primary.accent}] px-2 py-1 rounded-md text-sm font-medium`,
  },
};

// Helper functions for dynamic component styling - use these when you need to conditionally apply styles
export const helpers = {
  badge: (variant: 'success' | 'danger' | 'warning' | 'info' | 'accent') => {
    return components.badge[variant];
  },
};

export default {
  color,
  typography,
  space,
  radius,
  button,
  tw,
  components,
  helpers,
};