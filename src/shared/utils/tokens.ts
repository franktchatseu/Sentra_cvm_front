export const colors = {
  // Primary defines main brand colors and key UI elements
  primary: {
    action: "#252829", // Main buttons, CTAs
    accent: "#00BBCC", // Interactive elements, highlights 4FDFF3
    background: "#D1DCE1", // Dashboard pages
  },

  // Surface defines background colors for containers and cards
  surface: {
    cards: "#F5F5F5", // Cards and table headers (neutral-100)
    background: "#FFFFFF",
    tableHeader:
      "linear-gradient(to bottom, #394247 0%, #1F2223 70%, #2A2F31 100%)",
    tableHeaderText: "#FFFFFF",
  },

  // Gradient colors for sidebar and header
  gradients: {
    sidebar: {
      top: "#2A2F31", // Custom blend - Dark with subtle light hint (top)
      middle: "#1F2223", // NEUTRAL 900 - Deep charcoal (middle)
      bottom: "#2A2F31", // Custom blend - Dark with subtle light hint (bottom)
    },
    landing: {
      top: "#22282A", // NEUTRAL 800 - Dark blue-gray (top)
      middleLight: "#394247", // NEUTRAL 700 - Dark blue-gray
      middle: "#5F6F77", // NEUTRAL 600 - Medium-dark blue-gray
      middleDark: "#394247", // NEUTRAL 700 - Back to dark blue-gray
      bottom: "#22282A", // NEUTRAL 800 - Dark blue-gray (bottom)
    },
  },

  // Status defines colors for different message types and states
  status: {
    success: "#94DF5A", // Success messages (Green 500)
    danger: "#FC9C9C", // Error messages (Coral 500)
    warning: "#F7B430", // Warning messages (Yellow 500)
    info: "#C38BFB", // Info messages (Purple 500)
  },

  // Chart colors for distribution charts
  charts: {
    offers: {
      discount: "#C38BFB", // Purple 500
      cashback: "#FC9C9C", // Coral 500
      freeShipping: "#F7B430", // Yellow 500
      buyOneGetOne: "#94DF5A", // Green 500
      voucher: "#4FDFF3", // Cyan/Teal for voucher (different from discount)
    },
    segments: {
      dynamic: "#6B8E6B", // Lighter green (Green 600)
      static: "#B84A6B", // Lighter red/maroon (Red 600)
      trigger: "#A66B3D", // Lighter brown (Brown 600)
      hybrid: "#5B6870", // Lighter neutral (NEUTRAL 600)
    },
    campaigns: {
      active: "#94DF5A", // Green 500
      pending: "#FC9C9C", // Coral 500
      paused: "#F7B430", // Yellow 500
      completed: "#66E8FA", // Brand 400
      draft: "#6B7280", // Gray
    },
  },

  // Configuration status colors
  configStatus: {
    active: "#C38BFB", // Purple 500 - Active
    inactive: "#FC9C9C", // Coral 500 - Inactive
    draft: "#F7B430", // Yellow 500 - Draft
    default: "#94DF5A", // Green 500 - Default
  },

  // Text defines all text color variations for different content types
  text: {
    primary: "#000000", // Main headings, important text
    secondary: "#394247", // Body text, descriptions
    muted: "#6B7280", // Placeholders, disabled text
    inverse: "#FFFFFF", // Text on dark buttons/backgrounds
  },

  // Icon sizes for consistent iconography
  iconSizes: {
    xs: "w-3 h-3", // Extra small icons (12px)
    sm: "w-4 h-4", // Small icons (16px)
    lg: "w-6 h-6", // Large icons (24px)
  },

  // Interactive defines colors for user interaction states
  interactive: {
    hover: "#F3F4F6", // Hover states
    active: "#E5E7EB", // Active states
    focus: "#4FDFF3", // Focus states
    disabled: "#D1D5DB", // Disabled states
  },

  // Border defines colors for different border types and emphasis
  border: {
    default: "#E5E7EB", // Default borders
    accent: "#4FDFF3", // Accent borders
    muted: "#F3F4F6", // Subtle borders
  },
};

