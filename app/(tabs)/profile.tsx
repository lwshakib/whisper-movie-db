import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const router = useRouter();

  const handleEditProfile = () => {
    // router.push("/edit-profile");
    Alert.alert("Feature coming soon!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to reset all onboarding data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // In a real app we might clear Zustand state
            Alert.alert("Data reset successfully!");
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black p-4 pt-10">
      {/* Profile Header */}
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-red-600 items-center justify-center mb-3">
          <Ionicons name="person" size={50} color="white" />
        </View>
        <Text className="text-2xl font-bold text-black dark:text-white">
          Movie Lover
        </Text>
        <Text className="text-gray-500 dark:text-gray-400">
          guest@cineverse.com
        </Text>
      </View>

      {/* Stats */}
      <View className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-6 items-center">
        <Text className="text-lg font-semibold text-black dark:text-white">
          Welcome to Cineverse
        </Text>
        <Text className="text-gray-500 text-center mt-1">
          Your personal gateway to the world of cinema.
        </Text>
      </View>

      {/* Actions */}
      <View className="space-y-3 flex-1 gap-y-2">
        <TouchableOpacity
          onPress={handleEditProfile}
          className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
        >
          <Ionicons name="create-outline" size={24} color="#E50914" />
          <Text className="ml-3 text-lg text-black dark:text-white">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
          onPress={() => Alert.alert("Coming soon!")}
        >
          <Ionicons name="heart-outline" size={24} color="#E50914" />
          <Text className="ml-3 text-lg text-black dark:text-white">
            My Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
          onPress={() => Alert.alert("Coming soon!")}
        >
          <Ionicons name="notifications-outline" size={24} color="#E50914" />
          <Text className="ml-3 text-lg text-black dark:text-white">
            Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4"
          onPress={() => Alert.alert("Cineverse v1.0.0")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#E50914"
          />
          <Text className="ml-3 text-lg text-black dark:text-white">
            About App
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-600 rounded-lg p-4 mt-4"
        >
          <Ionicons name="refresh-outline" size={24} color="#ffffff" />
          <Text className="ml-3 text-lg text-white font-semibold">Reset App</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}
