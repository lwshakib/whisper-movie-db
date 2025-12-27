import { useSearchHistory } from "@/context";
import { searchMovies } from "@/TMDB/config";
import { Ionicons } from "@expo/vector-icons";
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

  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryId = useRef<number>(0);

  // 🔄 Manual refetch
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
        addToHistory(query);
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

  // ✅ Debounced Search Logic
  useEffect(() => {
    if (!query.trim()) {
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

      searchMovies({ query })
        .then((res) => {
          if (latestQueryId.current === queryId) {
            setResults(res.results || []);
            setSearched(true);
            if (res.results?.length > 0) {
              addToHistory(query);
            }
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
    }, 800);

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
          onSubmitEditing={refetch}
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
          {history.length > 0 && (
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-black dark:text-white">
                Recent Searches
              </Text>
              <TouchableOpacity
                onPress={clearHistory}
                className="px-2 py-1"
                activeOpacity={0.7}
              >
                <Text className="text-xs text-red-600 font-semibold">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {history.length === 0 ? (
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
            history.map((item, index) => (
              <View
                key={`${item}-${index}`}
                className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-900"
              >
                <TouchableOpacity
                  onPress={() => {
                    setQuery(item);
                    // Trigger immediate search
                  }}
                  style={{ flex: 1 }}
                  activeOpacity={0.7}
                  className="flex-row items-center"
                >
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-base text-black dark:text-white">
                    {item}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFromHistory(item)}
                  className="ml-2 p-2"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* 🔄 Loading Skeleton */}
      {loading ? (
        <View className="w-full" style={{ flex: 1 }}>
          <View className="flex-row flex-wrap justify-between">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} className="mb-4" style={{ width: "31%" }}>
                <View className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                <View className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mt-2 animate-pulse" />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <>
          {/* ❌ No Results */}
          {!loading && searched && results.length === 0 && (
            <View className="mt-20 items-center">
              <Ionicons name="search-outline" size={64} color="#333" />
              <Text className="mt-5 text-gray-500 dark:text-gray-400 text-lg">
                No results found for "{query}"
              </Text>
            </View>
          )}

          {/* 🎥 Movie Grid */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mb-4 items-center"
                onPress={() =>
                  router.push({
                    pathname: "/movie/[id]",
                    params: { id: item.id.toString() },
                  })
                }
                activeOpacity={0.8}
                style={{ width: "31%" }}
              >
                <Image
                  source={{
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                      : "https://via.placeholder.com/185x278?text=No+Poster",
                  }}
                  className="w-full aspect-[2/3] rounded-lg bg-gray-300 dark:bg-gray-700"
                />
                <View className="w-full mt-2 px-1">
                  <Text
                    className="text-xs font-bold text-black dark:text-white mb-1"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-[10px] text-gray-600 dark:text-gray-300">
                    {item.release_date?.split("-")[0] || "N/A"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshing={refreshing}
            onRefresh={refetch}
          />
        </>
      )}
    </View>
  );
}
