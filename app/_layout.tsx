import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {SplashScreen, Stack, useRouter, useSegments} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect, useRef} from "react";
import { ActivityIndicator, View } from "react-native";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/src/config/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.');
}

const clerkPublishableKey: string = publishableKey;

function AuthNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const identifiedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded || !posthog) return;

    if (isSignedIn && user?.id && identifiedUserId.current !== user.id) {
      const email = user.primaryEmailAddress?.emailAddress;
      posthog.identify(user.id, email ? { email } : undefined);
      identifiedUserId.current = user.id;
    } else if (!isSignedIn && identifiedUserId.current !== null) {
      posthog.reset();
      identifiedUserId.current = null;
    }
  }, [isLoaded, isSignedIn, user?.id, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (!isLoaded) return;

    const isInAuthFlow = segments[0] === '(auth)';
    if (!isSignedIn && !isInAuthFlow) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && isInAuthFlow) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router, segments]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#ea7a53" />
      </View>
    );
  }

  return <Stack screenOptions={{headerShown: false}} />;
}

export default function RootLayout() {
  const [fontsLoaded]=useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  })

  useEffect(() => {
    if(fontsLoaded){
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <AuthNavigator />
        </PostHogProvider>
      ) : (
        <AuthNavigator />
      )}
    </ClerkProvider>
  );
}
