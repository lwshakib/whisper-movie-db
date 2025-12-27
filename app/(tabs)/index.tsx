import {
  fallbackMoviePoster,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  image500,
} from "@/TMDB/config";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

// Define the Movie type based on the properties used
interface Movie {
  backdrop_path: string;
  poster_path: string;
  title: string;
  release_date: string;
  overview: string;
  id: number;
}

// Helper component for section header with "Explore All" button
const SectionHeader: React.FC<{ title: string; onExploreAll: () => void }> = ({
  title,
  onExploreAll,
}) => (
  <View className="flex-row justify-between items-center px-4 mt-6 mb-2">
    <Text className="text-black dark:text-white text-xl font-bold">{title}</Text>
    <TouchableOpacity
      onPress={onExploreAll}
      className="flex-row items-center"
      activeOpacity={0.7}
    >
      <Text className="text-white font-semibold mr-1">
        Explore All
      </Text>
      {/* <FontAwesome name="arrow-right" size={14} color="white" /> */}
    </TouchableOpacity>
  </View>
);

export default function Tab() {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTrendingMovies(),
      fetchTopRatedMovies(),
      fetchUpcomingMovies(),
    ]).then(([trendingRes, topRatedRes, upcomingRes]) => {
      setTrendingMovies(trendingRes.results);
      setTopRatedMovies(topRatedRes.results);
      setUpcomingMovies(upcomingRes.results);
      setLoading(false);
    });
  }, []);

  if (loading) {
    // Skeleton loading UI
    return (
      <ScrollView
        className="flex-1 bg-white dark:bg-black"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Skeleton Hero Section */}
        <View
          className="w-full h-96 justify-end rounded-b-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
        />
        {/* Skeleton Lists */}
        {["Trending Movies", "Top Rated Movies", "Upcoming Movies"].map(
          (title, idx) => (
            <View key={title}>
              <Text className="text-black dark:text-white text-xl font-bold px-4 mt-6 mb-2">
                {title}
              </Text>
              <View className="flex-row px-4 pb-6">
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    className="mr-4 rounded-xl overflow-hidden w-40"
                  >
                    <View className="w-40 h-60 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <View className="p-2">
                      <View className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                      <View className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ paddingBottom: 92 }}
    >
      <StatusBar hidden />

      {/* Hero Section for Trending Movie */}
      {trendingMovies.length > 0 && (
        <ImageBackground
          source={{
            uri: `https://image.tmdb.org/t/p/w780${trendingMovies[0].backdrop_path}`,
          }}
          className="w-full h-96 justify-end rounded-b-3xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
            style={{ ...StyleSheet.absoluteFillObject }}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
          <View className="flex-row items-end p-5">
            <View className="relative">
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w185${trendingMovies[0].poster_path}`,
                }}
                className="w-28 h-44 rounded-xl mr-4 border-2 border-white bg-gray-200 dark:bg-gray-800"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                }}
              />
              <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-full">
                <Text className="text-xs text-white font-bold">Trending</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-white text-3xl font-extrabold mb-1 drop-shadow-lg">
                {trendingMovies[0].title}
              </Text>
              <Text className="text-gray-200 text-base mb-2 opacity-85 font-medium">
                {trendingMovies[0].release_date}
              </Text>
              <Text
                className="text-gray-100 text-base opacity-95 mb-3"
                numberOfLines={4}
              >
                {trendingMovies[0].overview}
              </Text>
              <TouchableOpacity
                className="bg-red-600 px-5 py-2 rounded-full self-start mt-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/movie/[id]",
                    params: { id: trendingMovies[0].id.toString() },
                  })
                }
              >
                <Text className="text-white text-base font-bold">▶ Watch Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      )}

      {/* Trending Movies List */}
      <SectionHeader
        title="Trending Movies"
        onExploreAll={() => router.push("/movies/trending-movies")}
      />
      <FlatList
        data={trendingMovies}
        keyExtractor={(item, index) => item.title + index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item, index }) =>
          // Skip the first movie (already shown in hero)
          index === 0 ? null : (
            <TouchableOpacity
              className="mr-4 rounded-xl overflow-hidden w-40"
              onPress={() =>
                router.push({
                  pathname: "/movie/[id]",
                  params: { id: item.id.toString() },
                })
              }
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: image500(item.poster_path) || fallbackMoviePoster,
                }}
                className="w-40 h-60 bg-gray-200 dark:bg-gray-800"
              />
              <View className="p-2">
                <Text
                  className="text-black dark:text-white text-base font-semibold"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-gray-600 dark:text-gray-300 text-xs mb-1">
                  {item.release_date}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }
      />

      {/* Top Rated Movies List */}
      <SectionHeader
        title="Top Rated Movies"
        onExploreAll={() => router.push("/movies/top-rated-movies")}
      />
      <FlatList
        data={topRatedMovies}
        keyExtractor={(item, index) => item.title + index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-4 rounded-xl overflow-hidden w-40"
            onPress={() =>
              router.push({
                pathname: "/movie/[id]",
                params: { id: item.id.toString() },
              })
            }
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: image500(item.poster_path) || fallbackMoviePoster,
              }}
              className="w-40 h-60 bg-gray-200 dark:bg-gray-800"
            />
            <View className="p-2">
              <Text
                className="text-black dark:text-white text-base font-semibold"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300 text-xs mb-1">
                {item.release_date}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Upcoming Movies List */}
      <SectionHeader
        title="Upcoming Movies"
        onExploreAll={() => router.push("/movies/upcoming-movies")}
      />
      <FlatList
        data={upcomingMovies}
        keyExtractor={(item, index) => item.title + index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-4 rounded-xl overflow-hidden w-40"
            onPress={() =>
              router.push({
                pathname: "/movie/[id]",
                params: { id: item.id.toString() },
              })
            }
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: image500(item.poster_path) || fallbackMoviePoster,
              }}
              className="w-40 h-60 bg-gray-200 dark:bg-gray-800"
            />
            <View className="p-2">
              <Text
                className="text-black dark:text-white text-base font-semibold"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300 text-xs mb-1">
                {item.release_date}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}
