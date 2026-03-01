/**
 * Import Ionicons for tab bar icons.
 * Import BottomTabBarButtonProps to type the custom tab button.
 * Import Haptics for tactile feedback on interaction.
 * Import Tabs from expo-router for tab-based navigation.
 * Import React and necessary components.
 * Import Reanimated for tab icon animations.
 */
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, useColorScheme, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

/**
 * AnimatedIcon component handles the micro-animations for each tab icon.
 * It scales and translates the icon and shows a dot when focused.
 */
const AnimatedIcon = ({ name, focused, color }: { name: any; focused: boolean; color: string }) => {
  /**
   * Animation for the icon itself (scaling and slight lift).
   */
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.2 : 1, {
            damping: 12,
            stiffness: 120,
          }),
        },
        {
          translateY: withSpring(focused ? -2 : 0, {
            damping: 12,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  /**
   * Animation for the small indicator dot below the icon.
   */
  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(focused ? 1 : 0, { duration: 250 }),
      transform: [
        {
          scale: withSpring(focused ? 1 : 0, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* The animated icon */}
      <Animated.View style={animatedIconStyle}>
        <Ionicons size={26} name={focused ? name : `${name}-outline`} color={color} />
      </Animated.View>
      {/* The indicator dot */}
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#ef4444',
            position: 'absolute',
            bottom: -10,
          },
          animatedDotStyle,
        ]}
      />
    </View>
  );
};

/**
 * TabLayout component defines the appearance and behavior of the bottom tab bar.
 */
export default function TabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  /**
   * Common styles for the tab bar, using a floating design.
   */
  const tabBarStyle: ViewStyle = {
    backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    borderTopWidth: 0,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 30,
    marginBottom: 25,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: colorScheme === 'dark' ? 0.4 : 0.1,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 50,
  };

  /**
   * Custom renderer for the tab buttons to add haptic feedback.
   */
  const renderTabBarButton = (props: BottomTabBarButtonProps): React.JSX.Element => {
    const { style, onPress, children, ...rest } = props;

    return (
      <TouchableOpacity
        {...(rest as any)}
        onPress={(e) => {
          // Trigger a light haptic impact on press.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        activeOpacity={0.7}
        style={[
          style as ViewStyle,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        {/* Handle both function and non-function children patterns for tab buttons. */}
        {typeof children === 'function' ? (children as any)({ pressed: false }) : children}
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#666666' : '#999999',
        tabBarShowLabel: false, // Cleaner look without text labels
        tabBarButton: renderTabBarButton,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="search" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
