import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";

interface TabIconProps {
  color: string;
  focused: boolean;
}

export default function TabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();

  const tabBarStyle: ViewStyle = {
    backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#ffffff",
    borderTopWidth: 0,
    height: 75,
    paddingBottom: 25,
    paddingTop: 10,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    position: "absolute",
    shadowColor: colorScheme === "dark" ? "#000" : "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colorScheme === "dark" ? 0.3 : 0.1,
    shadowRadius: 10,
    elevation: 10,
  };

  const tabBarLabelStyle: TextStyle = {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  };

  const renderTabBarButton = (
    props: BottomTabBarButtonProps
  ): React.JSX.Element => (
    <TouchableOpacity
      onPress={props.onPress}
      accessibilityState={props.accessibilityState}
      activeOpacity={1}
      style={props.style}
    >
      {props.children}
    </TouchableOpacity>
  );

  const renderHomeIcon = ({
    color,
    focused,
  }: TabIconProps): React.JSX.Element => (
    <FontAwesome size={focused ? 30 : 28} name="home" color={color} />
  );

  const renderSearchIcon = ({
    color,
    focused,
  }: TabIconProps): React.JSX.Element => (
    <FontAwesome size={focused ? 30 : 28} name="search" color={color} />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#666666" : "#999999",
        tabBarLabelStyle,
        tabBarButton: renderTabBarButton,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: renderSearchIcon,
        }}
      />
    </Tabs>
  );
}
