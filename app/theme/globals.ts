export const HEIGHT = 48;
export const FONT_SIZE = 17;
export const BORDER_RADIUS = 26;
export const CORNERS = 999;

export const FONTS = {
  regular: 'GoogleSans-Regular',
  medium: 'GoogleSans-Medium',
  semiBold: 'GoogleSans-SemiBold',
  bold: 'GoogleSans-Bold',
  italic: 'GoogleSans-Italic',
  mediumItalic: 'GoogleSans-MediumItalic',
  semiBoldItalic: 'GoogleSans-SemiBoldItalic',
  boldItalic: 'GoogleSans-BoldItalic',
  logo: 'Bangers',
} as const;

export type FontFamily = (typeof FONTS)[keyof typeof FONTS];

// Standardized opacity for disabled states
export const DISABLED_OPACITY = 0.5;

// 8pt spacing grid
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Consistent animation configs
export const ANIMATION = {
  pressIn: { damping: 15, stiffness: 400, mass: 0.6 },
  pressOut: { damping: 15, stiffness: 400, mass: 0.6 },
  timing: { fast: 150, normal: 250, slow: 300 },
} as const;

// Gap constants for component spacing
export const GAP = {
  button: 8,
  section: 12,
  grid: 12,
} as const;
