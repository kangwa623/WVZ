import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store';
import { colors, typography, spacing } from '@/theme';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Icon from '@/components/common/Icon';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      const result = await dispatch(login({
        email,
        password,
        mfaCode: showMfa ? mfaCode : undefined,
      })).unwrap();

      if (result.user && !showMfa) {
        // If MFA is required, show MFA input
        setShowMfa(true);
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err || 'Invalid credentials');
    }
  };

  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

          {showMfa && (
            <Input
              label="MFA Code"
              placeholder="Enter MFA code"
              value={mfaCode}
              onChangeText={setMfaCode}
              keyboardType="number-pad"
              icon="security"
              iconSet="MaterialIcons"
              editable={!isLoading}
            />
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={showMfa ? "Verify & Login" : "Login"}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            icon={showMfa ? "verified" : "login"}
            iconSet="MaterialIcons"
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    marginBottom: spacing[4],
  },
  title: {
    ...typography.styles.h1,
    color: colors.primary.main,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  form: {
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
  loginButton: {
    marginTop: spacing[4],
  },
});

export default LoginScreen;
