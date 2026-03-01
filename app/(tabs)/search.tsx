/**
 * Import search history hook from the global context.
 * Import the searchMovies API function.
 */
import { useSearchHistory } from '@/context';
import { searchMovies } from '@/TMDB/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen width for calculation
const { width } = Dimensions.get('window');
// Grid layout constants
const numColumns = 3;
const gap = 12;
const padding = 16;
// Calculate item width based on screen width, padding, and gaps between columns
const availableWidth = width - padding * 2 - gap * (numColumns - 1);
const itemWidth = availableWidth / numColumns;

/**
 * Interface representing a Movie search result.
 */
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

/**
 * Search screen component.
 * Features debounced searching, infinite scrolling (pagination), and recent history.
 */
export default function Search() {
  // Local state for search query and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Global search history management
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Refs for debouncing and tracking the latest request ID (to prevent race conditions)
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryId = useRef<number>(0);

  // Define theme colors based on current system appearance
  const isDark = colorScheme === 'dark';
  const theme = {
    bg: isDark ? '#000000' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#9ca3af' : '#6b7280',
    inputBg: isDark ? '#1C1C1E' : '#F2F2F7',
    primary: '#ef4444',
    border: isDark ? '#2C2C2E' : '#E5E5EA',
  };

  /**
   * Performs the search API call.
   * @param text The query text.
   * @param pageNum The page number for pagination.
   */
  const performSearch = useCallback(async (text: string, pageNum = 1) => {
    // Return early if query is empty
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setPage(1);
      return;
    }

    // Unique ID for the current request to handle race conditions
    const queryId = Date.now();
    latestQueryId.current = queryId;

    if (pageNum === 1) {
      setLoading(true);
      setSearched(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await searchMovies({ query: text, page: pageNum });
      // Only update state if this is still the latest request
      if (latestQueryId.current === queryId) {
        if (pageNum === 1) {
          setResults(res.results || []);
          // Save term to search history if results found
          if (res.results?.length > 0) {
            addToHistory(text);
          }
        } else {
          // Append results for pagination
          setResults((prev) => [...prev, ...(res.results || [])]);
        }
        // Check if more pages exist
        setHasMore(pageNum < (res.total_pages || 0));
        setPage(pageNum);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (latestQueryId.current === queryId) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Effect hook to implement debounced search as the user types.
   */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Wait for 600ms of inactivity before firing the search
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  /**
   * Logic to clear the search input and results.
   */
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  /**
   * Renders a single movie item in the search results grid.
   */
  const renderItem = ({ item, index }: { item: Movie; index: number }) => (
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
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : 'https://via.placeholder.com/300x450',
          }}
          style={{
            width: itemWidth,
            height: itemWidth * 1.5,
            borderRadius: 12,
            backgroundColor: theme.inputBg,
          }}
          resizeMode="cover"
        />
        <Text numberOfLines={1} className="mt-2 text-xs font-bold" style={{ color: theme.text }}>
          {item.title}
        </Text>
        <Text className="text-[10px]" style={{ color: theme.textSecondary }}>
          {item.release_date?.split('-')[0] || 'N/A'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      {/* Search Header and Input */}
      <View className="px-4 pb-4">
        <Text className="mb-4 mt-2 text-3xl font-bold" style={{ color: theme.text }}>
          Search
        </Text>
        <View
          className="h-12 flex-row items-center rounded-xl px-3"
          style={{ backgroundColor: theme.inputBg }}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            ref={inputRef}
            className="ml-2 flex-1 font-medium"
            style={{ color: theme.text, fontSize: 16 }}
            placeholder="Search for movies, TV shows..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            selectionColor={theme.primary}
            onSubmitEditing={() => performSearch(query)}
          />
          {/* Show clear button if there is text in the input */}
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      {loading ? (
        // Loading State
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : query.trim() !== '' ? (
        // Results State
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: padding,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            // Empty State (Searched but no results found)
            !loading && searched ? (
              <View className="mt-20 items-center px-8">
                <Ionicons name="film-outline" size={64} color={theme.textSecondary} />
                <Text
                  className="mt-4 text-center text-lg font-semibold"
                  style={{ color: theme.text }}
                >
                  No movies found for &ldquo;{query}&rdquo;
                </Text>
                <Text className="mt-2 text-center text-sm" style={{ color: theme.textSecondary }}>
                  Try searching for another movie title.
                </Text>
              </View>
            ) : null
          }
          keyboardDismissMode="on-drag"
          onEndReached={() => {
            // Trigger pagination when reaching the bottom
            if (!loading && !loadingMore && hasMore) {
              performSearch(query, page + 1);
            }
          }}
          onEndReachedThreshold={2.0}
          ListFooterComponent={
            // Pagination Loader
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      ) : (
        // Initial/History State (No current search query)
        <ScrollView
          className="flex-1 px-4"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {history.length > 0 ? (
            <Animated.View entering={FadeIn.duration(400)}>
              <View className="mb-4 mt-2 flex-row items-center justify-between">
                <Text className="text-base font-bold" style={{ color: theme.text }}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={clearHistory}>
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
              {/* List of past search terms */}
              {history.map((term, index) => (
                <TouchableOpacity
                  key={`${term}-${index}`}
                  onPress={() => setQuery(term)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 16 }}>{term}</Text>
                  </View>
                  {/* Remove specific item from history */}
                  <TouchableOpacity onPress={() => removeFromHistory(term)} hitSlop={10}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </Animated.View>
          ) : (
            // Placeholder when history is empty
            <View className="mt-32 items-center opacity-50">
              <Ionicons name="search" size={64} color={theme.textSecondary} />
              <Text className="mt-4 text-base font-medium" style={{ color: theme.textSecondary }}>
                Search for your favorite movies
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
