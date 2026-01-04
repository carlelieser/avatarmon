import { useColor } from '@/hooks/useColor';
import { FONT_SIZE, FONTS } from '@/theme/globals';
import React, { forwardRef } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

type TextVariant =
  | 'body'
  | 'title'
  | 'subtitle'
  | 'caption'
  | 'heading'
  | 'link';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
}

export const Text = forwardRef<RNText, TextProps>(
  (
    { variant = 'body', lightColor, darkColor, style, children, ...props },
    ref
  ) => {
    const textColor = useColor('text', { light: lightColor, dark: darkColor });
    const mutedColor = useColor('textMuted');

    const getTextStyle = (): TextStyle => {
      const baseStyle: TextStyle = {
        color: textColor,
        fontFamily: FONTS.regular,
        includeFontPadding: false, // Android: removes extra padding
        textAlignVertical: 'center', // Android: better vertical alignment
      };

      switch (variant) {
        case 'heading':
          return {
            ...baseStyle,
            fontSize: 28,
            lineHeight: 34,
            fontFamily: FONTS.bold,
          };
        case 'title':
          return {
            ...baseStyle,
            fontSize: 24,
            lineHeight: 30,
            fontFamily: FONTS.bold,
          };
        case 'subtitle':
          return {
            ...baseStyle,
            fontSize: 19,
            lineHeight: 24,
            fontFamily: FONTS.semiBold,
          };
        case 'caption':
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            lineHeight: 22,
            fontFamily: FONTS.regular,
            color: mutedColor,
          };
        case 'link':
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            lineHeight: 22,
            fontFamily: FONTS.medium,
            textDecorationLine: 'underline',
          };
        default: // 'body'
          return {
            ...baseStyle,
            fontSize: FONT_SIZE,
            lineHeight: 22,
            fontFamily: FONTS.regular,
          };
      }
    };

    return (
      <RNText ref={ref} style={[getTextStyle(), style]} {...props}>
        {children}
      </RNText>
    );
  }
);