export const fonts = {
  // Primary font for main headings - Satoshi Variable
  primary: {
    name: "Satoshi Variable",
    fallback:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // Secondary font for sub-headings - Using Impact as primary (Et Mono fallback not available)
  secondary: {
    name: "Impact",
    fallback:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },

  // Tertiary font for card headings - PP Supply Mono
  tertiary: {
    name: "PP Supply Mono",
    fallback: 'monospace, "Courier New", Courier, monospace',
  },

  weights: {
    normal: 400,
    medium: 500,
    bold: 700,
    extraBold: 800, // For main headings
  },

  sizes: {
    caption: "0.75rem",
    small: "0.875rem",
    body: "1rem",
    bodyLg: "1.125rem",
    h6: "1rem",
    h5: "1.125rem",
    h4: "1.25rem",
    h3: "1.5rem",
    h2: "1.875rem",
    h1: "2.25rem",
    displaySm: "3rem",
    displayMd: "3.75rem",
    displayLg: "4.5rem",
    // New sizes for typography system
    mainHeading: "5.472rem", // 87.552px
    subHeading: "1.0944rem", // 17.5104px
  },

  typography: {
    // Main Headings use Satoshi Variable with weight 800
    mainHeading: {
      size: "5.472rem", // 87.552px
      weight: 800, // Extra bold
      family: "primary",
      lineHeight: "110%",
      letterSpacing: "-4%",
      fontKerning: "normal",
    },
    // Sub-headings use Impact with weight 400
    subHeading: {
      size: "1.0944rem", // 17.5104px
      weight: 400, // Normal weight
      family: "secondary",
      lineHeight: "normal",
      letterSpacing: "-8%", // -3px equivalent but percentage-based for responsiveness
      fontKerning: "normal",
    },
    heading: {
      size: "1.875rem",
      weight: 800, // Updated to extra bold to match main headings
      family: "primary",
      lineHeight: "120%",
      letterSpacing: "-4%",
    },
    subtitle: {
      size: "1.25rem",
      weight: 400, // Updated to match sub-headings
      family: "secondary",
      lineHeight: "120%",
      letterSpacing: "-8%",
    },
    cardTitle: {
      size: "1.25rem",
      weight: 500,
      family: "primary",
      lineHeight: "120%",
      letterSpacing: "-4%",
    },
    // Card headings use Satoshi Variable (different weight from main headings)
    cardHeading: {
      size: "1.125rem", // 18px
      weight: 600, // Semi-bold weight from Satoshi Variable
      family: "primary",
      lineHeight: "normal",
      letterSpacing: "0%",
      fontKerning: "normal",
    },
    // Card sub-headings use sans-serif only
    cardSubHeading: {
      size: "0.875rem", // 14px
      weight: 400, // Normal weight
      family: "sans-serif", // System sans-serif font
      lineHeight: "normal",
      letterSpacing: "0%",
      fontKerning: "normal",
    },
    // Body text uses secondary font with variable line heights
    body: {
      size: "1rem",
      weight: 400,
      family: "secondary",
      lineHeight: "130%",
      letterSpacing: "0%",
    },
    bodyShort: {
      size: "1rem",
      weight: 400,
      family: "secondary",
      lineHeight: "120%",
      letterSpacing: "0%",
    },
    bodyLong: {
      size: "1rem",
      weight: 400,
      family: "secondary",
      lineHeight: "160%",
      letterSpacing: "0%",
    },
    caption: {
      size: "0.875rem",
      weight: 400,
      family: "secondary",
      lineHeight: "130%",
      letterSpacing: "0%",
    },
    button: {
      size: "1rem",
      weight: 500, // Medium for buttons
      family: "primary",
      lineHeight: "130%",
      letterSpacing: "0%",
    },
    label: {
      size: "0.875rem",
      weight: 400, // Normal for labels
      family: "secondary",
      lineHeight: "120%",
      letterSpacing: "0%",
    },
  },
};

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
  "4xl": "6rem",
  "5xl": "8rem",
};

export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  base: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

// Button defines consistent sizing, padding, and border radius for all buttons
export const buttons = {
  action: {
    background: colors.primary.action,
    color: "#FFFFFF", // White text on dark buttons
    border: "none",
    paddingY: "0.5rem",
    paddingX: "1.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem", // text-sm (14px)
  },

  secondaryAction: {
    background: "#00BBCC",
    // color: '#000000',
    color: "#FFFFFF",
    border: "none",
    paddingY: "0.75rem",
    paddingX: "1.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem", // text-sm (14px)
  },
};

// Cards defines consistent styling for all card components
export const cards = {
  default: {
    background: colors.surface.cards,
    border: "1px solid",
    borderColor: "#374151",
    borderRadius: "1rem",
    padding: "1.5rem",
  },
};
