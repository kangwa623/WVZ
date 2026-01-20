import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Icon from '@/components/common/Icon';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      console.log('Starting login with:', { email, password: '***' }); // Debug
      const result = await dispatch(login({
        email,
        password,
      })).unwrap();

      console.log('Login result:', JSON.stringify(result, null, 2)); // Debug
      console.log('requiresMfa:', result.requiresMfa); // Debug
      console.log('user:', result.user); // Debug
      
      if (result.requiresMfa) {
        console.log('Navigating to MFA...'); // Debug
        // Navigate to MFA screen
        router.replace('/(auth)/mfa');
      } else if (result.user) {
        console.log('Login successful, navigating to tabs...'); // Debug
        // Login successful, navigate to tabs
        router.replace('/(tabs)');
      } else {
        console.warn('Unexpected login result:', result); // Debug
      }
    } catch (err: any) {
      console.error('Login error:', err); // Debug
      Alert.alert('Login Failed', err || 'Invalid credentials');
    }
  };

  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

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
          <View style={styles.inputWrapper}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="email"
              iconSet="MaterialIcons"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock"
              iconSet="MaterialIcons"
              editable={!isLoading}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to forgot password screen
              Alert.alert('Forgot Password', 'Forgot password functionality coming soon');
            }}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot password</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            icon="login"
            iconSet="MaterialIcons"
            style={styles.loginButton}
          />

          <Button
            title="Sign Up"
            onPress={() => {
              // TODO: Navigate to sign up screen
              Alert.alert('Sign Up', 'Sign up functionality coming soon');
            }}
            variant="primary"
            size="medium"
            fullWidth
            style={styles.signUpButton}
            iconSet="MaterialIcons"
          />
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
  title: {
    ...typography.styles.h1,
    color: colors.primary.main,
    marginBottom: spacing[6],
    textAlign: 'center',
    ...(typography.fontFamily.bold && { fontFamily: typography.fontFamily.bold }),
  },
  logo: {
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.main,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing[6],
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: colors.semantic.error + '20',
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.styles.bodySmall,
    color: colors.semantic.error,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
  },
  forgotPasswordText: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
    ...(typography.fontFamily.medium && { fontFamily: typography.fontFamily.medium }),
  },
  loginButton: {
    marginTop: spacing[4],
  },
  signUpButton: {
    marginTop: spacing[3],
  },
});

export default LoginScreen;
