import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Icon from './Icon';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconSet?: 'MaterialIcons' | 'FontAwesome' | 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconSet = 'MaterialIcons',
  iconPosition = 'left',
  fullWidth = false,
  style,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' ? colors.base.white : colors.primary.main}
          size="small"
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            iconSet={iconSet}
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            color={variant === 'primary' ? 'white' : 'primary'}
            style={styles.iconLeft}
          />
        )}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            iconSet={iconSet}
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            color={variant === 'primary' ? 'white' : 'primary'}
            style={styles.iconRight}
          />
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  button_primary: {
    backgroundColor: colors.primary.main,
  },
  button_secondary: {
    backgroundColor: colors.gray[200],
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  button_text: {
    backgroundColor: 'transparent',
  },
  button_small: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 32,
  },
  button_medium: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
  },
  button_large: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.styles.button,
    textAlign: 'center',
  },
  text_primary: {
    color: colors.base.white,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_outline: {
    color: colors.primary.main,
  },
  text_text: {
    color: colors.primary.main,
  },
  text_small: {
    fontSize: typography.fontSize.sm,
  },
  text_medium: {
    fontSize: typography.fontSize.base,
  },
  text_large: {
    fontSize: typography.fontSize.lg,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});

export default Button;
