import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface FloatingBackButtonProps {
  onPress?: () => void;
  visible?: boolean;
}

export default function FloatingBackButton({ onPress, visible = true }: FloatingBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute left-4 top-12 z-50">
      <TouchableOpacity
        onPress={handlePress}
        className="h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm dark:bg-white/20"
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
