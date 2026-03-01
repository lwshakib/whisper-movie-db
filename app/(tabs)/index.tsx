/**
 * Import utility functions for API calls and image formatting from TMDB config.
 */
import {
  fallbackMoviePoster,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  image500,
} from '@/TMDB/config';
/**
 * Import necessary React, Expo, and React Native components.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Interface representing a Movie object from TMDB.
 */
interface Movie {
  backdrop_path: string;
  poster_path: string;
  title: string;
  release_date: string;
  overview: string;
  id: number;
}

/**
 * SectionHeader component for displaying category titles with an 'Explore All' action.
 */
const SectionHeader: React.FC<{ title: string; onExploreAll: () => void }> = ({
  title,
  onExploreAll,
}) => (
  <View className="mb-4 mt-8 flex-row items-center justify-between px-4">
    <View className="flex-row items-center">
      {/* Decorative red pill before the title */}
      <View className="mr-3 h-6 w-1.5 rounded-full bg-red-600" />
      <Text className="text-2xl font-black tracking-tight text-black dark:text-white">{title}</Text>
    </View>
    <TouchableOpacity
      onPress={onExploreAll}
      className="rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-900"
      activeOpacity={0.7}
    >
      <Text className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
        See All
      </Text>
    </TouchableOpacity>
  </View>
);

/**
 * Main Home Tab component.
 */
