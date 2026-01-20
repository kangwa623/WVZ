import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import Icon from './Icon';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  iconSet?: 'MaterialIcons' | 'FontAwesome' | 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconSet = 'MaterialIcons',
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {icon && (
          <Icon
            name={icon}
            iconSet={iconSet}
            size="medium"
            color="textSecondary"
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, style]}
          placeholderTextColor={colors.text.tertiary}
          {...textInputProps}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing[3],
    minHeight: 44,
  },
  inputContainerError: {
    borderColor: colors.semantic.error,
  },
  input: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text.primary,
    paddingVertical: spacing[2],
  },
  inputWithIcon: {
    marginLeft: spacing[2],
  },
  icon: {
    marginRight: spacing[1],
  },
  error: {
    ...typography.styles.caption,
    color: colors.semantic.error,
    marginTop: spacing[1],
  },
});

export default Input;
