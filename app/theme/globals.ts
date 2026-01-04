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
} as const;

export type FontFamily = (typeof FONTS)[keyof typeof FONTS];