export default function Tab() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // State for movie lists
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Refs for tracking initialization and list control
  const flatListRef = useRef<FlatList>(null);
  const initializedRef = useRef(false);

  // Data for the looped/infinite hero slider
  const [heroData, setHeroData] = useState<Movie[]>([]);

  /**
   * Loads movie data from the TMDB API.
   * @param isRefreshing Whether this is a pull-to-refresh action.
   */
  const loadData = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);

    try {
      // 1. Fetch Trending Movies
      const trendingRes = await fetchTrendingMovies();
      setTrendingMovies(trendingRes.results);

      /**
       * Prepare infinite-like looped data for the hero slider.
       * We take the first 5 movies and repeat them 100 times to create a large enough buffer for smooth looping.
       */
      if (trendingRes.results.length > 0) {
        const base = trendingRes.results.slice(0, 5);
        const looped = [];
        for (let i = 0; i < 100; i++) {
          looped.push(...base);
        }
        setHeroData(looped);
      }

      // Hide loading overlay before fetching secondary content for faster interactivity
      if (!isRefreshing) setLoading(false);

      // 2. Fetch Top Rated Movies
      const topRatedRes = await fetchTopRatedMovies();
      setTopRatedMovies(topRatedRes.results);

      // 3. Fetch Upcoming Movies
      const upcomingRes = await fetchUpcomingMovies();
      setUpcomingMovies(upcomingRes.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      if (!isRefreshing) setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Initial data fetch on mount.
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Sets the initial scroll position of the hero slider to the middle of the looped dataset.
   * This provides the illusion of infinite scrolling in both directions.
   */
  useEffect(() => {
    if (heroData.length > 0 && !initializedRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 250, animated: false });
        setActiveIndex(250);
        initializedRef.current = true;
      }, 100);
    }
  }, [heroData]);

  /**
   * Handler for pull-to-refresh.
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  /**
   * Implements auto-scrolling for the hero slider.
   * Advances the index every 3 seconds.
   */
  useEffect(() => {
    if (heroData.length > 0 && !loading && initializedRef.current) {
      const interval = setInterval(() => {
        const nextIndex = activeIndex + 1;
        // If we reach the end of the huge looped array, jump back to the middle quietly
        if (nextIndex >= heroData.length) {
          flatListRef.current?.scrollToIndex({ index: 250, animated: false });
          setActiveIndex(250);
        } else {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setActiveIndex(nextIndex);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeIndex, heroData, loading]);

  /**
   * Renders a single item in the hero slider.
   */
  const renderHeroItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() =>
        router.push({
          pathname: '/movie/[id]',
          params: { id: item.id.toString() },
        })
      }
      style={{ width }}
    >
      <ImageBackground
        source={{
          uri: `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`,
        }}
        className="h-[550px] w-full justify-end"
        resizeMode="cover"
      >
        {/* Gradient overlay for text contrast and premium look */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', '#000000']}
          className="absolute inset-x-0 bottom-0 h-[80%]"
        />
        <View className="mb-8 p-6">
          <View className="mb-3 self-start rounded-full bg-red-600 px-3 py-1">
            <Text className="text-[10px] font-black uppercase tracking-widest text-white">
              Trending
            </Text>
          </View>
          <Text className="mb-2 text-4xl font-black text-white" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="mb-6 text-sm leading-5 text-gray-300" numberOfLines={3}>
            {item.overview}
          </Text>
          <View className="flex-row items-center">
            {/* Primary Action Button */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/movie/[id]',
                  params: { id: item.id.toString() },
                })
              }
              className="flex-row items-center rounded-2xl bg-red-600 px-8 py-4"
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Text className="mr-2 text-base font-black text-white">Watch Now</Text>
              <Text className="text-xl text-white">▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  /**
   * Skeleton loader view shown during initial load.
   */
  if (loading) {
    return (
      <View
        className="flex-1"
        style={{
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        }}
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View className="h-[550px] w-full animate-pulse bg-gray-200 dark:bg-zinc-900" />
        <View className="p-4">
          <div className="mb-6 h-8 w-48 rounded-lg bg-gray-200 dark:bg-zinc-900" />
          <View className="flex-row">
            {[1, 2, 3].map((i) => (
              <View key={i} className="mr-4 h-60 w-40 rounded-2xl bg-gray-200 dark:bg-zinc-900" />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
      }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ef4444"
          colors={['#ef4444']}
        />
      }
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Slider Section */}
      <View>
        <FlatList
          ref={flatListRef}
          data={heroData}
          renderItem={renderHeroItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
        />
      </View>

      {/* Horizontal Trending List */}
      <SectionHeader title="Trending" onExploreAll={() => router.push('/movies/trending-movies')} />
      <FlatList
        data={trendingMovies.slice(5)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-5"
            onPress={() =>
              router.push({
                pathname: '/movie/[id]',
                params: { id: item.id.toString() },
              })
            }
          >
            <View
              className="mb-3 h-64 w-44 overflow-hidden rounded-3xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              <Image
                source={{
                  uri: image500(item.poster_path) || fallbackMoviePoster,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text className="w-44 text-base font-bold text-black dark:text-white" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.release_date?.split('-')[0]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Horizontal Top Rated List */}
      <SectionHeader
        title="Top Rated"
        onExploreAll={() => router.push('/movies/top-rated-movies')}
      />
      <FlatList
        data={topRatedMovies}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-5"
            onPress={() =>
              router.push({
                pathname: '/movie/[id]',
                params: { id: item.id.toString() },
              })
            }
          >
            <View className="mb-3 h-64 w-44 overflow-hidden rounded-3xl">
              <Image
                source={{
                  uri: image500(item.poster_path) || fallbackMoviePoster,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text className="w-44 text-base font-bold text-black dark:text-white" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.release_date?.split('-')[0]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Horizontal Coming Soon (Upcoming) List */}
      <SectionHeader
        title="Coming Soon"
        onExploreAll={() => router.push('/movies/upcoming-movies')}
      />
      <FlatList
        data={upcomingMovies}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-5"
            onPress={() =>
              router.push({
                pathname: '/movie/[id]',
                params: { id: item.id.toString() },
              })
            }
          >
            <View className="mb-3 h-64 w-44 overflow-hidden rounded-3xl">
              <Image
                source={{
                  uri: image500(item.poster_path) || fallbackMoviePoster,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text className="w-44 text-base font-bold text-black dark:text-white" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.release_date?.split('-')[0]}
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}
