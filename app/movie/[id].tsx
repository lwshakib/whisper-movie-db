import {
  fallbackMoviePoster,
  fallbackPersonImage,
  fetchMovieCredits,
  fetchMovieDetails,
  fetchSimilarMovies,
  image185,
  image500,
} from "@/TMDB/config";
import FloatingBackButton from "@/components/FloatingBackButton";
import { useFavorites } from "@/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [similar, setSimilar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(id as string);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchMovieDetails(id as string),
      fetchMovieCredits(id as string),
      fetchSimilarMovies(id as string),
    ]).then(([movieRes, creditsRes, similarRes]) => {
      setMovie(movieRes);
      setCredits(creditsRes);
      setSimilar(similarRes);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black p-4">
        {/* Poster Skeleton */}
        <View className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 animate-pulse" />
        {/* Title Skeleton */}
        <View className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        {/* Tagline Skeleton */}
        <View className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        {/* Genres Skeleton */}
        <View className="flex-row mb-4">
          <View className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse" />
          <View className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse" />
          <View className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 animate-pulse" />
        </View>
        {/* Overview Skeleton */}
        <View className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        <View className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        <View className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
        {/* Cast Skeleton */}
        <Text className="text-xl font-bold text-gray-300 dark:text-gray-600 mb-2">
          Cast
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {[...Array(6)].map((_, i) => (
            <View key={i} className="items-center mr-6 w-28">
              <View className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-800 mb-2 animate-pulse" />
              <View className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse" />
              <View className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </View>
          ))}
        </ScrollView>
        {/* Similar Movies Skeleton */}
        <Text className="text-xl font-bold text-gray-300 dark:text-gray-600 mb-2">
          Similar Movies
        </Text>
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
    );
  }

  if (!movie) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-lg text-gray-700 dark:text-gray-200">
          Movie not found.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#000000" : "#ffffff",
      }}
    >
      <FloatingBackButton />
      {/* Favorite Icon Top Right */}
      <TouchableOpacity
        onPress={() => toggleFavorite(id as string)}
        style={{ position: "absolute", top: 40, right: 24, zIndex: 50 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={36}
          color={isFavorite ? "#ef4444" : "#fff"}
        />
      </TouchableOpacity>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <StatusBar hidden />
        {/* Movie Details */}
        <View className="">
          <Image
            source={{ uri: image500(movie.poster_path) || fallbackMoviePoster }}
            className="w-full h-[600px] rounded-xl mb-4 bg-gray-200 dark:bg-gray-800"
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {movie.title}
          </Text>
          {!!movie.tagline && (
            <Text className="italic text-gray-500 dark:text-gray-400 mb-2">
              {movie.tagline}
            </Text>
          )}
          <View className="flex-row flex-wrap mb-2">
            {movie.genres?.map((g: any) => (
              <View
                key={g.id}
                className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-xs text-gray-800 dark:text-gray-200">
                  {g.name}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-gray-700 dark:text-gray-300 mb-2">
            Release: {movie.release_date} | Runtime: {movie.runtime} min |
            Rating: {movie.vote_average}
          </Text>
          <Text className="text-gray-800 dark:text-gray-200 mb-4">
            {movie.overview}
          </Text>
          <Text className="font-semibold text-gray-900 dark:text-white mb-1">
            Production
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {movie.production_companies?.map((pc: any) => (
              <View key={pc.id} className="items-center mr-4">
                <Image
                  source={{
                    uri: image185(pc.logo_path) || fallbackMoviePoster,
                  }}
                  className="w-10 h-10 mb-1 bg-gray-200 dark:bg-gray-800 rounded"
                  resizeMode="contain"
                />
                <Text
                  className="text-xs text-gray-700 dark:text-gray-200 w-16 text-center"
                  numberOfLines={2}
                >
                  {pc.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Cast Section */}
        {credits?.cast?.length > 0 && (
          <View className="mt-4 px-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Cast
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {credits.cast.slice(0, 12).map((actor: any) => (
                <TouchableOpacity
                  key={actor.id}
                  className="items-center mr-6 w-28"
                  onPress={() =>
                    router.push({
                      pathname: "/person/[id]",
                      params: { id: actor.id },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: image185(actor.profile_path) || fallbackPersonImage,
                    }}
                    className="w-28 h-28 rounded-full mb-2 bg-gray-200 dark:bg-gray-800"
                    resizeMode="cover"
                  />
                  <Text
                    className="font-semibold text-sm text-gray-900 dark:text-white text-center"
                    numberOfLines={1}
                  >
                    {actor.name}
                  </Text>
                  <Text
                    className="text-xs text-gray-500 dark:text-gray-400 text-center"
                    numberOfLines={1}
                  >
                    {actor.character}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Movies Section */}
        {similar?.results?.length > 0 && (
          <View className="mt-4 px-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Similar Movies
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similar.results.slice(0, 10).map((m: any) => (
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
                    {m.release_date?.slice(0, 4)}
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
