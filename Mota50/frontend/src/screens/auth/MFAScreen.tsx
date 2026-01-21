import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import authService from '@/services/auth';
import { User } from '@/types';

const MFAScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector((state: RootState) => state.auth);
  
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [tempUser, setTempUser] = useState<User | null>(null);

  useEffect(() => {
    // Get temp user from Redux state or SecureStore
    const loadTempUser = async () => {
      // First check if user is in Redux state (set by login.fulfilled)
      if (user) {
        setTempUser(user);
        return;
      }
      
      // If not in Redux, try to get from SecureStore
      const userData = await authService.getTempUser();
      if (userData) {
        setTempUser(userData);
      } else {
        // No temp user found, redirect to login
        router.replace('/(auth)/login');
      }
    };
    
    loadTempUser();
  }, [user, router]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste
      const pastedCode = numericText.slice(0, 6).split('');
      const newCode = [...mfaCode];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setMfaCode(newCode);
      
      // Focus on the last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...mfaCode];
      newCode[index] = numericText;
      setMfaCode(newCode);

      // Auto-focus next input
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !mfaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = mfaCode.join('');
    
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    try {
      // Get email from temp user
      const email = tempUser?.email || user?.email || '';
      console.log('MFA Verification - Email:', email, 'Code:', code); // Debug
      
      if (!email) {
        console.error('MFA Verification - No email found'); // Debug
        Alert.alert('Error', 'Session expired. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      const result = await dispatch(login({
        email,
        password: 'password123', // Mock password
        mfaCode: code,
      })).unwrap();

      console.log('MFA Verification Result:', result); // Debug

      if (result.user && !result.requiresMfa) {
        // Navigate to appropriate screen based on role
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
        setMfaCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('MFA Verification Error:', err); // Debug
      Alert.alert('Verification Failed', err || 'Invalid code. Please try again.');
      // Clear the code on error
      setMfaCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    setMfaCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // Show loading state while tempUser is being loaded
  if (!tempUser && !user) {
    return null; // Will redirect in useEffect or show loading
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.containerCard}>
          <View style={styles.header}>
            <Icon
              name="local-shipping"
              size="xlarge"
              color="primary"
              iconSet="MaterialIcons"
              style={styles.logo}
            />
            <Text style={styles.title}>Mota50</Text>
            <Text style={styles.subtitle}>Fleet Management System</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.mfaContainer}>
              <Text style={styles.mfaTitle}>Enter Verification Code</Text>
              <View style={styles.mfaDescriptionContainer}>
                <Text style={styles.mfaDescription}>
                  We've sent a 6-digit verification code to
                </Text>
                <Text style={styles.emailText}>
                  {tempUser?.email || user?.email || 'your email'}
                </Text>
              </View>

              <View style={styles.codeContainer}>
                {mfaCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      error && styles.codeInputError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isLoading}
                  />
                ))}
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title="Verify"
                onPress={handleVerify}
                loading={isLoading}
                fullWidth
                icon="verified"
                iconSet="MaterialIcons"
                style={styles.verifyButton}
              />

              <TouchableOpacity
                onPress={handleResend}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <Text style={[styles.resendText, styles.resendLink]}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  containerCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[6],
    paddingTop: spacing[8],
    ...(Platform.OS === 'web' ? {
      // @ts-ignore - Web-specific style - increased shadow contrast
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    } : {
      // iOS shadow - increased contrast
      shadowColor: colors.base.black,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      // Android shadow - increased elevation
      elevation: 8,
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
    width: '100%',
  },
  logo: {
    marginBottom: spacing[1],
  },
  title: {
    ...typography.styles.h1,
    color: colors.primary.main,
    marginBottom: spacing[1],
    textAlign: 'center',
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: Platform.OS === 'android' ? '600' : typography.fontWeight.semibold,
    color: colors.primary.main,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    marginBottom: spacing[6],
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  mfaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mfaTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[6],
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
  mfaDescriptionContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  mfaDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
  emailText: {
    ...typography.styles.body,
    fontWeight: Platform.OS === 'android' ? '600' : typography.fontWeight.semibold,
    color: colors.primary.main,
    textAlign: 'center',
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing[6],
  },
  codeInput: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: typography.fontSize['2xl'],
    fontWeight: Platform.OS === 'android' ? 'bold' : typography.fontWeight.bold,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
  codeInputFilled: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  codeInputError: {
    borderColor: colors.semantic.error,
  },
  errorContainer: {
    backgroundColor: colors.semantic.error + '20',
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
    width: '100%',
  },
  errorText: {
    ...typography.styles.bodySmall,
    color: colors.semantic.error,
    textAlign: 'center',
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  verifyButton: {
    marginTop: spacing[4],
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: spacing[4],
    alignItems: 'center',
  },
  resendText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    ...(typography.fontFamily.regular && { fontFamily: typography.fontFamily.regular }),
  },
  resendLink: {
    color: colors.primary.main,
    fontWeight: Platform.OS === 'android' ? '600' : typography.fontWeight.semibold,
    textDecorationLine: 'underline',
    ...(Platform.OS === 'ios' ? { fontFamily: 'System' } : {}),
    ...(Platform.OS === 'android' ? {
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    } : {}),
  },
});

export default MFAScreen;
