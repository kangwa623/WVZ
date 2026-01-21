import { colors } from './colors';

/**
 * Icon size constants
 */
export const iconSizes = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;

/**
 * Icon color presets aligned with World Vision branding
 */
export const iconColors = {
  primary: colors.primary.main,
  primaryLight: colors.primary.light,
  primaryDark: colors.primary.dark,
  accent: colors.accent.gold,
  text: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.tertiary,
  success: colors.semantic.success,
  error: colors.semantic.error,
  warning: colors.semantic.warning,
  info: colors.semantic.info,
  white: colors.base.white,
  black: colors.base.black,
} as const;

export type IconSize = keyof typeof iconSizes;
export type IconColor = keyof typeof iconColors;
