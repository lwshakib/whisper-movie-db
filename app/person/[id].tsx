import {
  fallbackMoviePoster,
  fallbackPersonImage,
  fetchPersonDetails,
  fetchPersonMovies,
  image185,
  image500,
} from "@/TMDB/config";
import FloatingBackButton from "@/components/FloatingBackButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function PersonDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchPersonDetails(id as string),
      fetchPersonMovies(id as string),
    ]).then(([personRes, moviesRes]) => {
      setPerson(personRes);
      setMovies(moviesRes.cast || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <ScrollView
        className="flex-1 bg-white dark:bg-black"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile Section Skeleton */}
        <View className="items-center p-4">
          <View className="w-full h-[500px] rounded-md mb-4 bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <View className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
          <View className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
          <View className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        </View>

        {/* Movies Section Skeleton */}
        <View className="mt-4 px-4">
          <View className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...Array(4)].map((_, i) => (
              <View key={i} className="mr-4 w-36">
                <View className="w-36 h-56 rounded-lg bg-gray-200 dark:bg-gray-800 mb-2 animate-pulse" />
                <View className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
                <View className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  if (!person) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-lg text-gray-700 dark:text-gray-200">
          Person not found.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FloatingBackButton />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Profile Section */}
        <View className="items-center">
          <Image
            source={{
              uri: image500(person.profile_path) || fallbackPersonImage,
            }}
            className="w-full h-[500px] rounded-md mb-4 bg-gray-200 dark:bg-gray-800"
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {person.name}
          </Text>
          {person.also_known_as?.length > 0 && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
              {person.also_known_as.join(", ")}
            </Text>
          )}
          <Text className="text-gray-700 dark:text-gray-300 mb-1">
            {person.birthday}{" "}
            {person.place_of_birth ? `| ${person.place_of_birth}` : ""}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            {person.known_for_department}
          </Text>
          <Text className="text-gray-800 dark:text-gray-200 mb-4 text-center">
            {person.biography}
          </Text>
        </View>

        {/* Movies Section */}
        {movies.length > 0 && (
          <View className="mt-4 px-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Movies
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movies.slice(0, 20).map((m: any) => (
                <TouchableOpacity
                  key={m.id}
                  className="mr-4 w-36"
                  onPress={() =>
                    router.push({
                      pathname: "/movie/[id]",
                      params: { id: m.id },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: image185(m.poster_path) || fallbackMoviePoster,
                    }}
                    className="w-36 h-56 rounded-lg mb-2 bg-gray-200 dark:bg-gray-800"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-sm text-gray-900 dark:text-white font-semibold"
                    numberOfLines={2}
                  >
                    {m.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {m.release_date?.slice(0, 4)}{" "}
                    {m.character ? `as ${m.character}` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
