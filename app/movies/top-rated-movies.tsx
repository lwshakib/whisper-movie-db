/**
 * Import custom components for navigation and API configuration for fetching top-rated movies.
 */
import FloatingBackButton from '@/components/FloatingBackButton';
import { fallbackMoviePoster, fetchTopRatedMovies, image500 } from '@/TMDB/config';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
// Import Reanimated for smooth item entry animations.
import Animated, { FadeInDown } from 'react-native-reanimated';

// Responsive grid calculations
const { width } = Dimensions.get('window');
const numColumns = 3;
const gap = 12;
const padding = 16;
/**
 * availableWidth takes screen width minus side paddings and the total gap between columns.
 * itemWidth then divides that space by the number of columns.
 */
const availableWidth = width - padding * 2 - gap * (numColumns - 1);
const itemWidth = availableWidth / numColumns;

// Preset for skeleton loader items
const SKELETON_ITEMS = Array.from({ length: 12 });

/**
 * SkeletonItem component displays a placeholder whilst data is loading.
 */
const SkeletonItem = () => (
  <View style={{ width: itemWidth, marginBottom: 16 }}>
    <View className="mb-2 h-[180px] animate-pulse rounded-xl bg-gray-800" />
    <View className="mb-1 h-4 w-3/4 animate-pulse rounded bg-gray-800" />
    <View className="h-3 w-1/2 animate-pulse rounded bg-gray-800" />
  </View>
);

/**
 * TopRatedMovies screen component.
 * Displays a paginated grid of movies rated most highly by users.
 */
export default function TopRatedMovies() {
  const [movies, setMovies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  /**
   * Encapsulated movie loading logic to handle initial load, refresh, and pagination.
   * @param pageNumber The page to fetch from TMDB.
   * @param isRefresh Whether this action is a pull-to-refresh.
   */
  const loadMovies = useCallback(async (pageNumber: number, isRefresh = false) => {
    try {
      // Set appropriate loading states
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const res = await fetchTopRatedMovies(pageNumber);

      // If no results are returned, we've reached the end of the available list.
      if (res.results.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Reset array if refreshing, otherwise append new results.
      if (pageNumber === 1) {
        setMovies(res.results || []);
      } else {
        setMovies((prev) => [...prev, ...(res.results || [])]);
      }

      setPage(pageNumber);
    } catch {
      // Fail silently for better UX, or could implement an error state.
    } finally {
      // Reset all loading states.
      setLoading(false);
      setRefreshing(false);
      setIsFetchingMore(false);
    }
  }, []);

  /**
   * Kick off initial data load on mount.
   */
  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  /**
   * Reset pagination and reload data when user pulls down to refresh.
   */
  const onRefresh = () => {
    setHasMore(true);
    loadMovies(1, true);
  };

  /**
   * trigger pagination when the user scrolls near the bottom of the list.
   */
  const onEndReached = () => {
    if (!isFetchingMore && hasMore && !refreshing) {
      loadMovies(page + 1);
    }
  };

  /**
   * Renders an individual movie card in the grid.
   */
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={{ width: itemWidth, marginBottom: 16 }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/movie/[id]',
            params: { id: item.id.toString() },
          })
        }
      >
        {/* Movie Poster */}
        <Image
          source={{
            uri: image500(item.poster_path) || fallbackMoviePoster,
          }}
          style={{
            width: itemWidth,
            height: itemWidth * 1.5,
            borderRadius: 12,
            backgroundColor: isDark ? '#1f1f1f' : '#e5e5e5',
          }}
          resizeMode="cover"
        />
        <View className="mt-2">
          {/* Movie Title */}
          <Text
            className="text-xs font-bold text-white"
            style={{ color: isDark ? '#fff' : '#000' }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {/* Release Year */}
          <Text className="text-[10px] text-gray-400">
            {item.release_date?.split('-')[0] || 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 pt-4" style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}>
      <FloatingBackButton />

      {/* Show skeleton items if data is loading and it's not a background refresh */}
      {loading && !refreshing ? (
        <View className="mt-20 px-4">
          <Text className="mb-6 text-2xl font-bold" style={{ color: isDark ? '#fff' : '#000' }}>
            Top Rated Movies
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {SKELETON_ITEMS.map((_, index) => (
              <SkeletonItem key={index} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={numColumns}
          renderItem={renderItem}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: padding,
          }}
          contentContainerStyle={{ paddingBottom: 50, paddingTop: 80 }}
          ListHeaderComponent={
            <Text
              className="mb-6 px-4 text-2xl font-bold"
              style={{ color: isDark ? '#fff' : '#000' }}
            >
              Top Rated Movies
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#fff' : '#000'}
              colors={['#ef4444']}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={2.0} // Load next page when 2 screen-lengths from the bottom.
          ListFooterComponent={
            // Show a small loader at the bottom while fetching the next page.
            isFetchingMore ? (
              <View className="py-6">
                <ActivityIndicator size="small" color="#ef4444" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
