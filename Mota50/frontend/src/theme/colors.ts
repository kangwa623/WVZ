/**
 * World Vision Branding Colors
 * Primary Orange: PANTONE 021 (#FF6600)
 * Accent Gold: PANTONE 129
 * Accent Terra Cotta: PANTONE 1525
 */

export const colors = {
  // Primary Orange - PANTONE 021
  primary: {
    main: '#FF6600',      // Primary brand color
    light: '#FF8533',     // Light variation
    dark: '#CC5200',      // Dark variation
  },
  
  // Accent Colors (used sparingly)
  accent: {
    gold: '#D4AF37',      // PANTONE 129 (approximate)
    terraCotta: '#E07B5A', // PANTONE 1525 (approximate)
  },
  
  // Base Colors
  base: {
    black: '#000000',
    white: '#FFFFFF',
  },
  
  // Grays for UI elements
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Semantic Colors
  semantic: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
  },
  
  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#424242',
    tertiary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  
  // Border Colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },
};

export type ColorPalette = typeof colors;
