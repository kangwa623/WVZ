import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { iconSizes, iconColors } from './icons';

export const theme = {
  colors,
  typography,
  spacing,
  icons: {
    sizes: iconSizes,
    colors: iconColors,
  },
};

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './icons';
