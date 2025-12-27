import OnBoarding from "@/components/OnBoarding";
import { useOnBoardingState } from "@/context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "../global.css";

// Keep the splash screen visible while we fetch the onboarding state
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isOnBoarding, setIsOnBoarding } = useOnBoardingState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if state is hydrated from SecureStore
    const checkHydration = async () => {
      // Small delay or check Zustand's hydration status if needed
      // Since isOnBoarding starts as null, we can wait until it's either true or false
      // If it's the very first time, it might stay null depending on how persistence is configured
      // But usually it hydrates quickly.

      // If isOnBoarding is still null after hydration, we should default it to true
      if (isOnBoarding === null) {
        setIsOnBoarding(true);
      }

      setIsReady(true);
      await SplashScreen.hideAsync();
    };

    checkHydration();
  }, [isOnBoarding, setIsOnBoarding]);

  if (!isReady) {
    return null;
  }

  if (isOnBoarding) {
    return <OnBoarding />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
