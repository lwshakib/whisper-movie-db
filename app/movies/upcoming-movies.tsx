import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { fallbackMoviePoster, fetchUpcomingMovies, image500 } from "@/TMDB/config";
import { useRouter } from "expo-router";
import FloatingBackButton from "@/components/FloatingBackButton";

const SKELETON_ITEMS = Array.from({ length: 9 }); // 3 columns * 3 rows skeleton

export default function UpcomingMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

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

        const res = await fetchUpcomingMovies(pageNumber);

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
      } catch (error) {
        alert("Failed to load upcoming movies.");
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

  // Skeleton loader item component similar to TopRatedMovies screen
  const SkeletonItem = () => (
    <View className="rounded-xl overflow-hidden px-2">
      <View className="h-60 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <View className="p-2">
        <View className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        <View className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white dark:bg-black pt-4">
        <FloatingBackButton />
        <Text className="text-2xl font-bold mb-3 text-black dark:text-white px-4 mt-24">
          Upcoming Movies
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            paddingHorizontal: 6,
          }}
        >
          {SKELETON_ITEMS.map((_, index) => (
            <View
              key={index}
              className="w-[120px] mb-4" // fixed width, margin bottom for spacing rows
            >
              <SkeletonItem />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black pt-4">
      <FloatingBackButton />
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <Text className="text-2xl font-bold mb-3 text-black dark:text-white px-4 mt-24">
            Upcoming Movies
          </Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="py-4">
              <ActivityIndicator
                size="small"
                color={colorScheme === "dark" ? "#fff" : "#007AFF"}
              />
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
            className="rounded-xl overflow-hidden w-[110px]"
          >
            <Image
              source={{ uri: image500(item.poster_path) || fallbackMoviePoster }}
              className="w-full h-44"
            />
            <View className="p-2">
              <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-gray-300 text-xs">{item.release_date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
