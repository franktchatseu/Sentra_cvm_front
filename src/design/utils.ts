// Design System Utilities
// Easy-to-use functions for accessing design tokens

import { colors, fonts, spacing, borderRadius, shadows } from './tokens';

// Color utilities
export const color = {
  sentra: {
    light: colors.sentra.light,
    main: colors.sentra.main,
    dark: colors.sentra.dark,
    darker: colors.sentra.darker,
  },
  primary: colors.primary,
  secondary: colors.secondary,
  neutral: colors.neutral,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
};

// Font utilities
export const font = {
  primary: fonts.primary.name,
  activeGrotesk: fonts.activeGrotesk.name,
  weights: fonts.weights,
  sizes: fonts.sizes,
};

// Spacing utilities
export const space = spacing;

// Border radius utilities
export const radius = borderRadius;

// Shadow utilities
export const shadow = shadows;

// CSS class generators
export const generateColorClasses = () => ({
  'sentra-text': `color: ${colors.sentra.dark}`,
  'sentra-bg': `background-color: ${colors.sentra.dark}`,
  'sentra-light-text': `color: ${colors.sentra.light}`,
  'sentra-light-bg': `background-color: ${colors.sentra.light}`,
});

// Tailwind CSS class helpers
export const tw = {
  // Sentra colors
  sentraText: `text-[${colors.sentra.main}]`,
  sentraBg: `bg-[${colors.sentra.main}]`,
  sentraLightText: `text-[${colors.sentra.light}]`,
  sentraLightBg: `bg-[${colors.sentra.light}]`,
  
  // Font families
  fontActiveGrotesk: 'font-active-grotesk',
  fontPrimary: 'font-sans',
  
  // Common combinations
  sentraButton: `bg-[${colors.sentra.main}] hover:bg-[${colors.sentra.dark}] text-white`,
  sentraButtonLight: `bg-[${colors.sentra.main}] hover:bg-[${colors.sentra.light}] text-white`,
  sentraBadge: `bg-[${colors.sentra.main}]/10 text-[${colors.sentra.main}]`,
  sentraIcon: `text-[${colors.sentra.main}]`,
};

// Export everything for easy importing
export default {
  color,
  font,
  space,
  radius,
  shadow,
  tw,
};
