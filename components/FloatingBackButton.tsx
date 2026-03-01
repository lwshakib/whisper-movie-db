/**
 * Import Ionicons for the back arrow icon.
 * Import useRouter from expo-router for navigation control.
 * Import React and necessary React Native components.
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

/**
 * Props for the FloatingBackButton component.
 */
interface FloatingBackButtonProps {
  /** Optional function to call when the button is pressed. If not provided, it defaults to router.back(). */
  onPress?: () => void;
  /** Boolean to control the visibility of the button. Defaults to true. */
  visible?: boolean;
}

/**
 * A floating back button component positioned at the top-left of the screen.
 * It uses absolute positioning and a semi-transparent background.
 */
export default function FloatingBackButton({ onPress, visible = true }: FloatingBackButtonProps) {
  const router = useRouter();

  /**
   * Handles the press event.
   * Executes the custom onPress callback if provided, otherwise navigates back.
   */
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  // If the button is not visible, return null to render nothing.
  if (!visible) return null;

  return (
    /**
     * Container view with absolute positioning.
     * z-50 ensures it stays on top of other elements.
     */
    <View className="absolute left-4 top-12 z-50">
      <TouchableOpacity
        onPress={handlePress}
        // Styling using NativeWind classes for layout and colors.
        className="h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm dark:bg-white/20"
        // Inline styles for shadow effects (platform-specific).
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
