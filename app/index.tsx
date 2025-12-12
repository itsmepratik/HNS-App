import Colors from '@/constants/colors';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboardingStatus();

  // Show loading indicator while we check status
  if (!isLoaded || isOnboardingLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  // If onboarding is not completed, go to onboarding
  if (!isOnboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  // If verified and signed in, go to main app
  if (isSignedIn) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  // Otherwise go to login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
