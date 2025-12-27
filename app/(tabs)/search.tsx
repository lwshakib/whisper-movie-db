import { api } from "@/convex/_generated/api";
import { searchMovies } from "@/TMDB/config";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createSearchItem = useMutation(api.functions.createSearchItem);
  const latestQueryId = useRef<number>(0); // ✅ Track latest query
  const getSearchHistory = useQuery(api.functions.getSearchHistory, {
    clerkId: user?.id as string,
  });
  const clearSearchHistory = useMutation(api.functions.clearSearchHistory);
  const clearAllSearches = useMutation(api.functions.clearAllSearches);

  // 🔄 Manual refetch (for search icon / pull-to-refresh)
  const refetch = async () => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const queryId = Date.now();
    latestQueryId.current = queryId;
    setLoading(true);
    setSearched(false);

    try {
      const res = await searchMovies({ query });
      if (latestQueryId.current === queryId) {
        setResults(res.results || []);
        setSearched(true);
      }
    } catch (e) {
      if (latestQueryId.current === queryId) {
        setResults([]);
        setSearched(true);
      }
    } finally {
      if (latestQueryId.current === queryId) {
        setLoading(false);
      }
    }
  };

  // 🔄 Pull-to-refresh
  const onRefresh = async () => {
    if (!query.trim()) return;
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ✅ Debounced Search Logic
  useEffect(() => {
    if (!query.trim()) {
      // Reset when query is empty
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const queryId = Date.now();
      latestQueryId.current = queryId;

      setLoading(true);
      setSearched(false);
      createSearchItem({ clerkId: user?.id as string, content: query });
      searchMovies({ query })
        .then((res) => {
          if (latestQueryId.current === queryId) {
            setResults(res.results || []);
            setSearched(true);
          }
        })
        .catch(() => {
          if (latestQueryId.current === queryId) {
            setResults([]);
            setSearched(true);
          }
        })
        .finally(() => {
          if (latestQueryId.current === queryId) {
            setLoading(false);
          }
        });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <View className="flex-1 items-center bg-white dark:bg-black px-4">
      {/* 🔍 Search Bar */}
      <View className="w-full mb-4 flex-row items-center relative mt-20">
        <TextInput
          className="flex-1 h-12 border border-gray-300 dark:border-gray-700 rounded-lg px-4 text-base bg-gray-100 dark:bg-gray-900 text-black dark:text-white pr-10"
          placeholder="Search movies..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.trim().length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            className="absolute right-3 top-0 h-12 justify-center items-center"
            style={{ width: 36 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#4B5563" />
          </TouchableOpacity>
        )}
      </View>

      {/* Show search history when query is empty */}
      {query.trim() === "" && (
        <View className="w-full mb-4">
          {(getSearchHistory?.length ?? 0) > 0 && (
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-black dark:text-white">
                Recent Searches
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await clearAllSearches({ clerkId: user?.id as string });
                }}
                className="px-2 py-1"
                activeOpacity={0.7}
              >
                <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {(getSearchHistory?.length ?? 0) === 0 ? (
            <View className="items-center py-8 opacity-60">
              <Ionicons
                name="time-outline"
                size={32}
                color="#9ca3af"
                style={{ marginBottom: 8 }}
              />
              <Text className="text-gray-400 italic text-base">
                No search history yet
              </Text>
            </View>
          ) : (
            getSearchHistory?.map((item) => (
              <View
                key={item._id}
                className="flex-row items-center py-2"
                style={{ opacity: 0.6 }}
              >
                <TouchableOpacity
                  onPress={() => setQuery(item.content)}
                  style={{ flex: 1 }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base text-black dark:text-white">
                    {item.content}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await clearSearchHistory({
                      clerkId: user?.id as string,
                      historyId: item._id,
                    });
                  }}
                  className="ml-2"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#888" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* 🔄 Loading Skeleton */}
      {loading ? (
        <View className="w-full" style={{ flex: 1 }}>
          {[0, 1].map((row) => (
            <View key={row} className="flex-row justify-between mb-4">
              {[0, 1, 2].map((col) => (
                <View
                  key={col}
                  className="flex-1 m-1 my-4 items-center bg-transparent rounded-xl p-0"
                  style={{ maxWidth: "32%" }}
                >
                  <View
                    className="w-full h-44 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"
                    style={{ aspectRatio: 2 / 3, width: "100%", maxWidth: 110 }}
                  />
                  <View className="w-full mt-2 px-1">
                    <View className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                    <View className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <>
          {/* ❌ No Results */}
          {!loading && searched && results.length === 0 && (
            <Text className="mt-5 text-gray-500 dark:text-gray-400">
              No results found.
            </Text>
          )}

          {/* 🎥 Movie Grid */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-1 m-1 my-4 items-center bg-transparent rounded-xl p-0"
                onPress={() =>
                  router.push({
                    pathname: "/movie/[id]",
                    params: { id: item.id.toString() },
                  })
                }
                activeOpacity={0.8}
                style={{ maxWidth: "32%" }}
              >
                <Image
                  source={{
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                      : "https://img.myloview.com/stickers/whitelaptop-screen-with-hd-video-technology-icon-isolated-on-grey-background-abstractcircle-random-dots-vector-illustration-400-176057922.jpg",
                  }}
                  className="w-full h-44 rounded-lg bg-gray-300 dark:bg-gray-700"
                  style={{ aspectRatio: 2 / 3, width: "100%", maxWidth: 110 }}
                />
                <View className="w-full mt-2 px-1">
                  <Text
                    className="text-xs font-bold text-black dark:text-white mb-1"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-gray-300">
                    {item.release_date}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshing={refreshing}
            onRefresh={refetch}
          />
        </>
      )}
    </View>
  );
}
