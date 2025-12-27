import { useOnBoardingState } from "@/context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";

const { width, height } = Dimensions.get("window");

const pages = [
  {
    title: "Welcome to Cineverse",
    subtitle: "Discover thousands of movies and TV shows at your fingertips.",
    imageUrl:
      "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
  },
  {
    title: "Get Started",
    subtitle:
      "Join millions of movie lovers and start your cinematic journey today.",
    imageUrl:
      "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
];

interface DoneButtonProps {
  onPress: () => void;
}

const DoneButton: React.FC<DoneButtonProps> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.doneButton}>
    <Text style={styles.doneButtonText}>Get Started</Text>
  </TouchableOpacity>
);

interface DotComponentProps {
  selected: boolean;
}

const DotComponent: React.FC<DotComponentProps> = ({ selected }) => (
  <View style={[styles.dot, selected && styles.selectedDot]} />
);

export default function OnBoarding() {
  const { setIsOnBoarding } = useOnBoardingState();

  const handleOnboardingComplete = () => {
    setIsOnBoarding(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
        hidden
      />
      <LinearGradient colors={["#1a1a1a", "#000"]} style={styles.gradient} />
      <Onboarding
        onDone={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
        DoneButtonComponent={(props) => (
          <DoneButton {...props} onPress={handleOnboardingComplete} />
        )}
        DotComponent={DotComponent}
        pages={pages.map((page) => ({
          backgroundColor: "transparent",
          image: (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: page.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={500}
              />
            </View>
          ),
          title: page.title,
          subtitle: page.subtitle,
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        }))}
        containerStyles={styles.onboardingContainer}
        imageContainerStyles={styles.imageWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  onboardingContainer: {
    paddingTop: (StatusBar.currentHeight || 0) + 20,
  },
  imageWrapper: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.5,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
    marginHorizontal: 30,
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  doneButton: {
    backgroundColor: "#E50914",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginRight: 15,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    marginHorizontal: 4,
  },
  selectedDot: {
    backgroundColor: "#E50914",
    width: 20,
  },
});
