import { useEffect } from 'react';
import { useSegments, Redirect } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { RootState, AppDispatch } from '@/store';
import { checkAuth } from '@/store/authSlice';
import { colors } from '@/theme';

export default function Index() {
  const segments = useSegments();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Use Redirect component instead of router.replace() to avoid timing issues
  const inAuthGroup = segments[0] === '(auth)';
  const inTabsGroup = segments[0] === '(tabs)';

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  } else if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  // Default redirect to login
  return <Redirect href="/(auth)/login" />;
}
