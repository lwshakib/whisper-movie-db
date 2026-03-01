/**
 * Import onboarding state context to manage completion status.
 * Import LinearGradient from expo-linear-gradient for smooth background transitions.
 * Import React hooks for managing refs and local state.
 * Import necessary components and Dimensions from react-native for adaptive layout.
 */
import { useOnBoardingState } from '@/context';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
/**
 * Import Reanimated for high-performance animations.
 */
import Animated, {
  FadeInUp,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// Get window width and height for screen-relative calculations.
const { width, height } = Dimensions.get('window');

/**
 * Data representing the slides in the onboarding process.
 */
const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Whisper',
    description:
      'Your ultimate destination for discovering movies, TV shows, and everything in between.',
    image: 'https://image.tmdb.org/t/p/w600_and_h900_face/cjXLrg4R7FRPFafvuQ3SSznQOd9.jpg',
  },
  {
    id: 2,
    title: 'Discover & Explore',
    description:
      'Search through millions of movies, view details, trailers, and cast information instantly.',
    image: 'https://image.tmdb.org/t/p/w600_and_h900_face/cVxVGwHce6xnW8UaVUggaPXbmoE.jpg',
  },
  {
    id: 3,
    title: 'Track Favorites',
    description: 'Save movies to your favorites list and define your personal cinematic taste.',
    image: 'https://image.tmdb.org/t/p/w600_and_h900_face/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
  },
];

/**
 * Component for a single onboarding slide.
 * Uses Reanimated to animate text based on the current scroll position.
 */
const OnBoardingItem = ({
  item,
  index,
  scrollX,
}: {
  item: any;
  index: number;
  scrollX: SharedValue<number>;
}) => {
  /**
   * Animated style for the text container.
   * Interpolates scrollX to handle opacity and vertical movement.
   */
  const animatedStyle = useAnimatedStyle(() => {
    // Define the range where the slide is entering, active, and leaving.
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    // Opacity: Fully visible when exactly at the index, invisible at neighboring indices.
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0]);

    // TranslateY: Moves from 100 towards 0 (its natural position) as it comes into view.
    const translateY = interpolate(scrollX.value, inputRange, [100, 0, 100]);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height }}>
      {/* Background image for the slide */}
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      {/* Gradient overlay to ensure text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '60%',
          justifyContent: 'flex-end',
          paddingBottom: 150,
          paddingHorizontal: 24,
        }}
      >
        <Animated.View style={animatedStyle}>
          <Text className="mb-4 text-center text-4xl font-black text-white">{item.title}</Text>
          <Text className="text-center text-base font-medium leading-6 text-gray-300">
            {item.description}
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

/**
 * Main OnBoarding component.
 * Manages the slide transitions and persistence of the onboarding state.
 */
export default function OnBoarding() {
  // Access global state setter for onboarding.
  const { setIsOnBoarding } = useOnBoardingState();
  // Ref for the horizontal FlatList.
  const flatListRef = useRef<FlatList>(null);
  // Current active slide index.
  const [currentIndex, setCurrentIndex] = useState(0);
  // Shared value to track continuous horizontal scroll position.
  const scrollX = useSharedValue(0);

  /**
   * Scroll handler to update scrollX value in real-time.
   */
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  /**
   * Logic for the 'Next' / 'Get Started' button.
   * Scrolls to the next slide or completes onboarding.
   */
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as completed in the persistent store.
      setIsOnBoarding(false);
    }
  };

  /**
   * Updates current index state when a person finishes scrolling manually.
   */
  const onMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Ensure the status bar is translucent on top of the images */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Horizontal FlatList with paging enabled for slide-by-slide scrolling */}
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({ item, index }) => (
          <OnBoardingItem item={item} index={index} scrollX={scrollX} />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
      />

      {/* Navigation Controls Overlay */}
      <View className="absolute bottom-12 z-50 w-full flex-row items-center justify-between px-6">
        {/* Pagination Indicators (Dots) */}
        <View className="flex-row space-x-2">
          {onboardingData.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'w-8 bg-red-600' : 'w-2 bg-gray-500'
                }`}
              />
            );
          })}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="overflow-hidden rounded-full bg-red-600 px-8 py-3 shadow-lg shadow-red-900"
          activeOpacity={0.8}
        >
          <Animated.Text
            key={currentIndex} // Re-animate text on index change to trigger 'entering' animation
            entering={FadeInUp.duration(300)}
            className="text-lg font-bold uppercase tracking-wide text-white"
          >
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
