import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fallbackMoviePoster, fetchTrendingMovies, image500 } from "@/TMDB/config";
import { useRouter } from "expo-router";

import FloatingBackButton from "@/components/FloatingBackButton";

const SKELETON_ITEMS = Array.from({ length: 9 }); // 3 columns * 3 rows of placeholders

// Simplified SkeletonItem using native-wind and animate-pulse
const SkeletonItem = () => (
  <View className="rounded-xl overflow-hidden w-[110px] px-2 mb-4">
    <View className="h-44 bg-gray-700 dark:bg-gray-800 animate-pulse rounded" />
    <View className="p-2">
      <View className="h-4 w-28 bg-gray-700 dark:bg-gray-700 rounded mb-2 animate-pulse" />
      <View className="h-3 w-20 bg-gray-700 dark:bg-gray-700 rounded animate-pulse" />
    </View>
  </View>
);

export default function TrendingMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const loadMovies = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNumber === 1) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }

        const res = await fetchTrendingMovies(pageNumber);

        if (res.results.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (pageNumber === 1) {
          setMovies(res.results || []);
        } else {
          setMovies((prev) => [...prev, ...(res.results || [])]);
        }

        setPage(pageNumber);
      } catch {
        alert("Failed to load movies.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFetchingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  const onRefresh = () => {
    setHasMore(true);
    loadMovies(1, true);
  };

  const onEndReached = () => {
    if (!isFetchingMore && hasMore && !refreshing) {
      loadMovies(page + 1);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-black pt-24 px-4">
        <FloatingBackButton />
        <Text className="text-white text-2xl font-bold mb-6 mt-4" >Trending Movies</Text>
        <View className="flex-row flex-wrap justify-between">
          {SKELETON_ITEMS.map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black pt-4">
      <FloatingBackButton />
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 24 }}
        ListHeaderComponent={
          <Text className="text-white text-2xl font-bold mb-3 px-4 mt-20">Trending Movies</Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/movie/[id]",
                params: { id: item.id.toString() },
              })
            }
            className="rounded-xl overflow-hidden w-[110px] mb-4"
          >
            <Image
              source={{ uri: image500(item.poster_path) || fallbackMoviePoster }}
              className="w-full h-44"
            />
            <View className="p-2 bg-[#121212]">
              <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-gray-400 text-xs">{item.release_date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
