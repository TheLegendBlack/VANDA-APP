import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type ShimmerEffectProps = {
  style?: StyleProp<ViewStyle>;
};

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({ style }) => {
  const translateX = useSharedValue(-1000);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1000, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <AnimatedLinearGradient
      colors={['transparent', 'rgba(255, 215, 0, 0.3)', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[StyleSheet.absoluteFill, style, animatedStyle]}
      pointerEvents="none"
    />
  );
};
