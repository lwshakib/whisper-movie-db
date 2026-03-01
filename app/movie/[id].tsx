import {
  fallbackMoviePoster,
  fallbackPersonImage,
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieVideos,
  fetchSimilarMovies,
  image185,
  image500,
} from '@/TMDB/config';
import FloatingBackButton from '@/components/FloatingBackButton';
import { useFavorites } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');

const MovieInfoItem = ({ title, value }: { title: string; value: string | number }) => (
  <View className="mb-4 w-[48%] rounded-lg border-0 bg-neutral-50 p-3 dark:bg-neutral-900">
    <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {title}
    </Text>
    <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">{value || 'N/A'}</Text>
  </View>
);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [similar, setSimilar] = useState<any>(null);
  const [videos, setVideos] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(id as string);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchMovieDetails(id as string),
      fetchMovieCredits(id as string),
      fetchSimilarMovies(id as string),
      fetchMovieVideos(id as string),
    ]).then(([movieRes, creditsRes, similarRes, videosRes]) => {
      setMovie(movieRes);
      setCredits(creditsRes);
      setSimilar(similarRes);
      setVideos(videosRes);

      // Find official trailer
      const trailer = videosRes?.results?.find(
        (v: any) => v.site === 'YouTube' && v.type === 'Trailer',
      );
      // Fallback to Teaser or any video if trailer not found
      const fallbackVideo = videosRes?.results?.find((v: any) => v.site === 'YouTube');

      setTrailerKey(trailer?.key || fallbackVideo?.key || null);

      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4 dark:bg-black">
        {/* Simple loading state or continue with skeleton if preferred, specifically user asked for data so cleaner loading is fine */}
        <View className="h-full w-full items-center justify-center">
          <View className="h-16 w-16 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        </View>
      </View>
    );
  }

  if (!movie) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-gray-700 dark:text-gray-200">Movie not found.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#ffffff',
      }}
    >
      <FloatingBackButton />
      <TouchableOpacity
        onPress={() => toggleFavorite(id as string)}
        className="absolute right-4 top-12 z-50 rounded-full bg-white/20 p-3 backdrop-blur-md"
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={28}
          color={isFavorite ? '#ef4444' : '#fff'}
        />
      </TouchableOpacity>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar hidden />

        {/* Header Image Section */}
        <View className="relative h-[500px] w-full">
          <Image
            source={{ uri: image500(movie.poster_path) || fallbackMoviePoster }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', isDark ? '#000000' : '#ffffff']}
            style={{
              width: width,
              height: height * 0.4,
              position: 'absolute',
              bottom: 0,
            }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>

        {/* Title & Tagline */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="-mt-12 space-y-3 px-4"
        >
          <Text className="text-center text-3xl font-black text-gray-900 shadow-sm dark:text-white">
            {movie.title}
          </Text>
          {movie.tagline ? (
            <Text className="text-center text-sm font-medium italic text-gray-500 dark:text-gray-400">
              "{movie.tagline}"
            </Text>
          ) : null}

          {/* Genres */}
          <View className="mx-4 mt-2 flex-row flex-wrap justify-center">
            {movie.genres?.map((g: any, index: number) => (
              <View
                key={index}
                className="mb-2 mr-2 rounded-full bg-neutral-200 px-4 py-1 dark:bg-neutral-800"
              >
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {g.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Overview */}
          <Text className="mx-2 mt-2 text-center text-base font-normal leading-6 text-gray-600 dark:text-neutral-300">
            {movie.overview}
          </Text>
        </Animated.View>

        {/* Trailer */}
        {trailerKey && (
          <View className="mt-8 px-4">
            <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Official Trailer
            </Text>
            <View className="overflow-hidden rounded-2xl bg-black shadow-lg">
              <YoutubePlayer height={220} play={false} videoId={trailerKey} />
            </View>
          </View>
        )}

        {/* Info Grid */}
        <View className="mt-8 px-4">
          <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Information</Text>
          <View className="flex-row flex-wrap justify-between">
            <MovieInfoItem title="Status" value={movie.status} />
            <MovieInfoItem
              title="Release Date"
              value={movie.release_date?.split('-').reverse().join('/')}
            />
            <MovieInfoItem title="Runtime" value={`${movie.runtime} min`} />
            <MovieInfoItem title="Rating" value={`${movie.vote_average?.toFixed(1)} / 10`} />
            <MovieInfoItem
              title="Budget"
              value={movie.budget > 0 ? currencyFormatter.format(movie.budget) : 'Unknown'}
            />
            <MovieInfoItem
              title="Revenue"
              value={movie.revenue > 0 ? currencyFormatter.format(movie.revenue) : 'Unknown'}
            />
            <MovieInfoItem
              title="Original Language"
              value={movie.original_language?.toUpperCase()}
            />
            <MovieInfoItem title="Popularity" value={movie.popularity?.toFixed(0)} />
          </View>
        </View>

        {/* Production Companies */}
        {movie.production_companies?.length > 0 && (
          <View className="mt-4 px-4">
            <Text className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Production</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
              {movie.production_companies.map((pc: any) => (
                <View key={pc.id} className="mr-6 items-center">
                  <View className="mb-2 h-20 w-20 items-center justify-center rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
                    <Image
                      source={{
                        uri: image185(pc.logo_path) || fallbackMoviePoster,
                      }}
                      className="h-16 w-16"
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    className="w-20 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                    numberOfLines={2}
                  >
                    {pc.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Cast */}
        {credits?.cast?.length > 0 && (
          <View className="mt-8">
            <Text className="mb-4 px-4 text-xl font-bold text-gray-900 dark:text-white">
              Top Cast
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {credits.cast.map((actor: any, index: number) => (
                <TouchableOpacity
                  key={`${actor.id}-${index}`}
                  className="mr-4 items-center"
                  onPress={() =>
                    router.push({
                      pathname: '/person/[id]',
                      params: { id: actor.id },
                    })
                  }
                >
                  <View className="mb-2 rounded-full">
                    <Image
                      source={{
                        uri: image185(actor.profile_path) || fallbackPersonImage,
                      }}
                      className="h-20 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800"
                      resizeMode="cover"
                    />
                  </View>
                  <Text
                    className="w-24 text-center text-xs font-bold text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    {actor.name}
                  </Text>
                  <Text className="w-24 text-center text-[10px] text-gray-500" numberOfLines={1}>
                    {actor.character}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Movies */}
        {similar?.results?.length > 0 && (
          <View className="mb-8 mt-8">
            <Text className="mb-4 px-4 text-xl font-bold text-gray-900 dark:text-white">
              You might also like
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {similar.results.map((m: any, index: number) => (
                <TouchableOpacity
                  key={`${m.id}-${index}`}
                  className="mr-4 w-32"
                  onPress={() =>
                    router.push({
                      pathname: '/movie/[id]',
                      params: { id: m.id },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: image185(m.poster_path) || fallbackMoviePoster,
                    }}
                    className="mb-2 h-48 w-32 rounded-xl bg-gray-800"
                    resizeMode="cover"
                  />
                  <Text
                    className="text-xs font-bold text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    {m.title}
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
