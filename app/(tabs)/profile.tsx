import React, { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function SkeletonLoader() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const animatedStyle = {
    opacity: pulseAnim,
  };

  return (
    <ScrollView className="flex-1 bg-black p-4 pt-20" scrollEnabled={false}>
      {/* Profile Header */}
      <View className="items-center mb-6">
        <Animated.View
          style={[
            {
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#2d2d2d",
              marginBottom: 12,
            },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 140,
              height: 24,
              borderRadius: 6,
              backgroundColor: "#2d2d2d",
              marginBottom: 6,
            },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 180,
              height: 18,
              borderRadius: 6,
              backgroundColor: "#2d2d2d",
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* Stats */}
      <Animated.View
        style={[
          {
            height: 50,
            borderRadius: 12,
            backgroundColor: "#2d2d2d",
            marginBottom: 24,
            justifyContent: "center",
            alignItems: "center",
          },
          animatedStyle,
        ]}
      />

      {/* Bio */}
      <View
        className="mb-6 rounded-lg p-4"
        style={{ backgroundColor: "#2d2d2d" }}
      >
        <Animated.View
          style={[
            {
              width: 100,
              height: 22,
              borderRadius: 6,
              marginBottom: 12,
              backgroundColor: "#3b3b3b",
            },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: "100%",
              height: 60,
              borderRadius: 6,
              backgroundColor: "#3b3b3b",
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* Actions */}
      <View className="space-y-3 flex-1 gap-y-2">
        {[...Array(4)].map((_, idx) => (
          <Animated.View
            key={idx}
            style={[
              {
                height: 56,
                borderRadius: 12,
                backgroundColor: idx === 3 ? "#8b0000" : "#2d2d2d",
                marginBottom: idx === 3 ? 16 : 8,
              },
              animatedStyle,
            ]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const userData = useQuery(api.functions.getUserDetails, {
    clerkId: user?.id as string,
  });

  const handleEditProfile = () => {
    router.push("/(home)/edit-profile");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  if (!userData) {
    return <SkeletonLoader />;
  }

  return (
    <ScrollView className="flex-1 bg-black p-4 pt-20">
      {/* Profile Header */}
      <View className="items-center mb-6">
        <Image
          source={{ uri: userData?.imageUrl }}
          className="w-24 h-24 rounded-full bg-gray-900 mb-3"
        />
        <Text className="text-2xl font-bold text-white">{user?.fullName}</Text>
        <Text className="text-gray-400">
          {user?.emailAddresses[0].emailAddress}
        </Text>
      </View>

      {/* Stats */}
      <View className="bg-gray-900 rounded-lg p-4 mb-6 items-center">
        <Text className="text-lg font-semibold text-white">
          {userData?.visitedMovies?.length || 0} Movies Visited
        </Text>
      </View>

      {/* Bio */}
      <View className="mb-6 bg-gray-900 rounded-lg p-4">
        <Text className="text-lg font-semibold text-white mb-2">About</Text>
        <Text className="text-gray-300 italic">
          {userData?.bio || "No bio available"}
        </Text>
      </View>

      {/* Actions */}
      <View className="space-y-3 flex-1 gap-y-2">
        <TouchableOpacity
          onPress={handleEditProfile}
          className="flex-row items-center bg-gray-900 rounded-lg p-4"
        >
          <Ionicons name="create-outline" size={24} color="#ffffff" />
          <Text className="ml-3 text-lg text-white">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-900 rounded-lg p-4"
          onPress={() => router.push("/(home)/my-favorites")}
        >
          <Ionicons name="heart-outline" size={24} color="#ffffff" />
          <Text className="ml-3 text-lg text-white">My Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-900 rounded-lg p-4"
          onPress={() => router.push("/(home)/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          <Text className="ml-3 text-lg text-white">Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-600 rounded-lg p-4 mt-4"
        >
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
          <Text className="ml-3 text-lg text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
