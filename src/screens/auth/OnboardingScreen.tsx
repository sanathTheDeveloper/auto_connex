/**
 * OnboardingScreen Component
 *
 * Multi-slide carousel introducing Auto Connex features.
 * 3 slides: App Preview → Features → Benefits
 * Swipeable with iOS-style spring animations and pagination.
 * Responsive for web with centered max-width container.
 *
 * Now uses Dimensions event listener for proper responsive behavior
 * across mobile devices and desktop browser inspect mode.
 *
 * @example
 * <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Image,
  ScaledSize,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide, OnboardingPagination, OnboardingActions } from '../../design-system/organisms';
import { Colors } from '../../design-system/primitives';

/**
 * Calculate responsive width based on current viewport
 * Constrains to 480px max on web for mobile simulation
 */
const getResponsiveWidth = (screenWidth: number) => {
  return Platform.OS === 'web' ? Math.min(480, screenWidth) : screenWidth;
};

// Navigation types
type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Signup: undefined;
  Home: undefined;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

/**
 * Onboarding slide data with professional images from assets/images/
 */
const slideImageStyle = {
  width: '100%' as const,
  height: '100%' as const,
  resizeMode: 'cover' as const,
};

const SLIDES = [
  {
    id: 1,
    illustration: (
      <Image
        source={require('../../../assets/images/onboarding-1.jpg')}
        style={slideImageStyle}
      />
    ),
    gradientColors: [Colors.primary, Colors.tealLight] as [string, string],
    heading: 'Reach Dealers Nationwide',
    body: 'Connect with thousands of verified dealers across Australia instantly. Your inventory, seen by the right buyers.',
  },
  {
    id: 2,
    illustration: (
      <Image
        source={require('../../../assets/images/onboarding-2.png')}
        style={slideImageStyle}
      />
    ),
    gradientColors: [Colors.accent, '#FF6B8A'] as [string, string],
    heading: 'You Stay in Control',
    body: 'Review offers, negotiate prices, and approve sales on your terms. Your business, your decisions.',
  },
  {
    id: 3,
    illustration: (
      <Image
        source={require('../../../assets/images/onboarding-3.png')}
        style={slideImageStyle}
      />
    ),
    gradientColors: [Colors.success, Colors.tealMedium] as [string, string],
    heading: 'Sell Faster, Earn Better',
    body: 'Turn inventory into cash quicker with nationwide reach. More buyers viewing your stock means better offers.',
  },
];

/**
 * OnboardingScreen
 *
 * Horizontal swipe carousel with:
 * - 3 informative slides (icon + heading + body)
 * - Pagination dots indicator
 * - Skip/Next buttons (slides 1-2) or Get Started (slide 3)
 * - iOS-style spring physics for smooth animations
 * - Responsive web layout (max-width 480px, centered)
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(() => getResponsiveWidth(Dimensions.get('window').width));
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle dimension changes (resize on web, orientation on mobile)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setSlideWidth(getResponsiveWidth(window.width));
    });
    return () => subscription?.remove();
  }, []);

  /**
   * Handle scroll event to update pagination
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / slideWidth);
    setCurrentIndex(index);
  };

  /**
   * Scroll to next slide
   */
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * slideWidth,
        animated: true,
      });
    }
  };

  /**
   * Skip onboarding and go to welcome screen
   */
  const handleSkip = () => {
    navigation.replace('Welcome');
  };

  /**
   * Complete onboarding and go to welcome screen
   */
  const handleGetStarted = () => {
    navigation.replace('Welcome');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.innerContainer}>
        {/* Slides Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
          decelerationRate="fast"
          snapToInterval={slideWidth}
          snapToAlignment="center"
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {SLIDES.map((slide, index) => (
            <View key={slide.id} style={[styles.slideContainer, { width: slideWidth }]}>
              <OnboardingSlide
                illustration={slide.illustration}
                gradientColors={slide.gradientColors}
                heading={slide.heading}
                body={slide.body}
                showSkip={index < SLIDES.length - 1}
                onSkip={handleSkip}
              />
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <OnboardingPagination
          totalSlides={SLIDES.length}
          currentIndex={currentIndex}
          activeColor={Colors.primary}
          inactiveColor={Colors.greyscale300}
        />

        {/* Action Buttons */}
        <OnboardingActions
          isLastSlide={isLastSlide}
          onSkip={handleSkip}
          onNext={handleNext}
          onGetStarted={handleGetStarted}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  innerContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  slideContainer: {
    flex: 1,
  },
});

export default OnboardingScreen;
