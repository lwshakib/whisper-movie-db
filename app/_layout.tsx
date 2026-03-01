/**
 * Import the OnBoarding component to show if the user is new.
 * Import onboarding state context to check if onboarding has been completed.
 * Import Stack for navigation routing.
 * Import SplashScreen to manage the initial loading screen.
 * Import React hooks for lifecycle and state management.
 * Import global CSS for Tailwind/NativeWind styling.
 */
import OnBoarding from '@/components/OnBoarding';
import { useOnBoardingState } from '@/context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import '../global.css';

/**
 * Import navigation themes and StatusBar components.
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View } from 'react-native';

/**
 * Keep the splash screen visible until the application is ready.
 */
SplashScreen.preventAutoHideAsync();

/**
 * Custom dark theme configuration for React Navigation.
 * Overriding background and card colors for a true black experience.
 */
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    surface: '#000000',
  },
};

/**
 * Custom light/default theme configuration for React Navigation.
 */
const customDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
  },
};

/**
 * RootLayout component that wraps the entire application.
 * Handles onboarding detection, theme application, and navigation stack setup.
 */
export default function RootLayout() {
  const { isOnBoarding, setIsOnBoarding } = useOnBoardingState();
  const [isReady, setIsReady] = useState(false);
  const colorScheme = useColorScheme();

  /**
   * Effect to check if the app state is hydrated and ready.
   */
  useEffect(() => {
    const checkHydration = async () => {
      /**
       * If isOnBoarding is still null, it means it's the first run or state isn't set yet.
       * Default to showing onboarding (true).
       */
      if (isOnBoarding === null) {
        setIsOnBoarding(true);
      }

      // Mark the app as ready to render.
      setIsReady(true);
      // Hide the native splash screen.
      await SplashScreen.hideAsync();
    };

    checkHydration();
  }, [isOnBoarding, setIsOnBoarding]);

  /**
   * While the app is preparing, show a blank view matching the theme background.
   */
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        }}
      />
    );
  }

  /**
   * If onboarding hasn't been completed, show the OnBoarding component.
   */
  if (isOnBoarding) {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <OnBoarding />
      </>
    );
  }

  /**
   * Main application render with ThemeProvider and the Navigation Stack.
   */
  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customDefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false, // Default to hiding headers
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
          },
        }}
      />
    </ThemeProvider>
  );
}
